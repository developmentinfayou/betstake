import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { MinesSession, Bet, Wallet } from '@casino/database';
import { MinesGame } from '@casino/game-engine';
import { SeedManager } from '@casino/fairness';

const router = Router();

const gameConfig = {
  houseEdge: 1,
  minBet: { USD: 0.1, BTC: 0.00001 },
  maxBet: { USD: 10000, BTC: 1 },
  maxWin: { USD: 100000, BTC: 10 },
};

router.post('/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const { minesCount, betAmount, currency, gridSize = 25 } = req.body;

    if (!minesCount || !betAmount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingSession = await MinesSession.findOne({ userId: req.userId, active: true });
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
    const minesGame = new MinesGame(gameConfig);
    const grid = (minesGame as any).generateGrid(gridSize, minesCount, seedData);

    const session = await MinesSession.create({
      userId: req.userId,
      grid,
      minesCount,
      gridSize,
      betAmount,
      currency,
      revealedTiles: [],
      currentMultiplier: 1,
      active: true,
      seedPairId: seedData.seedPairId,
      nonce: seedData.nonce,
    });

    // Lock seed for this game session
    await SeedManager.lockSeedForGame(req.userId!, session._id.toString());

    res.json({
      sessionId: session._id,
      gridSize,
      minesCount,
      currentMultiplier: 1,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reveal', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId, tileIndex } = req.body;

    const session = await MinesSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.revealedTiles.includes(tileIndex)) {
      return res.status(400).json({ error: 'Tile already revealed' });
    }

    const isMine = session.grid[tileIndex];
    session.revealedTiles.push(tileIndex);

    if (isMine) {
      session.active = false;
      await session.save();

      // Unlock seed when game ends
      await SeedManager.unlockSeedAfterGame(session._id.toString());

      const bet = await Bet.create({
        userId: req.userId,
        gameType: 'MINES',
        currency: session.currency,
        amount: session.betAmount,
        multiplier: 0,
        payout: 0,
        profit: -session.betAmount,
        won: false,
        seedPairId: session.seedPairId,
        nonce: session.nonce,
        gameData: { minesCount: session.minesCount, revealedTiles: session.revealedTiles },
        result: { hitMine: true, tileIndex },
      });

      return res.json({
        safe: false,
        gameOver: true,
        hitMine: true,
        tileIndex,
        grid: session.grid,
        bet,
      });
    }

    const minesGame = new MinesGame(gameConfig);
    const safeTilesRevealed = session.revealedTiles.filter(t => !session.grid[t]).length;
    const multiplier = (minesGame as any).calculateMultiplier(session.gridSize, session.minesCount, safeTilesRevealed);
    
    session.currentMultiplier = multiplier;
    await session.save();

    res.json({
      safe: true,
      gameOver: false,
      currentMultiplier: multiplier,
      revealedTiles: session.revealedTiles,
      gemsFound: safeTilesRevealed,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/random-reveal', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const session = await MinesSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const allTiles = Array.from({ length: session.gridSize }, (_, i) => i);
    const unopenedTiles = allTiles.filter(i => !session.revealedTiles.includes(i));
    
    if (unopenedTiles.length === 0) {
      return res.status(400).json({ error: 'No tiles left to reveal' });
    }

    const randomIndex = Math.floor(Math.random() * unopenedTiles.length);
    const tileIndex = unopenedTiles[randomIndex];

    const isMine = session.grid[tileIndex];
    session.revealedTiles.push(tileIndex);

    if (isMine) {
      session.active = false;
      await session.save();

      // Unlock seed when game ends
      await SeedManager.unlockSeedAfterGame(session._id.toString());

      const bet = await Bet.create({
        userId: req.userId,
        gameType: 'MINES',
        currency: session.currency,
        amount: session.betAmount,
        multiplier: 0,
        payout: 0,
        profit: -session.betAmount,
        won: false,
        seedPairId: session.seedPairId,
        nonce: session.nonce,
        gameData: { minesCount: session.minesCount, revealedTiles: session.revealedTiles },
        result: { hitMine: true, tileIndex, randomPick: true },
      });

      return res.json({
        safe: false,
        gameOver: true,
        hitMine: true,
        tileIndex,
        randomPick: true,
        grid: session.grid,
        bet,
      });
    }

    const minesGame = new MinesGame(gameConfig);
    const safeTilesRevealed = session.revealedTiles.filter(t => !session.grid[t]).length;
    const multiplier = (minesGame as any).calculateMultiplier(session.gridSize, session.minesCount, safeTilesRevealed);
    
    session.currentMultiplier = multiplier;
    await session.save();

    res.json({
      safe: true,
      gameOver: false,
      tileIndex,
      randomPick: true,
      currentMultiplier: multiplier,
      revealedTiles: session.revealedTiles,
      gemsFound: safeTilesRevealed,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cashout', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const session = await MinesSession.findOne({ _id: sessionId, userId: req.userId, active: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const safeTilesRevealed = session.revealedTiles.filter(t => !session.grid[t]).length;
    if (safeTilesRevealed === 0) {
      return res.status(400).json({ error: 'Must reveal at least one tile' });
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
      gameType: 'MINES',
      currency: session.currency,
      amount: session.betAmount,
      multiplier: session.currentMultiplier,
      payout,
      profit,
      won: true,
      seedPairId: session.seedPairId,
      nonce: session.nonce,
      gameData: { minesCount: session.minesCount, revealedTiles: session.revealedTiles },
      result: { cashedOut: true, safeTilesRevealed },
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
      grid: session.grid,
      wallet: { balance: wallet?.balance },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cleanup', authenticate, async (req: AuthRequest, res) => {
  try {
    const activeSession = await MinesSession.findOne({ userId: req.userId, active: true });
    
    if (activeSession) {
      activeSession.active = false;
      await activeSession.save();
      
      // Unlock seed when session is cleaned up
      await SeedManager.unlockSeedAfterGame(activeSession._id.toString());
      
      res.json({ message: 'Active session cleaned up', sessionId: activeSession._id });
    } else {
      res.json({ message: 'No active session found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
