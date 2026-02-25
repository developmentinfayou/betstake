import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { TowerSession, Bet, Wallet } from '@casino/database';
import { TowerGame, TOWER_CONFIG, TowerDifficulty } from '@casino/game-engine';
import { SeedManager } from '@casino/fairness';

const router = Router();

const gameConfig = {
  houseEdge: 1,
  minBet: { USD: 0.1, BTC: 0.00001 },
  maxBet: { USD: 10000, BTC: 1 },
  maxWin: { USD: 100000, BTC: 10 },
};

const VALID_DIFFICULTIES: TowerDifficulty[] = ['easy', 'medium', 'hard', 'extreme', 'nightmare'];

// Get multiplier table for a difficulty
router.get('/multipliers/:difficulty', (req, res) => {
  const difficulty = req.params.difficulty as TowerDifficulty;
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty' });
  }
  const config = TOWER_CONFIG[difficulty];
  const table = TowerGame.getMultiplierTable(difficulty, gameConfig.houseEdge);
  res.json({
    difficulty,
    floors: config.floors,
    tilesPerFloor: config.tilesPerFloor,
    dangersPerFloor: config.dangersPerFloor,
    safePerFloor: config.safePerFloor,
    multipliers: table,
  });
});

// Get all difficulty configs
router.get('/config', (_req, res) => {
  const configs: any = {};
  for (const diff of VALID_DIFFICULTIES) {
    const config = TOWER_CONFIG[diff];
    configs[diff] = {
      ...config,
      multipliers: TowerGame.getMultiplierTable(diff, gameConfig.houseEdge),
    };
  }
  res.json(configs);
});

router.post('/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const { difficulty, betAmount, currency } = req.body;

    if (!difficulty || !betAmount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty. Choose: easy, medium, hard, extreme, nightmare' });
    }

    const existingSession = await TowerSession.findOne({ userId: req.userId, active: true });
    if (existingSession) {
      return res.status(400).json({ error: 'Active game exists. Cash out first.' });
    }

    const wallet = await Wallet.findOne({ userId: req.userId, currency });
    if (!wallet || wallet.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    wallet.balance -= betAmount;
    await wallet.save();

    const config = TOWER_CONFIG[difficulty as TowerDifficulty];
    const seedData = await SeedManager.reserveSeedForBetNoTx(req.userId!);
    const towerGame = new TowerGame(gameConfig);
    const grid = towerGame.generateGrid(config, seedData);

    const session = await TowerSession.create({
      userId: req.userId,
      grid,
      floors: config.floors,
      difficulty,
      tilesPerFloor: config.tilesPerFloor,
      dangersPerFloor: config.dangersPerFloor,
      betAmount,
      currency,
      revealedTiles: [],
      currentFloor: 0,
      currentMultiplier: 1,
      active: true,
      seedPairId: seedData.seedPairId,
      nonce: seedData.nonce,
    });

    // Lock seed for this game session
    await SeedManager.lockSeedForGame(req.userId!, session._id.toString());

    const multiplierTable = TowerGame.getMultiplierTable(difficulty, gameConfig.houseEdge);

    res.json({
      sessionId: session._id,
      floors: config.floors,
      difficulty,
      tilesPerFloor: config.tilesPerFloor,
      dangersPerFloor: config.dangersPerFloor,
      currentMultiplier: 1,
      multiplierTable,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reveal', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId, tileIndex } = req.body;

    const session = await TowerSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Validate tile is within the current floor
    const currentFloor = session.currentFloor;
    const floorStart = currentFloor * session.tilesPerFloor;
    const floorEnd = floorStart + session.tilesPerFloor - 1;

    if (tileIndex < floorStart || tileIndex > floorEnd) {
      return res.status(400).json({ error: `Tile must be on floor ${currentFloor + 1} (indices ${floorStart}-${floorEnd})` });
    }

    if (session.revealedTiles.includes(tileIndex)) {
      return res.status(400).json({ error: 'Tile already revealed' });
    }

    const isDanger = session.grid[tileIndex];
    session.revealedTiles.push(tileIndex);

    if (isDanger) {
      session.active = false;
      await session.save();

      // Unlock seed when game ends
      await SeedManager.unlockSeedAfterGame(session._id.toString());

      const bet = await Bet.create({
        userId: req.userId,
        gameType: 'TOWER',
        currency: session.currency,
        amount: session.betAmount,
        multiplier: 0,
        payout: 0,
        profit: -session.betAmount,
        won: false,
        seedPairId: session.seedPairId,
        nonce: session.nonce,
        gameData: {
          difficulty: session.difficulty,
          floors: session.floors,
          tilesPerFloor: session.tilesPerFloor,
          dangersPerFloor: session.dangersPerFloor,
          revealedTiles: session.revealedTiles,
        },
        result: { hitDanger: true, tileIndex, floorReached: currentFloor },
      });

      return res.json({
        safe: false,
        gameOver: true,
        hitDanger: true,
        tileIndex,
        grid: session.grid,
        floorReached: currentFloor,
        bet,
      });
    }

    // Safe tile — advance to next floor
    session.currentFloor = currentFloor + 1;
    const safeFloorsCleared = session.currentFloor;

    const diffConfig = TOWER_CONFIG[session.difficulty as TowerDifficulty];
    const towerGame = new TowerGame(gameConfig);
    const multiplier = towerGame.calculateMultiplier(diffConfig, safeFloorsCleared);

    session.currentMultiplier = multiplier;
    await session.save();

    // Check if player has cleared all floors (auto-cashout)
    const allFloorsCleared = session.currentFloor >= session.floors;

    if (allFloorsCleared) {
      // Auto cash out at the top
      const payout = session.betAmount * multiplier;
      const profit = payout - session.betAmount;

      const wallet = await Wallet.findOne({ userId: req.userId, currency: session.currency });
      if (wallet) {
        wallet.balance += payout;
        await wallet.save();
      }

      session.active = false;
      const bet = await Bet.create({
        userId: req.userId,
        gameType: 'TOWER',
        currency: session.currency,
        amount: session.betAmount,
        multiplier,
        payout,
        profit,
        won: true,
        seedPairId: session.seedPairId,
        nonce: session.nonce,
        gameData: {
          difficulty: session.difficulty,
          floors: session.floors,
          tilesPerFloor: session.tilesPerFloor,
          dangersPerFloor: session.dangersPerFloor,
          revealedTiles: session.revealedTiles,
        },
        result: { cashedOut: true, safeFloorsCleared, reachedTop: true },
      });
      session.betId = bet._id.toString();
      await session.save();

      await SeedManager.unlockSeedAfterGame(session._id.toString());

      return res.json({
        safe: true,
        gameOver: true,
        reachedTop: true,
        currentMultiplier: multiplier,
        currentFloor: session.currentFloor,
        revealedTiles: session.revealedTiles,
        payout,
        profit,
        grid: session.grid,
        bet,
        wallet: { balance: wallet?.balance },
      });
    }

    res.json({
      safe: true,
      gameOver: false,
      currentMultiplier: multiplier,
      currentFloor: session.currentFloor,
      revealedTiles: session.revealedTiles,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get active session for recovery on page refresh
router.get('/active-session', authenticate, async (req: AuthRequest, res) => {
  try {
    const session = await TowerSession.findOne({ userId: req.userId, active: true });
    if (!session) {
      return res.json({ hasActiveSession: false });
    }

    res.json({
      hasActiveSession: true,
      sessionId: session._id,
      revealedTiles: session.revealedTiles,
      currentMultiplier: session.currentMultiplier,
      currentFloor: session.currentFloor,
      floors: session.floors,
      difficulty: session.difficulty,
      tilesPerFloor: session.tilesPerFloor,
      dangersPerFloor: session.dangersPerFloor,
      betAmount: session.betAmount,
      currency: session.currency,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Legacy: clear session (now creates loss records)
router.delete('/session', authenticate, async (req: AuthRequest, res) => {
  try {
    const sessions = await TowerSession.find({ userId: req.userId, active: true });
    for (const session of sessions) {
      session.active = false;
      await session.save();

      await Bet.create({
        userId: req.userId,
        gameType: 'TOWER',
        currency: session.currency,
        amount: session.betAmount,
        multiplier: 0,
        payout: 0,
        profit: -session.betAmount,
        won: false,
        seedPairId: session.seedPairId,
        nonce: session.nonce,
        gameData: {
          difficulty: session.difficulty,
          floors: session.floors,
          tilesPerFloor: session.tilesPerFloor,
          dangersPerFloor: session.dangersPerFloor,
          revealedTiles: session.revealedTiles,
        },
        result: { forfeited: true, cleanedUp: true },
      });

      await SeedManager.unlockSeedAfterGame(session._id.toString());
    }
    res.json({ message: 'Active sessions cleared' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cashout', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const session = await TowerSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.currentFloor === 0) {
      return res.status(400).json({ error: 'Must clear at least one floor' });
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
      gameType: 'TOWER',
      currency: session.currency,
      amount: session.betAmount,
      multiplier: session.currentMultiplier,
      payout,
      profit,
      won: true,
      seedPairId: session.seedPairId,
      nonce: session.nonce,
      gameData: {
        difficulty: session.difficulty,
        floors: session.floors,
        tilesPerFloor: session.tilesPerFloor,
        dangersPerFloor: session.dangersPerFloor,
        revealedTiles: session.revealedTiles,
      },
      result: { cashedOut: true, safeFloorsCleared: session.currentFloor },
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
      grid: session.grid,
      wallet: { balance: wallet?.balance },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
