import { Router } from 'express';
import { WinCategories, DEFAULT_WIN_CATEGORIES, AdminActivityLog, AdminAction, AdminTargetType } from '@casino/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole } from '@casino/database';

const router = Router();

// Admin middleware
function requireAdmin(req: AuthRequest, res: any, next: any) {
    if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

/**
 * Get win category settings
 * GET /api/admin/win-categories
 */
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        let settings = await WinCategories.findOne();

        if (!settings) {
            return res.json({ ...DEFAULT_WIN_CATEGORIES, isDefault: true });
        }

        // Convert Map to object for response
        const response: any = settings.toObject();
        if (settings.luckyWin?.perGameMinMultiplier instanceof Map) {
            response.luckyWin = {
                ...response.luckyWin,
                perGameMinMultiplier: Object.fromEntries(settings.luckyWin.perGameMinMultiplier)
            };
        }

        res.json(response);
    } catch (error) {
        console.error('Failed to get win categories:', error);
        res.status(500).json({ error: 'Failed to get win categories' });
    }
});

/**
 * Update win category settings
 * PUT /api/admin/win-categories
 */
router.put('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const updates = req.body;

        // Remove meta fields
        delete updates.isDefault;
        delete updates._id;
        delete updates.__v;
        delete updates.createdAt;
        delete updates.updatedAt;

        updates.updatedBy = req.user._id;

        // Convert perGameMinMultiplier to Map if needed
        if (updates.luckyWin?.perGameMinMultiplier && !(updates.luckyWin.perGameMinMultiplier instanceof Map)) {
            updates.luckyWin.perGameMinMultiplier = new Map(Object.entries(updates.luckyWin.perGameMinMultiplier));
        }

        const settings = await WinCategories.findOneAndUpdate(
            {},
            updates,
            { new: true, upsert: true }
        );

        // Audit log
        try {
            if (req.user?._id) {
                await AdminActivityLog.create({
                    adminId: req.user._id,
                    adminUsername: req.user.username || req.user.email || 'admin',
                    action: AdminAction.PLATFORM_SETTINGS_UPDATE,
                    targetType: AdminTargetType.SETTINGS,
                    targetName: 'Win Categories',
                    newValue: updates,
                    ipAddress: req.ip || 'unknown'
                });
            }
        } catch (logError) {
            console.error('Failed to log admin activity:', logError);
        }

        // Convert Map for response
        const response: any = settings.toObject();
        if (settings.luckyWin?.perGameMinMultiplier instanceof Map) {
            response.luckyWin = {
                ...response.luckyWin,
                perGameMinMultiplier: Object.fromEntries(settings.luckyWin.perGameMinMultiplier)
            };
        }

        res.json(response);
    } catch (error) {
        console.error('Failed to update win categories:', error);
        res.status(500).json({ error: 'Failed to update win categories' });
    }
});

export default router;
