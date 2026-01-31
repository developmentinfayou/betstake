import { Router } from 'express';
import { z } from 'zod';
import {
    AdminActivityLog,
    AdminAction,
    AdminTargetType,
    UserRole
} from '@casino/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Admin middleware - Requires ADMIN or SUPER_ADMIN role
 */
const requireAdmin = (req: AuthRequest, res: any, next: any) => {
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

/**
 * GET /api/admin/logs
 * Get paginated activity logs with filters
 */
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            action,
            targetType,
            adminId,
            startDate,
            endDate
        } = req.query;

        const query: any = {};

        if (action) {
            query.action = action;
        }

        if (targetType) {
            query.targetType = targetType;
        }

        if (adminId) {
            query.adminId = adminId;
        }

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate as string);
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate as string);
            }
        }

        const logs = await AdminActivityLog.find(query)
            .sort({ timestamp: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await AdminActivityLog.countDocuments(query);

        res.json({
            logs,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (error) {
        console.error('Failed to fetch activity logs:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

/**
 * GET /api/admin/logs/search
 * Search activity logs
 */
router.get('/search', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const {
            query: searchQuery,
            page = 1,
            limit = 50
        } = req.query;

        if (!searchQuery) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        // Search by username, targetName, or reason
        const logs = await AdminActivityLog.find({
            $or: [
                { adminUsername: { $regex: searchQuery, $options: 'i' } },
                { targetName: { $regex: searchQuery, $options: 'i' } },
                { reason: { $regex: searchQuery, $options: 'i' } },
                { targetId: searchQuery }
            ]
        })
            .sort({ timestamp: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            logs,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (error) {
        console.error('Failed to search activity logs:', error);
        res.status(500).json({ error: 'Failed to search activity logs' });
    }
});

/**
 * GET /api/admin/logs/actions
 * Get list of all action types for filter dropdown
 */
router.get('/actions', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    res.json({
        actions: Object.values(AdminAction),
        targetTypes: Object.values(AdminTargetType)
    });
});

/**
 * GET /api/admin/logs/stats
 * Get activity log statistics
 */
router.get('/stats', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { days = 7 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));

        // Total actions in period
        const totalActions = await AdminActivityLog.countDocuments({
            timestamp: { $gte: startDate }
        });

        // Actions by type
        const actionsByType = await AdminActivityLog.aggregate([
            { $match: { timestamp: { $gte: startDate } } },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Actions by admin
        const actionsByAdmin = await AdminActivityLog.aggregate([
            { $match: { timestamp: { $gte: startDate } } },
            { $group: { _id: { id: '$adminId', username: '$adminUsername' }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Recent sensitive actions (balance adjustments, bans, config changes)
        const sensitiveActions = [
            AdminAction.USER_BALANCE_ADJUST,
            AdminAction.USER_BAN,
            AdminAction.JACKPOT_MANUAL_TRIGGER,
            AdminAction.PLATFORM_SETTINGS_UPDATE
        ];

        const recentSensitive = await AdminActivityLog.find({
            action: { $in: sensitiveActions },
            timestamp: { $gte: startDate }
        })
            .sort({ timestamp: -1 })
            .limit(20);

        res.json({
            period: `${days} days`,
            totalActions,
            actionsByType,
            actionsByAdmin,
            recentSensitive
        });
    } catch (error) {
        console.error('Failed to fetch log stats:', error);
        res.status(500).json({ error: 'Failed to fetch log stats' });
    }
});

/**
 * GET /api/admin/logs/user/:userId
 * Get all admin actions affecting a specific user
 */
router.get('/user/:userId', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const logs = await AdminActivityLog.find({
            targetType: AdminTargetType.USER,
            targetId: userId
        })
            .sort({ timestamp: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await AdminActivityLog.countDocuments({
            targetType: AdminTargetType.USER,
            targetId: userId
        });

        res.json({
            logs,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (error) {
        console.error('Failed to fetch user logs:', error);
        res.status(500).json({ error: 'Failed to fetch user logs' });
    }
});

export default router;
