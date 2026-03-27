import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { RushSession, Bet, Wallet } from '@casino/database';
import { generateCrashPoint, RUSH_STEPS, RushDifficulty } from '@casino/game-engine/games/rush';
import { SeedManager } from '@casino/fairness';

const router = Router();

router.post('/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const { betAmount, currency, difficulty } = req.body;

    if (!betAmount || !currency || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!RUSH_STEPS[difficulty as RushDifficulty]) {
      return res.status(400).json({ error: 'Invalid difficulty' });
    }

    const existingSession = await RushSession.findOne({ userId: req.userId, active: true });
    if (existingSession) {
      return res.status(400).json({ error: 'Active game exists. Cash out or finish it first.' });
    }

    const wallet = await Wallet.findOne({ userId: req.userId, currency });
    if (!wallet || wallet.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    wallet.balance -= betAmount;
    await wallet.save();

    const seedData = await SeedManager.reserveSeedForBetNoTx(req.userId!);
    
    // Provably fair generation of crash point
    const crashPoint = generateCrashPoint(seedData);

    const session = await RushSession.create({
      userId: req.userId,
      betAmount,
      currency,
      difficulty,
      stepsPassed: 0,
      currentMultiplier: 1.00,
      crashPoint,
      active: true,
      seedPairId: seedData.seedPairId,
      nonce: seedData.nonce,
    });

    // Lock seed for this game session
    await SeedManager.lockSeedForGame(req.userId!, session._id.toString(), 'Rush');

    res.json({
      sessionId: session._id,
      difficulty,
      currentMultiplier: 1.00,
      stepsPassed: 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/next', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const session = await RushSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found or already finished' });
    }

    const stepsArray = RUSH_STEPS[session.difficulty as RushDifficulty];
    const maxSteps = stepsArray.length - 1;

    if (session.stepsPassed >= maxSteps) {
      return res.status(400).json({ error: 'Max steps reached. Please cash out.' });
    }

    const nextStepIndex = session.stepsPassed + 1;
    const nextMultiplier = stepsArray[nextStepIndex];

    // Check if player busted
    if (nextMultiplier > session.crashPoint) {
      session.active = false;
      session.stepsPassed = nextStepIndex;
      session.currentMultiplier = 0; // Busted
      await session.save();

      // Unlock seed when game ends
      await SeedManager.unlockSeedAfterGame(session._id.toString());

      const bet = await Bet.create({
        userId: req.userId,
        gameType: 'RUSH',
        currency: session.currency,
        amount: session.betAmount,
        multiplier: 0,
        payout: 0,
        profit: -session.betAmount,
        status: 'LOST',
        won: false,
        seedPairId: session.seedPairId,
        nonce: session.nonce,
        gameData: { difficulty: session.difficulty, stepsPassed: nextStepIndex, crashPoint: session.crashPoint },
        result: { busted: true, crashedAtStep: nextStepIndex, crashedAtMultiplier: nextMultiplier, actualCrashPoint: session.crashPoint },
      });

      return res.json({
        safe: false,
        gameOver: true,
        busted: true,
        crashPoint: session.crashPoint,
        bet,
      });
    }

    // Player survived this step
    session.stepsPassed = nextStepIndex;
    session.currentMultiplier = nextMultiplier;
    await session.save();

    res.json({
      safe: true,
      gameOver: false,
      currentMultiplier: nextMultiplier,
      stepsPassed: nextStepIndex,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cashout', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const session = await RushSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
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
      gameType: 'RUSH',
      currency: session.currency,
      amount: session.betAmount,
      multiplier: session.currentMultiplier,
      payout,
      profit,
      status: 'WON',
      won: true,
      seedPairId: session.seedPairId,
      nonce: session.nonce,
      gameData: { difficulty: session.difficulty, stepsPassed: session.stepsPassed, crashPoint: session.crashPoint },
      result: { cashedOut: true, stepsPassed: session.stepsPassed },
    });

    session.active = false;
    session.betId = bet._id.toString();
    await session.save();

    // Unlock seed when game ends
    await SeedManager.unlockSeedAfterGame(session._id.toString());

    res.json({
      bet,
      payout,
      profit,
      multiplier: session.currentMultiplier,
      crashPoint: session.crashPoint, // Reveal crash point on cashout
      wallet: { balance: wallet?.balance },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get active session for recovery on page refresh
router.get('/active-session', authenticate, async (req: AuthRequest, res) => {
  try {
    const session = await RushSession.findOne({ userId: req.userId, active: true });
    if (!session) {
      return res.json({ hasActiveSession: false });
    }

    res.json({
      hasActiveSession: true,
      sessionId: session._id,
      currentMultiplier: session.currentMultiplier,
      stepsPassed: session.stepsPassed,
      difficulty: session.difficulty,
      betAmount: session.betAmount,
      currency: session.currency,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clear session (creates loss records)
router.delete('/session', authenticate, async (req: AuthRequest, res) => {
  try {
    const sessions = await RushSession.find({ userId: req.userId, active: true });
    for (const session of sessions) {
      session.active = false;
      await session.save();

      await Bet.create({
        userId: req.userId,
        gameType: 'RUSH',
        currency: session.currency,
        amount: session.betAmount,
        multiplier: 0,
        payout: 0,
        profit: -session.betAmount,
        status: 'LOST',
        won: false,
        seedPairId: session.seedPairId,
        nonce: session.nonce,
        gameData: { difficulty: session.difficulty, stepsPassed: session.stepsPassed },
        result: { forfeited: true, cleanedUp: true },
      });

      await SeedManager.unlockSeedAfterGame(session._id.toString());
    }
    res.json({ message: 'Active sessions cleared' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
