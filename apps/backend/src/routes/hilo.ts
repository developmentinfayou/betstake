import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { HiLoSession, Bet, Wallet, SeedPair } from '@casino/database';
import { HiLoGame } from '@casino/game-engine';
import { SeedManager, generateInt } from '@casino/fairness';

const router = Router();

const gameConfig = {
  houseEdge: 1,
  minBet: { USD: 0.1, BTC: 0.00001 },
  maxBet: { USD: 10000, BTC: 1 },
  maxWin: { USD: 100000, BTC: 10 },
};

router.post('/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const { betAmount, currency } = req.body;

    if (!betAmount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingSession = await HiLoSession.findOne({ userId: req.userId, active: true });
    if (existingSession) {
      return res.status(400).json({ error: 'Active game exists. Cash out first.' });
    }

    const wallet = await Wallet.findOne({ userId: req.userId, currency });
    if (!wallet || wallet.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    wallet.balance -= betAmount;
    await wallet.save();

    const seedData = await SeedManager.reserveSeedForBetNoTx(req.userId!);
    const rngSeedData = {
      serverSeed: seedData.serverSeed,
      clientSeed: seedData.clientSeed,
      nonce: seedData.nonce,
    };
    const currentCard = generateInt(rngSeedData, 1, 13);

    const session = await HiLoSession.create({
      userId: req.userId,
      currentCard,
      cardHistory: [],
      betAmount,
      currency,
      currentMultiplier: 1,
      active: true,
      seedPairId: seedData.seedPairId,
      nonce: seedData.nonce,
    });

    // Lock seed for this game session
    await SeedManager.lockSeedForGame(req.userId!, session._id.toString());

    res.json({
      sessionId: session._id,
      currentCard,
      currentMultiplier: 1,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/predict', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId, choice } = req.body;

    const session = await HiLoSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const seedData = {
      seedPairId: session.seedPairId,
      nonce: session.nonce + session.cardHistory.length + 1,
    };

    // Get the actual seed data for RNG
    const seedPair = await SeedPair.findById(session.seedPairId);
    if (!seedPair) {
      return res.status(404).json({ error: 'Seed pair not found' });
    }

    const rngSeedData = {
      serverSeed: seedPair.serverSeed,
      clientSeed: seedPair.clientSeed,
      nonce: session.nonce + session.cardHistory.length + 1,
    };

    const nextCard = generateInt(rngSeedData, 1, 13);
    const currentCard = session.currentCard;

    let won = false;
    if (choice === 'higher') {
      won = nextCard >= currentCard; // Higher or Same
    } else if (choice === 'lower') {
      won = nextCard <= currentCard; // Lower or Same
    } else if (choice === 'skip') {
      won = true;
    }

    session.cardHistory.push(currentCard);

    if (!won) {
      session.active = false;
      await session.save();

      // Unlock seed when game ends
      await SeedManager.unlockSeedAfterGame(session._id.toString());

      const bet = await Bet.create({
        userId: req.userId,
        gameType: 'HILO',
        currency: session.currency,
        amount: session.betAmount,
        multiplier: 0,
        payout: 0,
        profit: -session.betAmount,
        won: false,
        seedPairId: session.seedPairId,
        nonce: session.nonce,
        gameData: { cardHistory: session.cardHistory, choice },
        result: { currentCard, nextCard, choice },
      });

      return res.json({
        won: false,
        gameOver: true,
        currentCard,
        nextCard,
        bet,
      });
    }

    const hiloGame = new HiLoGame(gameConfig);
    const multiplier = (hiloGame as any).calculateMultiplier(session.cardHistory.length, choice === 'skip');
    
    session.currentCard = nextCard;
    session.currentMultiplier = multiplier;
    await session.save();

    res.json({
      won: true,
      gameOver: false,
      currentCard: nextCard,
      currentMultiplier: multiplier,
      cardHistory: session.cardHistory,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/session', authenticate, async (req: AuthRequest, res) => {
  try {
    await HiLoSession.deleteMany({ userId: req.userId, active: true });
    res.json({ message: 'Active sessions cleared' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cashout', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const session = await HiLoSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.cardHistory.length === 0) {
      return res.status(400).json({ error: 'Must play at least one card' });
    }

    const payout = session.betAmount * session.currentMultiplier;
    const profit = payout - session.betAmount;

    const wallet = await Wallet.findOne({ userId: req.userId, currency: session.currency });
    if (wallet) {
      wallet.balance += payout;
      await wallet.save();
    }

    const bet = await Bet.create({
      userId: req.userId,
      gameType: 'HILO',
      currency: session.currency,
      amount: session.betAmount,
      multiplier: session.currentMultiplier,
      payout,
      profit,
      won: true,
      seedPairId: session.seedPairId,
      nonce: session.nonce,
      gameData: { cardHistory: session.cardHistory },
      result: { cashedOut: true, cardsPlayed: session.cardHistory.length },
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
      multiplier: session.currentMultiplier,
      wallet: { balance: wallet?.balance },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/probabilities/:currentCard', authenticate, async (req: AuthRequest, res) => {
  try {
    const currentCard = parseInt(req.params.currentCard);
    const { cardHistory } = req.query;
    
    if (currentCard < 1 || currentCard > 13) {
      return res.status(400).json({ error: 'Invalid card value' });
    }

    const history = cardHistory ? JSON.parse(cardHistory as string) : [];
    
    // Calculate probabilities
    const totalCardsPerValue = 4;
    const cardCounts = Array(14).fill(totalCardsPerValue);
    cardCounts[0] = 0;
    
    // Remove used cards
    history.forEach((card: number) => {
      if (card >= 1 && card <= 13) {
        cardCounts[card] = Math.max(0, cardCounts[card] - 1);
      }
    });
    
    // Remove current card
    cardCounts[currentCard] = Math.max(0, cardCounts[currentCard] - 1);
    
    const remainingCards = cardCounts.reduce((sum: number, count: number) => sum + count, 0);
    
    if (remainingCards === 0) {
      return res.json({ higherPercent: 0, lowerPercent: 0, samePercent: 0 });
    }
    
    let higherCount = 0;
    let lowerCount = 0;
    const sameCount = cardCounts[currentCard];
    
    for (let i = 1; i <= 13; i++) {
      if (i > currentCard) {
        higherCount += cardCounts[i];
      } else if (i < currentCard) {
        lowerCount += cardCounts[i];
      }
    }
    
    const higherPercent = (higherCount / remainingCards) * 100;
    const lowerPercent = (lowerCount / remainingCards) * 100;
    const samePercent = (sameCount / remainingCards) * 100;
    
    res.json({
      higherPercent: Math.round(higherPercent * 100) / 100,
      lowerPercent: Math.round(lowerPercent * 100) / 100,
      samePercent: Math.round(samePercent * 100) / 100,
      remainingCards
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
