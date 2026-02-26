import { Router } from 'express';
import { GameInfo, DEFAULT_GAME_INFO, AdminActivityLog, AdminAction, AdminTargetType } from '@casino/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole, GameType } from '@casino/database';

const router = Router();

// Admin middleware
function requireAdmin(req: AuthRequest, res: any, next: any) {
    if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

/**
 * Get all game info
 * GET /api/admin/game-info
 */
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const gameInfoList = await GameInfo.find().sort({ gameType: 1 });
        res.json(gameInfoList);
    } catch (error) {
        console.error('Failed to get game info:', error);
        res.status(500).json({ error: 'Failed to get game info' });
    }
});

/**
 * Get game info for a specific game
 * GET /api/admin/game-info/:gameType
 */
router.get('/:gameType', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { gameType } = req.params;
        let info = await GameInfo.findOne({ gameType: gameType.toUpperCase() });

        if (!info) {
            // Return defaults with gameType
            return res.json({
                gameType: gameType.toUpperCase(),
                ...DEFAULT_GAME_INFO,
                isDefault: true
            });
        }

        res.json(info);
    } catch (error) {
        console.error('Failed to get game info:', error);
        res.status(500).json({ error: 'Failed to get game info' });
    }
});

/**
 * Upsert game info for a specific game
 * PUT /api/admin/game-info/:gameType
 */
router.put('/:gameType', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { gameType } = req.params;
        const updates = req.body;

        // Remove meta fields
        delete updates._id;
        delete updates.__v;
        delete updates.isDefault;
        delete updates.createdAt;
        delete updates.updatedAt;

        updates.gameType = gameType.toUpperCase();
        updates.updatedBy = req.user._id;

        const info = await GameInfo.findOneAndUpdate(
            { gameType: gameType.toUpperCase() },
            updates,
            { new: true, upsert: true }
        );

        // Audit log
        try {
            if (req.user?._id) {
                await AdminActivityLog.create({
                    adminId: req.user._id,
                    adminUsername: req.user.username || req.user.email || 'admin',
                    action: AdminAction.GAME_CONFIG_UPDATE,
                    targetType: AdminTargetType.GAME,
                    targetId: gameType.toUpperCase(),
                    targetName: `Game Info: ${gameType.toUpperCase()}`,
                    newValue: updates,
                    ipAddress: req.ip || 'unknown'
                });
            }
        } catch (logError) {
            console.error('Failed to log admin activity:', logError);
        }

        res.json(info);
    } catch (error) {
        console.error('Failed to update game info:', error);
        res.status(500).json({ error: 'Failed to update game info' });
    }
});

/**
 * Initialize game info for all games with defaults
 * POST /api/admin/game-info/initialize
 */
router.post('/initialize', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const allGameTypes = Object.values(GameType);
        const results = [];

        for (const gameType of allGameTypes) {
            const existing = await GameInfo.findOne({ gameType });
            if (!existing) {
                await GameInfo.create({
                    gameType,
                    ...DEFAULT_GAME_INFO,
                    updatedBy: req.user._id
                });
                results.push({ gameType, status: 'created' });
            } else {
                results.push({ gameType, status: 'exists' });
            }
        }

        res.json({
            message: 'Game info initialized',
            results,
            created: results.filter(r => r.status === 'created').length,
            existing: results.filter(r => r.status === 'exists').length
        });
    } catch (error) {
        console.error('Failed to initialize game info:', error);
        res.status(500).json({ error: 'Failed to initialize game info' });
    }
});

export default router;
