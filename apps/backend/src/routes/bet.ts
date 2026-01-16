import { Router } from 'express';
import { BetEngine } from '../services/bet-engine';
import { AutoBetService } from '../services/autobet-service';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const placeBetSchema = z.object({
  gameType: z.string(),
  currency: z.string(),
  amount: z.number().positive(),
  gameParams: z.any(),
  isDemo: z.boolean().optional(),
});

const autoBetSchema = z.object({
  gameType: z.string(),
  currency: z.string(),
  amount: z.number().positive(),
  gameParams: z.any(),
  config: z.object({
    enabled: z.boolean(),
    numberOfBets: z.number().min(0),
    onWin: z.object({
      reset: z.boolean(),
      increaseBy: z.number().optional(),
      decreaseBy: z.number().optional(),
    }).optional(),
    onLoss: z.object({
      reset: z.boolean(),
      increaseBy: z.number().optional(),
      decreaseBy: z.number().optional(),
    }).optional(),
    stopOnProfit: z.number().optional(),
    stopOnLoss: z.number().optional(),
  }),
});

const router = Router();

// Place bet
router.post('/place', authenticate, async (req: AuthRequest, res) => {
  try {
    const body = placeBetSchema.parse(req.body);
    const userId = req.user.id;

    const result = await BetEngine.placeBet({
      userId,
      gameType: body.gameType as any,
      currency: body.currency as any,
      amount: body.amount,
      gameParams: body.gameParams,
      isDemo: body.isDemo,
    });

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Start autobet
router.post('/autobet/start', authenticate, async (req: AuthRequest, res) => {
  try {
    console.log('AutoBet request body:', JSON.stringify(req.body, null, 2));
    const body = autoBetSchema.parse(req.body);
    const userId = req.user.id;

    await AutoBetService.startAutoBet(userId, body.config, {
      userId,
      gameType: body.gameType as any,
      currency: body.currency as any,
      amount: body.amount,
      gameParams: body.gameParams,
    });

    return res.json({ success: true, message: 'Auto-bet started' });
  } catch (error: any) {
    console.error('AutoBet error:', error);
    return res.status(400).json({ error: error.message || error.toString() });
  }
});

// Stop autobet
router.post('/autobet/stop', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user.id;
  await AutoBetService.stopAutoBet(userId);
  return res.json({ success: true, message: 'Auto-bet stopped' });
});

// Get autobet status
router.get('/autobet/status', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user.id;
  const status = await AutoBetService.getAutoBetStatus(userId);
  return res.json(status);
});

// Get bet history
router.get('/history', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user.id;
  const { limit = '50', offset = '0' } = req.query;
  
  const bets = await BetEngine.getBetHistory(userId, parseInt(limit as string) || 50, parseInt(offset as string) || 0);
  return res.json({ bets });
});

// Get bet by ID
router.get('/:betId', async (req, res) => {
  const { betId } = req.params;
  const bet = await BetEngine.getBetById(betId);
  return res.json(bet);
});

// Verify bet
router.post('/verify', authenticate, async (req: AuthRequest, res) => {
  try {
    const { betId } = req.body;
    const verification = await BetEngine.verifyBet(betId);
    return res.json(verification);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
