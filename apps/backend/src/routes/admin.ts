import { Router } from 'express';
import mongoose from 'mongoose';
import { GameConfig, Jackpot, User, Bet, Contest, UserRole, Wallet, AdminActivityLog } from '@casino/database';
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

// ========== ENHANCED USER MANAGEMENT (PHASE 2) ==========

/**
 * Get detailed user profile
 * GET /api/admin/users/:id/details
 */
router.get('/users/:id/details', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const [user, wallet, betStats, recentActivity] = await Promise.all([
      User.findById(id).select('-passwordHash'),
      Wallet.findOne({ userId: id }),
      Bet.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: null,
            totalBets: { $sum: 1 },
            totalWagered: { $sum: '$amount' },
            totalPayout: { $sum: '$payout' },
            wins: { $sum: { $cond: [{ $gt: ['$payout', '$amount'] }, 1, 0] } }
          }
        }
      ]),
      Bet.find({ userId: id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('gameType amount payout multiplier createdAt')
    ]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = betStats[0] || { totalBets: 0, totalWagered: 0, totalPayout: 0, wins: 0 };

    res.json({
      user,
      wallet: wallet || { balances: {} },
      stats: {
        ...stats,
        netProfit: stats.totalPayout - stats.totalWagered,
        winRate: stats.totalBets > 0 ? (stats.wins / stats.totalBets * 100).toFixed(1) : 0
      },
      recentActivity
    });
  } catch (error) {
    console.error('Failed to get user details:', error);
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

/**
 * Get user bet history
 * GET /api/admin/users/:id/bets
 */
router.get('/users/:id/bets', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, gameType } = req.query;

    const query: any = { userId: id };
    if (gameType) query.gameType = gameType;

    const [bets, total] = await Promise.all([
      Bet.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit)),
      Bet.countDocuments(query)
    ]);

    res.json({ bets, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Failed to get user bets:', error);
    res.status(500).json({ error: 'Failed to get user bets' });
  }
});

/**
 * Adjust user balance (requires reason - logged to audit)
 * PUT /api/admin/users/:id/balance
 */
router.put('/users/:id/balance', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { currency, amount, reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ error: 'Reason is required (min 5 chars)' });
    }

    if (!currency) {
      return res.status(400).json({ error: 'Currency is required' });
    }

    // Find wallet by userId AND currency (per the Wallet schema)
    let wallet = await Wallet.findOne({ userId: id, currency });

    // If no wallet exists for this currency, create one
    if (!wallet) {
      wallet = await Wallet.create({ userId: id, currency, balance: 0 });
    }

    const oldBalance = wallet.balance || 0;
    const newBalance = oldBalance + amount;

    if (newBalance < 0) {
      return res.status(400).json({ error: 'Balance cannot go negative' });
    }

    wallet.balance = newBalance;
    await wallet.save();

    // Log to audit trail
    try {
      if (req.user?._id) {
        await AdminActivityLog.create({
          adminId: req.user._id,
          adminUsername: req.user.username || req.user.email || 'admin',
          action: 'BALANCE_ADJUST',
          targetType: 'USER',
          targetId: id,
          previousValue: { balance: oldBalance, currency },
          newValue: { balance: newBalance, adjustment: amount, currency },
          reason,
          ipAddress: req.ip || 'unknown'
        });
      }
    } catch (logError) {
      console.error('Failed to log admin activity:', logError);
    }

    res.json({
      success: true,
      currency,
      oldBalance,
      newBalance,
      adjustment: amount
    });
  } catch (error) {
    console.error('Failed to adjust balance:', error);
    res.status(500).json({ error: 'Failed to adjust balance' });
  }
});

/**
 * Ban/unban user (requires reason - logged to audit)
 * PUT /api/admin/users/:id/ban
 */
router.put('/users/:id/ban', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { banned, reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ error: 'Reason is required (min 5 chars)' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        isBanned: banned,
        banReason: banned ? reason : null,
        bannedAt: banned ? new Date() : null,
        bannedBy: banned ? req.user._id : null
      },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log to audit trail
    try {
      if (req.user?._id) {
        await AdminActivityLog.create({
          adminId: req.user._id,
          adminUsername: req.user.username || req.user.email || 'admin',
          action: banned ? 'BAN_USER' : 'UNBAN_USER',
          targetType: 'USER',
          targetId: id,
          previousValue: { banned: !banned },
          newValue: { banned, username: user.username, email: user.email },
          reason,
          ipAddress: req.ip || 'unknown'
        });
      }
    } catch (logError) {
      console.error('Failed to log admin activity:', logError);
    }

    res.json({
      success: true,
      user,
      action: banned ? 'banned' : 'unbanned'
    });
  } catch (error) {
    console.error('Failed to update ban status:', error);
    res.status(500).json({ error: 'Failed to update ban status' });
  }
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

// ========== ENHANCED ANALYTICS (PHASE 1) ==========

/**
 * Real-time stats - Active users, current bets, live revenue
 * GET /api/admin/stats/realtime
 */
router.get('/stats/realtime', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const [
      activeUsersCount,
      recentBetsCount,
      liveRevenueData,
      jackpotTotal,
      onlineUsersEstimate
    ] = await Promise.all([
      // Users who placed bets in last hour
      Bet.distinct('userId', { createdAt: { $gte: oneHourAgo } }).then(ids => ids.length),

      // Bets in last 5 minutes
      Bet.countDocuments({ createdAt: { $gte: fiveMinutesAgo } }),

      // Revenue in last hour (amount - payout = house profit)
      Bet.aggregate([
        { $match: { createdAt: { $gte: oneHourAgo } } },
        {
          $group: {
            _id: null,
            volume: { $sum: '$amount' },
            payouts: { $sum: '$payout' },
            profit: { $sum: { $subtract: ['$amount', '$payout'] } }
          }
        }
      ]),

      // Total in jackpots
      Jackpot.aggregate([
        { $group: { _id: null, total: { $sum: '$currentAmount' } } }
      ]),

      // Estimate online users (logged in last 15 min - based on recent activity)
      User.countDocuments({ updatedAt: { $gte: new Date(now.getTime() - 15 * 60 * 1000) } })
    ]);

    res.json({
      activeUsers: activeUsersCount,
      onlineUsers: onlineUsersEstimate,
      recentBets: recentBetsCount,
      liveVolume: liveRevenueData[0]?.volume || 0,
      liveProfit: liveRevenueData[0]?.profit || 0,
      jackpotPool: jackpotTotal[0]?.total || 0,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch realtime stats:', error);
    res.status(500).json({ error: 'Failed to fetch realtime stats' });
  }
});

/**
 * Trends - Compare 24h, 7d, 30d performance
 * GET /api/admin/stats/trends
 */
router.get('/stats/trends', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const now = new Date();

    const periods = {
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    };

    // Previous periods for comparison
    const prevPeriods = {
      '24h': {
        start: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        end: new Date(now.getTime() - 24 * 60 * 60 * 1000)
      },
      '7d': {
        start: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      },
      '30d': {
        start: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
    };

    const getTrendData = async (period: keyof typeof periods) => {
      const [current, previous, newUsers, newUsersPrev] = await Promise.all([
        // Current period
        Bet.aggregate([
          { $match: { createdAt: { $gte: periods[period] } } },
          {
            $group: {
              _id: null,
              bets: { $sum: 1 },
              volume: { $sum: '$amount' },
              payout: { $sum: '$payout' },
              uniqueUsers: { $addToSet: '$userId' }
            }
          }
        ]),
        // Previous period
        Bet.aggregate([
          { $match: { createdAt: { $gte: prevPeriods[period].start, $lt: prevPeriods[period].end } } },
          {
            $group: {
              _id: null,
              bets: { $sum: 1 },
              volume: { $sum: '$amount' },
              payout: { $sum: '$payout' }
            }
          }
        ]),
        // New users current
        User.countDocuments({ createdAt: { $gte: periods[period] } }),
        // New users previous
        User.countDocuments({
          createdAt: { $gte: prevPeriods[period].start, $lt: prevPeriods[period].end }
        })
      ]);

      const curr = current[0] || { bets: 0, volume: 0, payout: 0, uniqueUsers: [] };
      const prev = previous[0] || { bets: 0, volume: 0, payout: 0 };

      const calcChange = (c: number, p: number) => p === 0 ? 0 : Math.round(((c - p) / p) * 100);

      return {
        bets: curr.bets,
        betsChange: calcChange(curr.bets, prev.bets),
        volume: curr.volume,
        volumeChange: calcChange(curr.volume, prev.volume),
        profit: curr.volume - curr.payout,
        profitChange: calcChange(curr.volume - curr.payout, prev.volume - prev.payout),
        activeUsers: curr.uniqueUsers?.length || 0,
        newUsers,
        newUsersChange: calcChange(newUsers, newUsersPrev)
      };
    };

    const [trends24h, trends7d, trends30d] = await Promise.all([
      getTrendData('24h'),
      getTrendData('7d'),
      getTrendData('30d')
    ]);

    res.json({
      '24h': trends24h,
      '7d': trends7d,
      '30d': trends30d
    });
  } catch (error) {
    console.error('Failed to fetch trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

/**
 * Revenue breakdown by game and currency
 * GET /api/admin/stats/revenue
 */
router.get('/stats/revenue', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { period = '7d' } = req.query;
    const now = new Date();

    const periodMap: Record<string, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const startDate = new Date(now.getTime() - (periodMap[period as string] || periodMap['7d']));

    const [byGame, byCurrency, dailyRevenue] = await Promise.all([
      // Revenue by game
      Bet.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$gameType',
            volume: { $sum: '$amount' },
            payout: { $sum: '$payout' },
            bets: { $sum: 1 }
          }
        },
        {
          $addFields: {
            profit: { $subtract: ['$volume', '$payout'] },
            profitMargin: {
              $multiply: [
                { $divide: [{ $subtract: ['$volume', '$payout'] }, '$volume'] },
                100
              ]
            }
          }
        },
        { $sort: { volume: -1 } }
      ]),

      // Revenue by currency
      Bet.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$currency',
            volume: { $sum: '$amount' },
            payout: { $sum: '$payout' },
            bets: { $sum: 1 }
          }
        },
        {
          $addFields: {
            profit: { $subtract: ['$volume', '$payout'] }
          }
        },
        { $sort: { volume: -1 } }
      ]),

      // Daily revenue trend
      Bet.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            volume: { $sum: '$amount' },
            payout: { $sum: '$payout' },
            bets: { $sum: 1 }
          }
        },
        {
          $addFields: {
            profit: { $subtract: ['$volume', '$payout'] }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Calculate totals
    const totals = {
      volume: byGame.reduce((sum, g) => sum + g.volume, 0),
      payout: byGame.reduce((sum, g) => sum + g.payout, 0),
      profit: byGame.reduce((sum, g) => sum + (g.profit || 0), 0),
      bets: byGame.reduce((sum, g) => sum + g.bets, 0)
    };

    res.json({
      period,
      totals,
      byGame,
      byCurrency,
      dailyTrend: dailyRevenue
    });
  } catch (error) {
    console.error('Failed to fetch revenue:', error);
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
});

export default router;

