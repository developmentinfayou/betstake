import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { FastParityRound } from '@casino/database';

const router = Router();

// Get recent rounds history
router.get('/history', async (req, res) => {
  try {
    const { limit = '50' } = req.query;
    const rounds = await FastParityRound.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .select('roundId number color createdAt totalAmount playerCount');
    
    return res.json(rounds);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get round details
router.get('/round/:roundId', async (req, res) => {
  try {
    const { roundId } = req.params;
    const round = await FastParityRound.findOne({ roundId });
    
    if (!round) {
      return res.status(404).json({ error: 'Round not found' });
    }
    
    return res.json(round);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;