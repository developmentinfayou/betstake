import { Router } from 'express';
import {
    RakebackConfig,
    Rakeback,
    DEFAULT_RAKEBACK_TIERS,
    DEFAULT_ELIGIBLE_GAMES,
    AdminActivityLog,
    User,
    Bet
} from '@casino/database';
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
 * Get rakeback configuration for a currency
 * GET /api/admin/rakeback/config/:currency
 */
router.get('/config/:currency', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { currency } = req.params;

        let config = await RakebackConfig.findOne({ currency: currency.toUpperCase() });

        // Return defaults if no config exists
        if (!config) {
            return res.json({
                currency: currency.toUpperCase(),
                enabled: true,
                tiers: DEFAULT_RAKEBACK_TIERS,
                minClaimAmount: 1,
                maxClaimAmount: 10000,
                autoCredit: false,
                eligibleGames: DEFAULT_ELIGIBLE_GAMES,
                contributionPercent: 5,
                isDefault: true
            });
        }

        res.json(config);
    } catch (error) {
        console.error('Failed to get rakeback config:', error);
        res.status(500).json({ error: 'Failed to get rakeback config' });
    }
});

/**
 * Get all rakeback configurations
 * GET /api/admin/rakeback/configs
 */
router.get('/configs', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const configs = await RakebackConfig.find().sort({ currency: 1 });
        res.json(configs);
    } catch (error) {
        console.error('Failed to get rakeback configs:', error);
        res.status(500).json({ error: 'Failed to get rakeback configs' });
    }
});

/**
 * Update rakeback configuration
 * PUT /api/admin/rakeback/config/:currency
 */
router.put('/config/:currency', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { currency } = req.params;
        const { enabled, tiers, minClaimAmount, maxClaimAmount, autoCredit, eligibleGames, contributionPercent } = req.body;

        const config = await RakebackConfig.findOneAndUpdate(
            { currency: currency.toUpperCase() },
            {
                currency: currency.toUpperCase(),
                enabled,
                tiers,
                minClaimAmount,
                maxClaimAmount,
                autoCredit,
                eligibleGames,
                contributionPercent,
                updatedBy: req.user._id
            },
            { new: true, upsert: true }
        );

        // Log to audit
        try {
            await AdminActivityLog.create({
                adminId: req.user._id,
                adminUsername: req.user.username || req.user.email || 'admin',
                action: 'UPDATE_RAKEBACK_CONFIG',
                targetType: 'RAKEBACK',
                targetId: currency.toUpperCase(),
                newValue: { enabled, tiersCount: tiers?.length, contributionPercent },
                ipAddress: req.ip || 'unknown'
            });
        } catch (logError) {
            console.error('Failed to log admin activity:', logError);
        }

        res.json(config);
    } catch (error) {
        console.error('Failed to update rakeback config:', error);
        res.status(500).json({ error: 'Failed to update rakeback config' });
    }
});

/**
 * Get pending rakeback claims
 * GET /api/admin/rakeback/pending
 */
router.get('/pending', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { page = 1, limit = 50, currency } = req.query;

        const query: any = { claimed: false };
        if (currency) query.currency = currency;

        const [claims, total] = await Promise.all([
            Rakeback.find(query)
                .populate('userId', 'username email')
                .sort({ createdAt: -1 })
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit)),
            Rakeback.countDocuments(query)
        ]);

        // Get totals by currency
        const totals = await Rakeback.aggregate([
            { $match: { claimed: false } },
            { $group: { _id: '$currency', total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        res.json({ claims, total, page: Number(page), limit: Number(limit), totals });
    } catch (error) {
        console.error('Failed to get pending claims:', error);
        res.status(500).json({ error: 'Failed to get pending claims' });
    }
});

/**
 * Get rakeback stats
 * GET /api/admin/rakeback/stats
 */
router.get('/stats', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const [pending, claimed, recentClaims] = await Promise.all([
            Rakeback.aggregate([
                { $match: { claimed: false } },
                { $group: { _id: '$currency', total: { $sum: '$amount' }, count: { $sum: 1 } } }
            ]),
            Rakeback.aggregate([
                { $match: { claimed: true } },
                { $group: { _id: '$currency', total: { $sum: '$amount' }, count: { $sum: 1 } } }
            ]),
            Rakeback.find({ claimed: true })
                .sort({ claimedAt: -1 })
                .limit(10)
                .populate('userId', 'username')
        ]);

        res.json({
            pending: pending.reduce((acc, p) => ({ ...acc, [p._id]: p }), {}),
            claimed: claimed.reduce((acc, c) => ({ ...acc, [c._id]: c }), {}),
            recentClaims
        });
    } catch (error) {
        console.error('Failed to get rakeback stats:', error);
        res.status(500).json({ error: 'Failed to get rakeback stats' });
    }
});

/**
 * Manually approve/process a rakeback claim
 * POST /api/admin/rakeback/:id/approve
 */
router.post('/:id/approve', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        const claim = await Rakeback.findByIdAndUpdate(
            id,
            { claimed: true, claimedAt: new Date() },
            { new: true }
        ).populate('userId', 'username email');

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        // Log to audit
        try {
            await AdminActivityLog.create({
                adminId: req.user._id,
                adminUsername: req.user.username || req.user.email || 'admin',
                action: 'APPROVE_RAKEBACK',
                targetType: 'RAKEBACK',
                targetId: id,
                newValue: { amount: claim.amount, currency: claim.currency, userId: claim.userId },
                ipAddress: req.ip || 'unknown'
            });
        } catch (logError) {
            console.error('Failed to log admin activity:', logError);
        }

        res.json({ success: true, claim });
    } catch (error) {
        console.error('Failed to approve claim:', error);
        res.status(500).json({ error: 'Failed to approve claim' });
    }
});

/**
 * Get user rakeback tier info
 * GET /api/admin/rakeback/user/:userId
 */
router.get('/user/:userId', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { userId } = req.params;

        // Get user's total wagered
        const wageredStats = await Bet.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: '$currency', totalWagered: { $sum: '$amount' } } }
        ]);

        // Get pending and claimed rakeback
        const [pending, claimed] = await Promise.all([
            Rakeback.find({ userId, claimed: false }),
            Rakeback.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId), claimed: true } },
                { $group: { _id: '$currency', total: { $sum: '$amount' } } }
            ])
        ]);

        res.json({
            userId,
            wagered: wageredStats.reduce((acc, w) => ({ ...acc, [w._id]: w.totalWagered }), {}),
            pending,
            claimed: claimed.reduce((acc, c) => ({ ...acc, [c._id]: c.total }), {})
        });
    } catch (error) {
        console.error('Failed to get user rakeback:', error);
        res.status(500).json({ error: 'Failed to get user rakeback' });
    }
});

export default router;
