import { Router } from 'express';
import { GameSettings, DEFAULT_GAME_SETTINGS, AdminActivityLog, AdminAction, AdminTargetType } from '@casino/database';
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
 * Get current game settings
 * GET /api/admin/game-settings
 */
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        let settings = await GameSettings.findOne();

        if (!settings) {
            // Return defaults if no settings exist yet
            return res.json({ ...DEFAULT_GAME_SETTINGS, isDefault: true });
        }

        // Convert Maps to plain objects for JSON response
        const response: any = settings.toObject();
        if (settings.autoBetEnabled instanceof Map) {
            response.autoBetEnabled = Object.fromEntries(settings.autoBetEnabled);
        }
        if (settings.advancedAutoBetEnabled instanceof Map) {
            response.advancedAutoBetEnabled = Object.fromEntries(settings.advancedAutoBetEnabled);
        }
        if (settings.hotkeys?.perGameKeys instanceof Map) {
            response.hotkeys = {
                ...response.hotkeys,
                perGameKeys: Object.fromEntries(settings.hotkeys.perGameKeys)
            };
        }

        res.json(response);
    } catch (error) {
        console.error('Failed to get game settings:', error);
        res.status(500).json({ error: 'Failed to get game settings' });
    }
});

/**
 * Update game settings
 * PUT /api/admin/game-settings
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

        // Add updatedBy
        updates.updatedBy = req.user._id;

        // Convert plain objects to Maps for Map fields
        if (updates.autoBetEnabled && !(updates.autoBetEnabled instanceof Map)) {
            updates.autoBetEnabled = new Map(Object.entries(updates.autoBetEnabled));
        }
        if (updates.advancedAutoBetEnabled && !(updates.advancedAutoBetEnabled instanceof Map)) {
            updates.advancedAutoBetEnabled = new Map(Object.entries(updates.advancedAutoBetEnabled));
        }
        if (updates.hotkeys?.perGameKeys && !(updates.hotkeys.perGameKeys instanceof Map)) {
            updates.hotkeys.perGameKeys = new Map(Object.entries(updates.hotkeys.perGameKeys));
        }

        const settings = await GameSettings.findOneAndUpdate(
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
                    targetName: 'Game Settings',
                    newValue: updates,
                    ipAddress: req.ip || 'unknown'
                });
            }
        } catch (logError) {
            console.error('Failed to log admin activity:', logError);
        }

        // Convert Maps for response
        const response: any = settings.toObject();
        if (settings.autoBetEnabled instanceof Map) {
            response.autoBetEnabled = Object.fromEntries(settings.autoBetEnabled);
        }
        if (settings.advancedAutoBetEnabled instanceof Map) {
            response.advancedAutoBetEnabled = Object.fromEntries(settings.advancedAutoBetEnabled);
        }
        if (settings.hotkeys?.perGameKeys instanceof Map) {
            response.hotkeys = {
                ...response.hotkeys,
                perGameKeys: Object.fromEntries(settings.hotkeys.perGameKeys)
            };
        }

        res.json(response);
    } catch (error) {
        console.error('Failed to update game settings:', error);
        res.status(500).json({ error: 'Failed to update game settings' });
    }
});

export default router;
