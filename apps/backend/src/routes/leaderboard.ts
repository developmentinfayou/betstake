import { Router } from 'express';

const router = Router();

router.get('/all-bets', async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
