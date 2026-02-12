import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { BlackjackSession, Bet, Wallet } from '@casino/database';
import { BlackjackGame, Card } from '@casino/game-engine';
import { SeedManager, shuffle } from '@casino/fairness';

const router = Router();

const gameConfig = {
  houseEdge: 1,
  minBet: { USD: 0.1, BTC: 0.00001 },
  maxBet: { USD: 10000, BTC: 1 },
  maxWin: { USD: 100000, BTC: 10 },
};

const createDeck = (seedData: any): Card[] => {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (let i = 0; i < 6; i++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        const value = rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank);
        deck.push({ rank, suit, value });
      }
    }
  }

  return shuffle(deck, seedData);
};

const calculateTotal = (hand: Card[]): number => {
  let total = hand.reduce((sum, card) => sum + card.value, 0);
  let aces = hand.filter(card => card.rank === 'A').length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
};

router.delete('/session', authenticate, async (req: AuthRequest, res) => {
  try {
    await BlackjackSession.deleteMany({ userId: req.userId, active: true });
    res.json({ message: 'Active sessions cleared' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const { betAmount, currency } = req.body;

    if (!betAmount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingSession = await BlackjackSession.findOne({ userId: req.userId, active: true });
    if (existingSession) {
      return res.status(400).json({ error: 'Active game exists. Complete it first.' });
    }

    const wallet = await Wallet.findOne({ userId: req.userId, currency });
    if (!wallet || wallet.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    wallet.balance -= betAmount;
    await wallet.save();

    const seedData = await SeedManager.reserveSeedForBetNoTx(req.userId!);
    const deck = createDeck(seedData);

    const playerHand = [deck[0], deck[2]];
    const dealerHand = [deck[1], deck[3]]; // Dealer gets 2 cards; second is hidden
    const remainingDeck = deck.slice(4);

    const session = await BlackjackSession.create({
      userId: req.userId,
      dealerHand,
      playerHands: [playerHand],
      activeHandIndex: 0,
      deck: remainingDeck,
      betAmount,
      currency,
      status: 'active',
      active: true,
      seedPairId: seedData.seedPairId,
      nonce: seedData.nonce,
    });

    // Lock seed for this game session
    await SeedManager.lockSeedForGame(req.userId!, session._id.toString());

    const playerTotal = calculateTotal(playerHand);
    const dealerTotal = calculateTotal(dealerHand);
    const playerBJ = playerHand.length === 2 && playerTotal === 21;
    const dealerBJ = dealerHand.length === 2 && dealerTotal === 21;

    // Handle Blackjack naturals — auto-resolve immediately
    if (playerBJ || dealerBJ) {
      let multiplier = 0;
      let won = false;

      if (playerBJ && dealerBJ) {
        multiplier = 1; // Push
      } else if (playerBJ) {
        multiplier = 2.5; // Blackjack pays 3:2
        won = true;
      } else {
        multiplier = 0; // Dealer Blackjack
      }

      const payout = betAmount * multiplier;
      const profit = payout - betAmount;

      const wallet = await Wallet.findOne({ userId: req.userId, currency });
      if (wallet && payout > 0) {
        wallet.balance += payout;
        await wallet.save();
      }

      const bet = await Bet.create({
        userId: req.userId,
        gameType: 'BLACKJACK',
        currency,
        amount: betAmount,
        multiplier,
        payout,
        profit,
        won,
        seedPairId: seedData.seedPairId,
        nonce: seedData.nonce,
        gameData: { blackjack: true },
        result: { playerTotal, dealerTotal },
      });

      session.active = false;
      session.betId = bet._id;
      await session.save();
      await SeedManager.unlockSeedAfterGame(session._id.toString());

      return res.json({
        sessionId: session._id,
        bet,
        payout,
        profit,
        multiplier,
        playerHands: [playerHand],
        dealerHand, // Show both dealer cards on natural
        playerTotals: [playerTotal],
        dealerTotal,
        won,
        blackjack: true,
        gameOver: true,
        wallet: { balance: wallet?.balance || 0 },
      });
    }

    // Normal deal — show only dealer's first card to player
    res.json({
      sessionId: session._id,
      playerHands: [playerHand],
      dealerHand: [dealerHand[0]], // Only show first card
      playerTotals: [playerTotal],
      dealerTotal: calculateTotal([dealerHand[0]]),
      canHit: playerTotal < 21,
      canDouble: true,
      canSplit: playerHand[0].rank === playerHand[1].rank,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/hit', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const session = await BlackjackSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const handIndex = session.activeHandIndex || 0;
    const card = session.deck[0];
    session.deck = session.deck.slice(1);
    session.playerHands[handIndex].push(card);

    const playerTotal = calculateTotal(session.playerHands[handIndex]);

    if (playerTotal > 21) {
      // Check if there are more split hands to play
      const nextHand = handIndex + 1;
      if (nextHand < session.playerHands.length) {
        // Move to next split hand
        session.activeHandIndex = nextHand;
        await session.save();
        return res.json({
          playerHands: session.playerHands,
          dealerHand: session.dealerHand,
          playerTotals: session.playerHands.map(calculateTotal),
          dealerTotal: calculateTotal(session.dealerHand),
          bust: true,
          bustHandIndex: handIndex,
          activeHandIndex: nextHand,
          canHit: calculateTotal(session.playerHands[nextHand]) < 21,
          canDouble: session.playerHands[nextHand].length === 2,
        });
      }

      // All hands busted — auto-resolve the game
      const allBusted = session.playerHands.every((hand: Card[]) => calculateTotal(hand) > 21);
      if (allBusted) {
        const payout = 0;
        const profit = -session.betAmount;

        const bet = await Bet.create({
          userId: req.userId,
          gameType: 'BLACKJACK',
          currency: session.currency,
          amount: session.betAmount,
          multiplier: 0,
          payout,
          profit,
          won: false,
          seedPairId: session.seedPairId,
          nonce: session.nonce,
          gameData: { busted: true },
          result: {
            playerTotals: session.playerHands.map(calculateTotal),
            dealerTotal: calculateTotal(session.dealerHand),
          },
        });

        session.active = false;
        session.betId = bet._id;
        await session.save();
        await SeedManager.unlockSeedAfterGame(session._id.toString());

        const wallet = await Wallet.findOne({ userId: req.userId, currency: session.currency });
        return res.json({
          bet,
          payout,
          profit,
          multiplier: 0,
          playerHands: session.playerHands,
          dealerHand: session.dealerHand,
          playerTotals: session.playerHands.map(calculateTotal),
          dealerTotal: calculateTotal(session.dealerHand),
          won: false,
          bust: true,
          gameOver: true,
          wallet: { balance: wallet?.balance || 0 },
        });
      }

      // Some hands busted, but need to stand to resolve remaining
      await session.save();
      return res.json({
        playerHands: session.playerHands,
        dealerHand: session.dealerHand,
        playerTotals: session.playerHands.map(calculateTotal),
        dealerTotal: calculateTotal(session.dealerHand),
        bust: true,
        bustHandIndex: handIndex,
        canHit: false,
      });
    }

    await session.save();
    res.json({
      playerHands: session.playerHands,
      dealerHand: session.dealerHand,
      playerTotals: session.playerHands.map(calculateTotal),
      dealerTotal: calculateTotal(session.dealerHand),
      activeHandIndex: handIndex,
      canHit: playerTotal < 21,
      canDouble: false,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/stand', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const session = await BlackjackSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const handIndex = session.activeHandIndex || 0;

    // If there are more split hands to play, move to the next one
    const nextHand = handIndex + 1;
    if (nextHand < session.playerHands.length) {
      session.activeHandIndex = nextHand;
      await session.save();
      return res.json({
        playerHands: session.playerHands,
        dealerHand: session.dealerHand,
        playerTotals: session.playerHands.map(calculateTotal),
        dealerTotal: calculateTotal(session.dealerHand),
        activeHandIndex: nextHand,
        canHit: calculateTotal(session.playerHands[nextHand]) < 21,
        canDouble: session.playerHands[nextHand].length === 2,
        canSplit: session.playerHands[nextHand].length === 2 &&
          session.playerHands[nextHand][0].rank === session.playerHands[nextHand][1].rank &&
          session.playerHands.length < 4,
      });
    }

    // All hands have been played — dealer draws to 17
    while (calculateTotal(session.dealerHand) < 17) {
      const card = session.deck[0];
      session.deck = session.deck.slice(1);
      session.dealerHand.push(card);
    }

    const dealerTotal = calculateTotal(session.dealerHand);
    const betPerHand = session.betAmount / session.playerHands.length;

    // Resolve each hand against the dealer
    let totalPayout = 0;
    let anyWon = false;
    const handResults = session.playerHands.map((hand: Card[], i: number) => {
      const playerTotal = calculateTotal(hand);
      let handMultiplier = 0;
      let handWon = false;

      if (playerTotal > 21) {
        handMultiplier = 0; // Busted
      } else if (hand.length === 2 && playerTotal === 21) {
        // Blackjack on a split hand pays 1:1 (not 3:2) per standard rules
        handMultiplier = 2;
        handWon = true;
      } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
        handMultiplier = 2;
        handWon = true;
      } else if (playerTotal === dealerTotal) {
        handMultiplier = 1; // Push
      }

      const handPayout = betPerHand * handMultiplier;
      totalPayout += handPayout;
      if (handWon) anyWon = true;

      return { handIndex: i, playerTotal, multiplier: handMultiplier, payout: handPayout, won: handWon };
    });

    const totalProfit = totalPayout - session.betAmount;
    const overallMultiplier = session.betAmount > 0 ? totalPayout / session.betAmount : 0;

    const wallet = await Wallet.findOne({ userId: req.userId, currency: session.currency });
    if (wallet && totalPayout > 0) {
      wallet.balance += totalPayout;
      await wallet.save();
    }

    const bet = await Bet.create({
      userId: req.userId,
      gameType: 'BLACKJACK',
      currency: session.currency,
      amount: session.betAmount,
      multiplier: overallMultiplier,
      payout: totalPayout,
      profit: totalProfit,
      won: anyWon,
      seedPairId: session.seedPairId,
      nonce: session.nonce,
      gameData: { handResults, split: session.playerHands.length > 1 },
      result: {
        playerTotals: session.playerHands.map(calculateTotal),
        dealerTotal
      },
    });

    session.active = false;
    session.betId = bet._id;
    await session.save();

    // Unlock seed when game ends
    await SeedManager.unlockSeedAfterGame(session._id.toString());

    res.json({
      bet,
      payout: totalPayout,
      profit: totalProfit,
      multiplier: overallMultiplier,
      handResults,
      playerHands: session.playerHands,
      dealerHand: session.dealerHand,
      playerTotals: session.playerHands.map(calculateTotal),
      dealerTotal,
      won: anyWon,
      gameOver: true,
      wallet: { balance: wallet?.balance },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/double', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const session = await BlackjackSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.playerHands[0].length !== 2) {
      return res.status(400).json({ error: 'Can only double on first two cards' });
    }

    const wallet = await Wallet.findOne({ userId: req.userId, currency: session.currency });
    if (!wallet || wallet.balance < session.betAmount) {
      return res.status(400).json({ error: 'Insufficient balance for double' });
    }

    wallet.balance -= session.betAmount;
    await wallet.save();

    session.betAmount *= 2;

    const card = session.deck[0];
    session.deck = session.deck.slice(1);
    session.playerHands[0].push(card);

    while (calculateTotal(session.dealerHand) < 17) {
      const dealerCard = session.deck[0];
      session.deck = session.deck.slice(1);
      session.dealerHand.push(dealerCard);
    }

    const playerTotal = calculateTotal(session.playerHands[0]);
    const dealerTotal = calculateTotal(session.dealerHand);

    let multiplier = 0;
    let won = false;

    if (playerTotal > 21) {
      multiplier = 0;
    } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
      multiplier = 2;
      won = true;
    } else if (playerTotal === dealerTotal) {
      multiplier = 1;
    }

    const payout = session.betAmount * multiplier;
    const profit = payout - session.betAmount;

    if (payout > 0) {
      wallet.balance += payout;
      await wallet.save();
    }

    const bet = await Bet.create({
      userId: req.userId,
      gameType: 'BLACKJACK',
      currency: session.currency,
      amount: session.betAmount,
      multiplier,
      payout,
      profit,
      won,
      seedPairId: session.seedPairId,
      nonce: session.nonce,
      gameData: { doubled: true },
      result: { playerTotal, dealerTotal },
    });

    session.active = false;
    session.betId = bet._id;
    await session.save();

    // Unlock seed when game ends
    await SeedManager.unlockSeedAfterGame(session._id.toString());

    res.json({
      bet,
      payout,
      profit,
      multiplier,
      playerHands: session.playerHands,
      dealerHand: session.dealerHand,
      playerTotals: [playerTotal],
      dealerTotal,
      won,
      wallet: { balance: wallet.balance },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/split', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const session = await BlackjackSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const handIndex = session.activeHandIndex || 0;
    const currentHand = session.playerHands[handIndex];

    // Validate split conditions
    if (currentHand.length !== 2) {
      return res.status(400).json({ error: 'Can only split on first two cards' });
    }
    if (currentHand[0].rank !== currentHand[1].rank) {
      return res.status(400).json({ error: 'Can only split matching cards' });
    }
    if (session.playerHands.length >= 4) {
      return res.status(400).json({ error: 'Maximum 4 hands allowed' });
    }

    // Deduct additional bet for the new hand
    const wallet = await Wallet.findOne({ userId: req.userId, currency: session.currency });
    const splitBetAmount = session.betAmount / session.playerHands.length; // Original per-hand bet
    if (!wallet || wallet.balance < splitBetAmount) {
      return res.status(400).json({ error: 'Insufficient balance for split' });
    }

    wallet.balance -= splitBetAmount;
    await wallet.save();

    // Increase total bet
    session.betAmount += splitBetAmount;

    // Split the hand: take second card to new hand
    const card1 = currentHand[0];
    const card2 = currentHand[1];

    // Deal one new card to each split hand
    const newCard1 = session.deck[0];
    const newCard2 = session.deck[1];
    session.deck = session.deck.slice(2);

    // Replace current hand and add new hand
    session.playerHands[handIndex] = [card1, newCard1];
    session.playerHands.splice(handIndex + 1, 0, [card2, newCard2]);

    // Set active hand to first split hand
    session.activeHandIndex = handIndex;
    await session.save();

    const playerTotals = session.playerHands.map(calculateTotal);

    res.json({
      playerHands: session.playerHands,
      dealerHand: session.dealerHand,
      playerTotals,
      dealerTotal: calculateTotal(session.dealerHand),
      activeHandIndex: handIndex,
      canHit: playerTotals[handIndex] < 21,
      canDouble: true,
      canSplit: session.playerHands[handIndex][0].rank === session.playerHands[handIndex][1].rank && session.playerHands.length < 4,
      split: true,
      wallet: { balance: wallet.balance },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
