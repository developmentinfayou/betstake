import { Router } from 'express';
import { GameConfig, Jackpot, User, Bet, Contest, UserRole } from '@casino/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Admin middleware
const requireAdmin = (req: AuthRequest, res: any, next: any) => {
  if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Game Configuration Management
router.get('/games', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const games = await GameConfig.find().sort({ gameType: 1 });
  res.json(games);
});

router.put('/games/:gameType', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { gameType } = req.params;
  const updateData = req.body;
  
  const game = await GameConfig.findOneAndUpdate(
    { gameType },
    updateData,
    { new: true, upsert: true }
  );
  
  res.json(game);
});

// Jackpot Management
router.get('/jackpots', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const jackpots = await Jackpot.find().sort({ currentAmount: -1 });
  res.json(jackpots);
});

router.put('/jackpots/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const jackpot = await Jackpot.findByIdAndUpdate(id, updateData, { new: true });
  res.json(jackpot);
});

// User Management
router.get('/users', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { page = 1, limit = 50, search } = req.query;
  const query = search ? { 
    $or: [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  } : {};
  
  const users = await User.find(query)
    .select('-passwordHash')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });
    
  const total = await User.countDocuments(query);
  
  res.json({ users, total, page: Number(page), limit: Number(limit) });
});

router.put('/users/:id/role', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true }
  ).select('-passwordHash');
  
  res.json(user);
});

// Contest Management
router.get('/contests', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const contests = await Contest.find().sort({ createdAt: -1 });
  res.json(contests);
});

router.post('/contests', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const contest = await Contest.create(req.body);
  res.json(contest);
});

router.put('/contests/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const contest = await Contest.findByIdAndUpdate(id, req.body, { new: true });
  res.json(contest);
});

router.delete('/contests/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  await Contest.findByIdAndDelete(id);
  res.json({ success: true });
});

// Platform Statistics
router.get('/stats', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const [totalUsers, totalBets, totalVolume, activeJackpots] = await Promise.all([
    User.countDocuments(),
    Bet.countDocuments(),
    Bet.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Jackpot.countDocuments({ status: 'READY' })
  ]);
  
  res.json({
    totalUsers,
    totalBets,
    totalVolume: totalVolume[0]?.total || 0,
    activeJackpots
  });
});

// Game Statistics
router.get('/stats/games', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const gameStats = await Bet.aggregate([
    {
      $group: {
        _id: '$gameType',
        totalBets: { $sum: 1 },
        totalVolume: { $sum: '$amount' },
        totalPayout: { $sum: '$payout' },
        houseEdge: {
          $avg: {
            $divide: [
              { $subtract: ['$amount', '$payout'] },
              '$amount'
            ]
          }
        }
      }
    },
    { $sort: { totalVolume: -1 } }
  ]);
  
  res.json(gameStats);
});

export default router;
