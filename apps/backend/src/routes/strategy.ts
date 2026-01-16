import { Router } from 'express';
import { StrategyEngine } from '../services/strategy-engine';

const router = Router();

router.get('/defaults', async (req, res) => {
  const strategies = StrategyEngine.getStrategies();
  return res.json({ strategies });
});

router.get('/:strategyId', async (req, res) => {
  const { strategyId } = req.params;
  const strategy = StrategyEngine.getStrategy(strategyId);
  
  if (!strategy) {
    return res.status(404).json({ error: 'Strategy not found' });
  }
  
  return res.json({ strategy });
});

export default router;
