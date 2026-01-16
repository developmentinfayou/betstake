import { Router } from 'express';
import { WalletService } from '../services/wallet-service';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all wallets
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user.id;
  const wallets = await WalletService.getAllWallets(userId);
  return res.json(wallets);
});

// Get specific wallet
router.get('/:currency', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user.id;
  const { currency } = req.params;
  const wallet = await WalletService.getWallet(userId, currency as any);
  return res.json(wallet);
});

// Add balance (admin/deposit simulation)
router.post('/add', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user.id;
  const { currency, amount } = req.body;

  if (amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const wallet = await WalletService.addBalance(userId, currency, amount);
  return res.json(wallet);
});

export default router;
