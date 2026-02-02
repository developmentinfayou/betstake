import { Router, Response } from 'express';
import { Bet, Jackpot, User, Rakeback, AdminActivityLog } from '@casino/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole } from '@casino/database';
import mongoose from 'mongoose';

const router = Router();

// Admin middleware
const requireAdmin = (req: AuthRequest, res: any, next: any) => {
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

/**
 * Revenue report by date range
 * GET /api/admin/reports/revenue
 */
router.get('/revenue', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const start = new Date(startDate as string || Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = new Date(endDate as string || Date.now());

        // Group format based on groupBy
        const dateFormat = groupBy === 'hour' ? { $hour: '$createdAt' }
            : groupBy === 'month' ? { $month: '$createdAt' }
                : { $dayOfYear: '$createdAt' };

        const revenue = await Bet.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d', date: '$createdAt' } },
                        currency: '$currency'
                    },
                    totalWagered: { $sum: '$amount' },
                    totalPayout: { $sum: '$payout' },
                    betsCount: { $sum: 1 },
                    winsCount: { $sum: { $cond: [{ $gt: ['$payout', 0] }, 1, 0] } }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        // Calculate profit (wagered - payout)
        const processed = revenue.map(r => ({
            date: r._id.date,
            currency: r._id.currency,
            wagered: r.totalWagered,
            payout: r.totalPayout,
            profit: r.totalWagered - r.totalPayout,
            bets: r.betsCount,
            wins: r.winsCount,
            winRate: ((r.winsCount / r.betsCount) * 100).toFixed(2)
        }));

        // Summary
        const summary = {
            totalWagered: processed.reduce((acc, r) => acc + r.wagered, 0),
            totalPayout: processed.reduce((acc, r) => acc + r.payout, 0),
            totalProfit: processed.reduce((acc, r) => acc + r.profit, 0),
            totalBets: processed.reduce((acc, r) => acc + r.bets, 0),
            dateRange: { start, end }
        };

        res.json({ data: processed, summary });
    } catch (error) {
        console.error('Failed to get revenue report:', error);
        res.status(500).json({ error: 'Failed to get revenue report' });
    }
});

/**
 * P&L by game type
 * GET /api/admin/reports/pnl-by-game
 */
router.get('/pnl-by-game', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { startDate, endDate } = req.query;

        const start = new Date(startDate as string || Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = new Date(endDate as string || Date.now());

        const pnl = await Bet.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { gameType: '$gameType', currency: '$currency' },
                    totalWagered: { $sum: '$amount' },
                    totalPayout: { $sum: '$payout' },
                    betsCount: { $sum: 1 },
                    uniquePlayers: { $addToSet: '$userId' }
                }
            },
            { $sort: { totalWagered: -1 } }
        ]);

        const processed = pnl.map(p => ({
            gameType: p._id.gameType,
            currency: p._id.currency,
            wagered: p.totalWagered,
            payout: p.totalPayout,
            profit: p.totalWagered - p.totalPayout,
            profitMargin: (((p.totalWagered - p.totalPayout) / p.totalWagered) * 100).toFixed(2),
            bets: p.betsCount,
            uniquePlayers: p.uniquePlayers.length
        }));

        res.json({ data: processed, dateRange: { start, end } });
    } catch (error) {
        console.error('Failed to get P&L by game:', error);
        res.status(500).json({ error: 'Failed to get P&L report' });
    }
});

/**
 * Jackpot history
 * GET /api/admin/reports/jackpot-history
 */
router.get('/jackpot-history', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;

        // Get jackpot wins from activity logs
        const [wins, total] = await Promise.all([
            AdminActivityLog.find({ action: { $in: ['JACKPOT_WIN', 'MANUAL_JACKPOT_TRIGGER'] } })
                .sort({ createdAt: -1 })
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .populate('adminId', 'username'),
            AdminActivityLog.countDocuments({ action: { $in: ['JACKPOT_WIN', 'MANUAL_JACKPOT_TRIGGER'] } })
        ]);

        // Get current jackpot pools
        const pools = await Jackpot.find().select('gameType currentAmount lastWinAt lastWinAmount');

        res.json({ wins, total, pools, page: Number(page), limit: Number(limit) });
    } catch (error) {
        console.error('Failed to get jackpot history:', error);
        res.status(500).json({ error: 'Failed to get jackpot history' });
    }
});

/**
 * Export CSV
 * GET /api/admin/reports/export
 */
router.get('/export', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { type, startDate, endDate } = req.query;

        const start = new Date(startDate as string || Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = new Date(endDate as string || Date.now());

        let csvData = '';
        let filename = '';

        if (type === 'revenue') {
            const revenue = await Bet.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        wagered: { $sum: '$amount' },
                        payout: { $sum: '$payout' },
                        bets: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            csvData = 'Date,Wagered,Payout,Profit,Bets\n';
            revenue.forEach(r => {
                csvData += `${r._id},${r.wagered.toFixed(2)},${r.payout.toFixed(2)},${(r.wagered - r.payout).toFixed(2)},${r.bets}\n`;
            });
            filename = `revenue_${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}.csv`;

        } else if (type === 'users') {
            const users = await User.find({ createdAt: { $gte: start, $lte: end } })
                .select('username email createdAt role')
                .sort({ createdAt: -1 });

            csvData = 'Username,Email,Joined,Role\n';
            users.forEach(u => {
                csvData += `${u.username},${u.email},${u.createdAt.toISOString().slice(0, 10)},${u.role}\n`;
            });
            filename = `users_${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}.csv`;

        } else if (type === 'bets') {
            const bets = await Bet.find({ createdAt: { $gte: start, $lte: end } })
                .select('gameType amount payout currency createdAt')
                .sort({ createdAt: -1 })
                .limit(10000);

            csvData = 'Game,Amount,Payout,Currency,Date\n';
            bets.forEach(b => {
                csvData += `${b.gameType},${b.amount},${b.payout},${b.currency},${b.createdAt.toISOString()}\n`;
            });
            filename = `bets_${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}.csv`;
        } else {
            return res.status(400).json({ error: 'Invalid export type' });
        }

        // Log export action
        await AdminActivityLog.create({
            adminId: req.user._id,
            action: 'EXPORT_REPORT',
            targetType: 'REPORT',
            targetId: type,
            details: { type, startDate: start, endDate: end },
            ipAddress: req.ip || 'unknown'
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvData);
    } catch (error) {
        console.error('Failed to export:', error);
        res.status(500).json({ error: 'Failed to export' });
    }
});

/**
 * Get user activity summary
 * GET /api/admin/reports/user-activity
 */
router.get('/user-activity', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { startDate, endDate } = req.query;

        const start = new Date(startDate as string || Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = new Date(endDate as string || Date.now());

        const [newUsers, activeUsers, topPlayers] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
            Bet.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end } } },
                { $group: { _id: '$userId' } },
                { $count: 'count' }
            ]),
            Bet.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end } } },
                {
                    $group: {
                        _id: '$userId',
                        totalWagered: { $sum: '$amount' },
                        betsCount: { $sum: 1 }
                    }
                },
                { $sort: { totalWagered: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                }
            ])
        ]);

        res.json({
            newUsers,
            activeUsers: activeUsers[0]?.count || 0,
            topPlayers: topPlayers.map(p => ({
                username: p.user[0]?.username || 'Unknown',
                wagered: p.totalWagered,
                bets: p.betsCount
            })),
            dateRange: { start, end }
        });
    } catch (error) {
        console.error('Failed to get user activity:', error);
        res.status(500).json({ error: 'Failed to get user activity' });
    }
});

export default router;
