import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { BalloonSession, Bet, Wallet } from '@casino/database';
import { generateBurstPoint, PUMP_STEPS, PumpDifficulty } from '@casino/game-engine/games/balloon';
import { SeedManager } from '@casino/fairness';

const router = Router();

// ── Manual Mode: Start a new Pump session ──────────────────────────────
router.post('/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const { betAmount, currency, difficulty } = req.body;

    if (!betAmount || !currency || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!PUMP_STEPS[difficulty as PumpDifficulty]) {
      return res.status(400).json({ error: 'Invalid difficulty' });
    }

    const existingSession = await BalloonSession.findOne({ userId: req.userId, active: true });
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

    // Provably fair generation of burst point
    const burstPoint = generateBurstPoint(seedData);

    const session = await BalloonSession.create({
      userId: req.userId,
      betAmount,
      currency,
      difficulty,
      pumpsPassed: 0,
      currentMultiplier: 1.00,
      burstPoint,
      active: true,
      seedPairId: seedData.seedPairId,
      nonce: seedData.nonce,
    });

    // Lock seed for this game session
    await SeedManager.lockSeedForGame(req.userId!, session._id.toString(), 'Balloon');

    res.json({
      sessionId: session._id,
      difficulty,
      currentMultiplier: 1.00,
      pumpsPassed: 0,
      steps: PUMP_STEPS[difficulty as PumpDifficulty],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── Manual Mode: Pump (advance one step) ───────────────────────────────
router.post('/pump', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const session = await BalloonSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found or already finished' });
    }

    const stepsArray = PUMP_STEPS[session.difficulty as PumpDifficulty];
    const maxSteps = stepsArray.length - 1;

    if (session.pumpsPassed >= maxSteps) {
      return res.status(400).json({ error: 'Max pumps reached. Please cash out.' });
    }

    const nextPumpIndex = session.pumpsPassed + 1;
    const nextMultiplier = stepsArray[nextPumpIndex];

    // Check if balloon burst
    if (nextMultiplier > session.burstPoint) {
      session.active = false;
      session.pumpsPassed = nextPumpIndex;
      session.currentMultiplier = 0; // Burst
      await session.save();

      // Unlock seed when game ends
      await SeedManager.unlockSeedAfterGame(session._id.toString());

      const bet = await Bet.create({
        userId: req.userId,
        gameType: 'BALLOON',
        currency: session.currency,
        amount: session.betAmount,
        multiplier: 0,
        payout: 0,
        profit: -session.betAmount,
        status: 'LOST',
        won: false,
        seedPairId: session.seedPairId,
        nonce: session.nonce,
        gameData: { difficulty: session.difficulty, pumpsPassed: nextPumpIndex, burstPoint: session.burstPoint },
        result: { burst: true, burstAtPump: nextPumpIndex, burstAtMultiplier: nextMultiplier, actualBurstPoint: session.burstPoint },
      });

      return res.json({
        safe: false,
        gameOver: true,
        burst: true,
        burstPoint: session.burstPoint,
        burstAtMultiplier: nextMultiplier,
        bet,
      });
    }

    // Balloon survived this pump
    session.pumpsPassed = nextPumpIndex;
    session.currentMultiplier = nextMultiplier;
    await session.save();

    res.json({
      safe: true,
      gameOver: false,
      currentMultiplier: nextMultiplier,
      pumpsPassed: nextPumpIndex,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── Cash Out ───────────────────────────────────────────────────────────
router.post('/cashout', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const session = await BalloonSession.findOne({ _id: sessionId, userId: req.userId, active: true });
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
      gameType: 'BALLOON',
      currency: session.currency,
      amount: session.betAmount,
      multiplier: session.currentMultiplier,
      payout,
      profit,
      status: 'WON',
      won: true,
      seedPairId: session.seedPairId,
      nonce: session.nonce,
      gameData: { difficulty: session.difficulty, pumpsPassed: session.pumpsPassed, burstPoint: session.burstPoint },
      result: { cashedOut: true, pumpsPassed: session.pumpsPassed },
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
      burstPoint: session.burstPoint, // Reveal burst point on cashout
      wallet: { balance: wallet?.balance },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── Auto Mode: Pump N times in one request ─────────────────────────────
router.post('/auto', authenticate, async (req: AuthRequest, res) => {
  try {
    const { betAmount, currency, difficulty, targetPumps } = req.body;

    if (!betAmount || !currency || !difficulty || !targetPumps) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!PUMP_STEPS[difficulty as PumpDifficulty]) {
      return res.status(400).json({ error: 'Invalid difficulty' });
    }

    const stepsArray = PUMP_STEPS[difficulty as PumpDifficulty];
    const maxSteps = stepsArray.length - 1;
    const clampedPumps = Math.min(Math.max(1, targetPumps), maxSteps);

    // Check for existing session
    const existingSession = await BalloonSession.findOne({ userId: req.userId, active: true });
    if (existingSession) {
      return res.status(400).json({ error: 'Active game exists. Finish it first.' });
    }

    const wallet = await Wallet.findOne({ userId: req.userId, currency });
    if (!wallet || wallet.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    wallet.balance -= betAmount;
    await wallet.save();

    const seedData = await SeedManager.reserveSeedForBetNoTx(req.userId!);
    const burstPoint = generateBurstPoint(seedData);

    // Determine the multiplier at the target pump
    const targetMultiplier = stepsArray[clampedPumps];

    // Did the balloon survive to the target pump?
    const burst = targetMultiplier > burstPoint;

    // Find which pump it burst at (if it burst before target)
    let burstAtPump = -1;
    if (burst) {
      for (let i = 1; i <= clampedPumps; i++) {
        if (stepsArray[i] > burstPoint) {
          burstAtPump = i;
          break;
        }
      }
    }

    const won = !burst;
    const finalMultiplier = won ? targetMultiplier : 0;
    const payout = won ? betAmount * finalMultiplier : 0;
    const profit = payout - betAmount;

    if (won && wallet) {
      wallet.balance += payout;
      await wallet.save();
    }

    const bet = await Bet.create({
      userId: req.userId,
      gameType: 'BALLOON',
      currency,
      amount: betAmount,
      multiplier: finalMultiplier,
      payout,
      profit,
      status: won ? 'WON' : 'LOST',
      won,
      seedPairId: seedData.seedPairId,
      nonce: seedData.nonce,
      gameData: { difficulty, targetPumps: clampedPumps, burstPoint },
      result: {
        burst,
        burstAtPump: burst ? burstAtPump : null,
        burstAtMultiplier: burst ? stepsArray[burstAtPump] : null,
        targetMultiplier,
        pumpsPassed: won ? clampedPumps : burstAtPump,
        actualBurstPoint: burstPoint,
      },
    });

    res.json({
      bet,
      won,
      payout,
      profit,
      multiplier: finalMultiplier,
      burstPoint,
      burstAtPump: burst ? burstAtPump : null,
      targetPumps: clampedPumps,
      targetMultiplier,
      wallet: { balance: wallet?.balance },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── Get active session (recovery on page refresh) ──────────────────────
router.get('/active-session', authenticate, async (req: AuthRequest, res) => {
  try {
    const session = await BalloonSession.findOne({ userId: req.userId, active: true });
    if (!session) {
      return res.json({ hasActiveSession: false });
    }

    res.json({
      hasActiveSession: true,
      sessionId: session._id,
      currentMultiplier: session.currentMultiplier,
      pumpsPassed: session.pumpsPassed,
      difficulty: session.difficulty,
      betAmount: session.betAmount,
      currency: session.currency,
      steps: PUMP_STEPS[session.difficulty as PumpDifficulty],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── Clear / Forfeit session ────────────────────────────────────────────
router.delete('/session', authenticate, async (req: AuthRequest, res) => {
  try {
    const sessions = await BalloonSession.find({ userId: req.userId, active: true });
    for (const session of sessions) {
      session.active = false;
      await session.save();

      await Bet.create({
        userId: req.userId,
        gameType: 'BALLOON',
        currency: session.currency,
        amount: session.betAmount,
        multiplier: 0,
        payout: 0,
        profit: -session.betAmount,
        status: 'LOST',
        won: false,
        seedPairId: session.seedPairId,
        nonce: session.nonce,
        gameData: { difficulty: session.difficulty, pumpsPassed: session.pumpsPassed },
        result: { forfeited: true, cleanedUp: true },
      });

      await SeedManager.unlockSeedAfterGame(session._id.toString());
    }
    res.json({ message: 'Active sessions cleared' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── Get step multipliers for a difficulty ──────────────────────────────
router.get('/steps/:difficulty', (req, res) => {
  const difficulty = req.params.difficulty as PumpDifficulty;
  if (!PUMP_STEPS[difficulty]) {
    return res.status(400).json({ error: 'Invalid difficulty' });
  }
  res.json({ steps: PUMP_STEPS[difficulty] });
});

export default router;
