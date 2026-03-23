import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { StrategyEngine } from '../services/strategy-engine';
import { DiamondService } from '../services/diamond-service';
import { StrategyConditionBlock } from '@casino/shared';
import { User } from '@casino/database';

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
 * GET /api/strategy/community — browse all public strategies from other users
 */
router.get('/community', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const strategies = await StrategyEngine.getPublicStrategies(req.userId!);
    return res.json({ strategies });
  } catch (error: any) {
    console.error('[Strategy] Error fetching community strategies:', error);
    return res.status(500).json({ error: 'Failed to fetch community strategies' });
  }
});

/**
 * GET /api/strategy/diamonds/balance — get current user's diamond balance
 */
router.get('/diamonds/balance', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const balance = await DiamondService.getBalance(req.userId!);
    return res.json({ balance });
  } catch (error: any) {
    console.error('[Strategy] Error fetching diamond balance:', error);
    return res.status(500).json({ error: 'Failed to fetch diamond balance' });
  }
});

/**
 * GET /api/strategy/diamonds/history — get diamond transaction history
 */
router.get('/diamonds/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await DiamondService.getHistory(req.userId!, limit);
    return res.json({ history });
  } catch (error: any) {
    console.error('[Strategy] Error fetching diamond history:', error);
    return res.status(500).json({ error: 'Failed to fetch diamond history' });
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
    // Allow viewing if: preset, own strategy, or public
    if (!strategy.isPreset && strategy.userId !== req.userId && !strategy.isPublic) {
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
    const { name, conditions, isPublic } = req.body as {
      name: string;
      conditions: StrategyConditionBlock[];
      isPublic?: boolean;
    };

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

    // Get creator's username for display
    const user = await User.findById(req.userId).select('username');
    const creatorUsername = user?.username || 'Unknown';

    const strategy = await StrategyEngine.createStrategy(
      req.userId!,
      name.trim(),
      conditions,
      isPublic || false,
      creatorUsername
    );
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
 * PUT /api/strategy/:id/visibility — toggle public/private (owner only)
 */
router.put('/:id/visibility', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const strategy = await StrategyEngine.toggleVisibility(req.params.id, req.userId!);
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found or not yours to toggle' });
    }
    return res.json({ strategy, message: strategy.isPublic ? 'Strategy is now public' : 'Strategy is now private' });
  } catch (error: any) {
    console.error('[Strategy] Error toggling visibility:', error);
    return res.status(500).json({ error: 'Failed to toggle strategy visibility' });
  }
});

/**
 * POST /api/strategy/:id/use — record strategy usage + award diamonds to creator
 */
router.post('/:id/use', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await StrategyEngine.recordUsage(req.params.id, req.userId!);
    if (!result) {
      return res.status(404).json({ error: 'Strategy not found or not public' });
    }
    return res.json({
      success: true,
      usageCount: result.usageCount,
      diamondsAwarded: result.diamonds > 0 ? 20 : 0,
    });
  } catch (error: any) {
    console.error('[Strategy] Error recording usage:', error);
    return res.status(500).json({ error: 'Failed to record strategy usage' });
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
