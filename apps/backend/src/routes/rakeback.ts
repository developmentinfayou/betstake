import { Router } from 'express';
import { RakebackService } from '../services/rakeback-service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const optInSchema = z.object({
  optIn: z.boolean()
});

const claimSchema = z.object({
  currency: z.string()
});

const router = Router();

// Get rakeback status and unclaimed amounts
router.get('/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    
    const [isOptedIn, unclaimedRakeback] = await Promise.all([
      RakebackService.isOptedIn(userId),
      RakebackService.getUnclaimedRakeback(userId)
    ]);
    
    res.json({
      optedIn: isOptedIn,
      unclaimed: unclaimedRakeback
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Opt in/out of rakeback
router.post('/opt', authenticate, async (req: AuthRequest, res) => {
  try {
    const body = optInSchema.parse(req.body);
    const userId = req.user.id;
    
    const result = await RakebackService.setRakebackOptIn(userId, body.optIn);
    
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Claim rakeback for specific currency
router.post('/claim', authenticate, async (req: AuthRequest, res) => {
  try {
    const body = claimSchema.parse(req.body);
    const userId = req.user.id;
    
    const result = await RakebackService.claimRakeback(userId, body.currency);
    
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get rakeback history
router.get('/history', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { limit = '50' } = req.query;
    
    const history = await RakebackService.getRakebackHistory(userId, parseInt(limit as string));
    
    res.json(history);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Calculate potential rakeback (preview)
router.get('/calculate/:currency', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { currency } = req.params;
    const { period = 'daily' } = req.query;
    
    const calculation = await RakebackService.calculateRakeback(
      userId,
      currency,
      period as 'daily' | 'weekly' | 'monthly'
    );
    
    res.json(calculation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;