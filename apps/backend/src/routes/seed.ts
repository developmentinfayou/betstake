import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { SeedManager } from '@casino/fairness';

const router = Router();

router.get('/active', authenticate, async (req: AuthRequest, res) => {
  try {
    const seedPair = await SeedManager.getActiveSeedPair(req.userId!);
    const hasActiveGame = await SeedManager.hasActiveGameSession(req.userId!);
    
    res.json({
      serverSeedHash: seedPair.serverSeedHash,
      clientSeed: seedPair.clientSeed,
      nonce: seedPair.nonce,
      revealed: seedPair.revealed,
      hasActiveGame, // NEW: Indicate if seed is locked
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/client-seed', authenticate, async (req: AuthRequest, res) => {
  try {
    const { clientSeed } = req.body;
    const newSeedPair = await SeedManager.updateClientSeed(req.userId!, clientSeed);
    res.json({
      serverSeedHash: newSeedPair.serverSeedHash,
      clientSeed: newSeedPair.clientSeed,
      nonce: newSeedPair.nonce,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/rotate', authenticate, async (req: AuthRequest, res) => {
  try {
    const oldSeed = await SeedManager.getActiveSeedPair(req.userId!);
    const newSeedPair = await SeedManager.rotateSeedPair(req.userId!);
    res.json({
      oldSeed: {
        serverSeed: oldSeed.serverSeed,
        serverSeedHash: oldSeed.serverSeedHash,
        clientSeed: oldSeed.clientSeed,
        nonce: oldSeed.nonce,
      },
      newSeed: {
        serverSeedHash: newSeedPair.serverSeedHash,
        clientSeed: newSeedPair.clientSeed,
        nonce: newSeedPair.nonce,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
