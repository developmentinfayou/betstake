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
    const dealerHand = [deck[1]];
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

    res.json({
      sessionId: session._id,
      playerHands: [playerHand],
      dealerHand,
      playerTotals: [playerTotal],
      dealerTotal,
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

    const card = session.deck[0];
    session.deck = session.deck.slice(1);
    session.playerHands[session.activeHandIndex].push(card);
    await session.save();

    const playerTotal = calculateTotal(session.playerHands[session.activeHandIndex]);

    if (playerTotal > 21) {
      return res.json({
        playerHands: session.playerHands,
        dealerHand: session.dealerHand,
        playerTotals: session.playerHands.map(calculateTotal),
        dealerTotal: calculateTotal(session.dealerHand),
        bust: true,
        canHit: false,
      });
    }

    res.json({
      playerHands: session.playerHands,
      dealerHand: session.dealerHand,
      playerTotals: session.playerHands.map(calculateTotal),
      dealerTotal: calculateTotal(session.dealerHand),
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

    while (calculateTotal(session.dealerHand) < 17) {
      const card = session.deck[0];
      session.deck = session.deck.slice(1);
      session.dealerHand.push(card);
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

    const wallet = await Wallet.findOne({ userId: req.userId, currency: session.currency });
    if (wallet && payout > 0) {
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
      gameData: {},
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

export default router;
