import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { TowerSession, Bet, Wallet } from '@casino/database';
import { TowerGame } from '@casino/game-engine';
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
    const { floors, betAmount, currency } = req.body;

    if (!floors || !betAmount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    const seedData = await SeedManager.reserveSeedForBetNoTx(req.userId!);
    const towerGame = new TowerGame(gameConfig);
    const grid = (towerGame as any).generateGrid(floors, seedData);

    const session = await TowerSession.create({
      userId: req.userId,
      grid,
      floors,
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
      floors,
      currentMultiplier: 1,
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
        gameData: { floors: session.floors, revealedTiles: session.revealedTiles },
        result: { hitDanger: true, tileIndex },
      });

      return res.json({
        safe: false,
        gameOver: true,
        hitDanger: true,
        tileIndex,
        grid: session.grid,
        bet,
      });
    }

    const towerGame = new TowerGame(gameConfig);
    const safeFloorsCleared = Math.floor(session.revealedTiles.filter(t => !session.grid[t]).length / 3);
    const multiplier = (towerGame as any).calculateMultiplier(session.floors, safeFloorsCleared);
    
    session.currentMultiplier = multiplier;
    await session.save();

    res.json({
      safe: true,
      gameOver: false,
      currentMultiplier: multiplier,
      revealedTiles: session.revealedTiles,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/session', authenticate, async (req: AuthRequest, res) => {
  try {
    await TowerSession.deleteMany({ userId: req.userId, active: true });
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

    const safeFloorsCleared = Math.floor(session.revealedTiles.filter(t => !session.grid[t]).length / 3);
    if (safeFloorsCleared === 0) {
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
      gameData: { floors: session.floors, revealedTiles: session.revealedTiles },
      result: { cashedOut: true, safeFloorsCleared },
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

export default router;
