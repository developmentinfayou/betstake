import { Router } from 'express';
import { PlatformSettings, DEFAULT_PLATFORM_SETTINGS, AdminActivityLog } from '@casino/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole } from '@casino/database';

const router = Router();

// Admin middleware
const requireAdmin = (req: AuthRequest, res: any, next: any) => {
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Super admin only for critical settings
const requireSuperAdmin = (req: AuthRequest, res: any, next: any) => {
    if (req.user.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({ error: 'Super admin access required' });
    }
    next();
};

/**
 * Get current platform settings
 * GET /api/admin/settings
 */
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        let settings = await PlatformSettings.findOne();

        if (!settings) {
            // Return defaults if no settings exist
            return res.json({ ...DEFAULT_PLATFORM_SETTINGS, isDefault: true });
        }

        // Convert Map to object for JSON response
        const response = {
            ...settings.toObject(),
            minBetAmount: Object.fromEntries(settings.minBetAmount || new Map()),
            maxBetAmount: Object.fromEntries(settings.maxBetAmount || new Map()),
            jackpotMinSeed: Object.fromEntries(settings.jackpotMinSeed || new Map()),
            maxDailyWithdrawal: Object.fromEntries(settings.maxDailyWithdrawal || new Map()),
            newUserBonusAmount: Object.fromEntries(settings.newUserBonusAmount || new Map())
        };

        res.json(response);
    } catch (error) {
        console.error('Failed to get settings:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

/**
 * Update platform settings
 * PUT /api/admin/settings
 */
router.put('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const updates = req.body;

        // Remove isDefault flag if present
        delete updates.isDefault;

        // Convert objects back to Maps
        if (updates.minBetAmount) updates.minBetAmount = new Map(Object.entries(updates.minBetAmount));
        if (updates.maxBetAmount) updates.maxBetAmount = new Map(Object.entries(updates.maxBetAmount));
        if (updates.jackpotMinSeed) updates.jackpotMinSeed = new Map(Object.entries(updates.jackpotMinSeed));
        if (updates.maxDailyWithdrawal) updates.maxDailyWithdrawal = new Map(Object.entries(updates.maxDailyWithdrawal));
        if (updates.newUserBonusAmount) updates.newUserBonusAmount = new Map(Object.entries(updates.newUserBonusAmount));

        // Add updatedBy
        updates.updatedBy = req.user._id;

        const settings = await PlatformSettings.findOneAndUpdate(
            {},
            updates,
            { new: true, upsert: true }
        );

        // Log to audit
        try {
            await AdminActivityLog.create({
                adminId: req.user._id,
                adminUsername: req.user.username || req.user.email || 'admin',
                action: 'UPDATE_PLATFORM_SETTINGS',
                targetType: 'SETTINGS',
                targetId: settings._id.toString(),
                newValue: {
                    maintenanceMode: updates.maintenanceMode,
                    defaultHouseEdge: updates.defaultHouseEdge
                },
                ipAddress: req.ip || 'unknown'
            });
        } catch (logError) {
            console.error('Failed to log admin activity:', logError);
        }

        // Convert Map to object for response
        const response = {
            ...settings.toObject(),
            minBetAmount: Object.fromEntries(settings.minBetAmount || new Map()),
            maxBetAmount: Object.fromEntries(settings.maxBetAmount || new Map()),
            jackpotMinSeed: Object.fromEntries(settings.jackpotMinSeed || new Map()),
            maxDailyWithdrawal: Object.fromEntries(settings.maxDailyWithdrawal || new Map()),
            newUserBonusAmount: Object.fromEntries(settings.newUserBonusAmount || new Map())
        };

        res.json(response);
    } catch (error) {
        console.error('Failed to update settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

/**
 * Reset settings to defaults
 * POST /api/admin/settings/reset
 */
router.post('/reset', authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
        // Delete existing settings
        await PlatformSettings.deleteMany({});

        // Create new with defaults
        const settings = await PlatformSettings.create({
            ...DEFAULT_PLATFORM_SETTINGS,
            minBetAmount: new Map(Object.entries(DEFAULT_PLATFORM_SETTINGS.minBetAmount)),
            maxBetAmount: new Map(Object.entries(DEFAULT_PLATFORM_SETTINGS.maxBetAmount)),
            jackpotMinSeed: new Map(Object.entries(DEFAULT_PLATFORM_SETTINGS.jackpotMinSeed)),
            maxDailyWithdrawal: new Map(Object.entries(DEFAULT_PLATFORM_SETTINGS.maxDailyWithdrawal)),
            newUserBonusAmount: new Map(Object.entries(DEFAULT_PLATFORM_SETTINGS.newUserBonusAmount)),
            updatedBy: req.user._id
        });

        // Log to audit
        try {
            await AdminActivityLog.create({
                adminId: req.user._id,
                adminUsername: req.user.username || req.user.email || 'admin',
                action: 'RESET_PLATFORM_SETTINGS',
                targetType: 'SETTINGS',
                targetId: settings._id.toString(),
                newValue: { resetToDefaults: true },
                ipAddress: req.ip || 'unknown'
            });
        } catch (logError) {
            console.error('Failed to log admin activity:', logError);
        }

        res.json({ success: true, message: 'Settings reset to defaults', settings: DEFAULT_PLATFORM_SETTINGS });
    } catch (error) {
        console.error('Failed to reset settings:', error);
        res.status(500).json({ error: 'Failed to reset settings' });
    }
});

/**
 * Toggle maintenance mode (quick action)
 * POST /api/admin/settings/maintenance
 */
router.post('/maintenance', authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
        const { enabled, message } = req.body;

        const settings = await PlatformSettings.findOneAndUpdate(
            {},
            {
                maintenanceMode: enabled,
                maintenanceMessage: message || 'We are currently performing maintenance. Please check back soon.',
                updatedBy: req.user._id
            },
            { new: true, upsert: true }
        );

        // Log to audit
        try {
            await AdminActivityLog.create({
                adminId: req.user._id,
                adminUsername: req.user.username || req.user.email || 'admin',
                action: enabled ? 'ENABLE_MAINTENANCE' : 'DISABLE_MAINTENANCE',
                targetType: 'SETTINGS',
                targetId: settings._id.toString(),
                newValue: { enabled, message },
                ipAddress: req.ip || 'unknown'
            });
        } catch (logError) {
            console.error('Failed to log admin activity:', logError);
        }

        res.json({ success: true, maintenanceMode: enabled });
    } catch (error) {
        console.error('Failed to toggle maintenance:', error);
        res.status(500).json({ error: 'Failed to toggle maintenance' });
    }
});

export default router;
