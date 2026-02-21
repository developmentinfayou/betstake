import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { StrategyEngine } from '../services/strategy-engine';
import { StrategyConditionBlock } from '@casino/shared';

const router = Router();

/**
 * GET /api/strategy/all — presets + user's custom strategies
 */
router.get('/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const strategies = await StrategyEngine.getStrategiesForUser(req.userId!);
    return res.json({ strategies });
  } catch (error: any) {
    console.error('[Strategy] Error fetching strategies:', error);
    return res.status(500).json({ error: 'Failed to fetch strategies' });
  }
});

/**
 * GET /api/strategy/defaults — presets only (public, no auth required for reading presets)
 */
router.get('/defaults', async (req, res) => {
  try {
    const strategies = await StrategyEngine.getStrategiesForUser('__none__');
    // Only return presets since userId won't match any user
    return res.json({ strategies: strategies.filter(s => s.isPreset) });
  } catch (error: any) {
    console.error('[Strategy] Error fetching defaults:', error);
    return res.status(500).json({ error: 'Failed to fetch strategies' });
  }
});

/**
 * GET /api/strategy/:id — get single strategy
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const strategy = await StrategyEngine.getStrategy(req.params.id);
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    // Only let user see their own or presets
    if (!strategy.isPreset && strategy.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.json({ strategy });
  } catch (error: any) {
    console.error('[Strategy] Error fetching strategy:', error);
    return res.status(500).json({ error: 'Failed to fetch strategy' });
  }
});

/**
 * POST /api/strategy — create custom strategy
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, conditions } = req.body as { name: string; conditions: StrategyConditionBlock[] };

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Strategy name is required' });
    }
    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({ error: 'At least one condition is required' });
    }

    // Validate each condition
    for (const cond of conditions) {
      if (!cond.type || !cond.action) {
        return res.status(400).json({ error: 'Each condition must have a type and action' });
      }
      if (cond.type === 'bet' && !cond.betTrigger) {
        return res.status(400).json({ error: 'Bet conditions require a betTrigger' });
      }
      if (cond.type === 'profit' && !cond.profitTrigger) {
        return res.status(400).json({ error: 'Profit conditions require a profitTrigger' });
      }
    }

    const strategy = await StrategyEngine.createStrategy(req.userId!, name.trim(), conditions);
    return res.status(201).json({ strategy });
  } catch (error: any) {
    console.error('[Strategy] Error creating strategy:', error);
    return res.status(500).json({ error: 'Failed to create strategy' });
  }
});

/**
 * PUT /api/strategy/:id — update custom strategy (own only)
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, conditions } = req.body as { name: string; conditions: StrategyConditionBlock[] };

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Strategy name is required' });
    }
    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({ error: 'At least one condition is required' });
    }

    const strategy = await StrategyEngine.updateStrategy(req.params.id, req.userId!, name.trim(), conditions);
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found or not yours to edit' });
    }
    return res.json({ strategy });
  } catch (error: any) {
    console.error('[Strategy] Error updating strategy:', error);
    return res.status(500).json({ error: 'Failed to update strategy' });
  }
});

/**
 * DELETE /api/strategy/:id — delete custom strategy (own only, not presets)
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await StrategyEngine.deleteStrategy(req.params.id, req.userId!);
    if (!deleted) {
      return res.status(404).json({ error: 'Strategy not found or cannot be deleted' });
    }
    return res.json({ success: true });
  } catch (error: any) {
    console.error('[Strategy] Error deleting strategy:', error);
    return res.status(500).json({ error: 'Failed to delete strategy' });
  }
});

export default router;
