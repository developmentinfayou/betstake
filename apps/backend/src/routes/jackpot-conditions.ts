import { Router } from 'express';
import {
    JackpotConditionConfig,
    DEFAULT_GAME_CONDITIONS,
    DEFAULT_PAYOUT_TIERS,
    AdminActivityLog,
    Jackpot
} from '@casino/database';
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

/**
 * Get all jackpot conditions for all games
 * GET /api/admin/jackpot-conditions
 */
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const configs = await JackpotConditionConfig.find().sort({ gameType: 1 });
        res.json(configs);
    } catch (error) {
        console.error('Failed to get jackpot conditions:', error);
        res.status(500).json({ error: 'Failed to get jackpot conditions' });
    }
});

/**
 * Get jackpot conditions for a specific game
 * GET /api/admin/jackpot-conditions/:gameType
 */
router.get('/:gameType', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { gameType } = req.params;

        let config = await JackpotConditionConfig.findOne({ gameType: gameType.toUpperCase() });

        // If no config exists, return defaults
        if (!config) {
            const defaultConditions = DEFAULT_GAME_CONDITIONS[gameType.toUpperCase()] || [];
            return res.json({
                gameType: gameType.toUpperCase(),
                enabled: true,
                conditions: defaultConditions,
                payoutTiers: DEFAULT_PAYOUT_TIERS,
                minBetAmount: { USD: 1, BTC: 0.00001, ETH: 0.0001 },
                houseEdgeContribution: 10,
                isDefault: true
            });
        }

        res.json(config);
    } catch (error) {
        console.error('Failed to get jackpot conditions:', error);
        res.status(500).json({ error: 'Failed to get jackpot conditions' });
    }
});

/**
 * Update jackpot conditions for a game
 * PUT /api/admin/jackpot-conditions/:gameType
 */
router.put('/:gameType', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { gameType } = req.params;
        const { enabled, conditions, payoutTiers, winnerIdentifier, minBetAmount, houseEdgeContribution } = req.body;

        // Validate conditions array if provided
        if (conditions !== undefined && !Array.isArray(conditions)) {
            return res.status(400).json({ error: 'conditions must be an array' });
        }

        // Validate payoutTiers array if provided
        if (payoutTiers !== undefined && !Array.isArray(payoutTiers)) {
            return res.status(400).json({ error: 'payoutTiers must be an array' });
        }

        const config = await JackpotConditionConfig.findOneAndUpdate(
            { gameType: gameType.toUpperCase() },
            {
                gameType: gameType.toUpperCase(),
                enabled,
                conditions,
                payoutTiers,
                winnerIdentifier,
                minBetAmount: minBetAmount ? new Map(Object.entries(minBetAmount)) : undefined,
                houseEdgeContribution,
                updatedBy: req.user._id
            },
            { new: true, upsert: true }
        );

        // Log to audit - wrapped in try-catch to not fail the update if logging fails
        try {
            await AdminActivityLog.create({
                adminId: req.user._id,
                adminUsername: req.user.username || req.user.email || 'admin',
                action: 'JACKPOT_CONFIG_UPDATE',
                targetType: 'JACKPOT',
                targetId: gameType.toUpperCase(),
                newValue: { enabled, conditionsCount: conditions?.length, payoutTiersCount: payoutTiers?.length },
                ipAddress: req.ip || req.headers?.['x-forwarded-for'] as string || 'unknown'
            });
        } catch (logError) {
            console.error('Failed to log admin activity:', logError);
            // Continue - don't fail the update just because logging failed
        }

        res.json(config);
    } catch (error: any) {
        console.error('Failed to update jackpot conditions:', error);
        res.status(500).json({
            error: 'Failed to update jackpot conditions',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Initialize default conditions for all games
 * POST /api/admin/jackpot-conditions/initialize
 */
router.post('/initialize', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const results = [];

        for (const [gameType, conditions] of Object.entries(DEFAULT_GAME_CONDITIONS)) {
            const existing = await JackpotConditionConfig.findOne({ gameType });

            if (!existing) {
                const config = await JackpotConditionConfig.create({
                    gameType,
                    enabled: true,
                    conditions,
                    payoutTiers: DEFAULT_PAYOUT_TIERS,
                    minBetAmount: new Map([['USD', 1], ['BTC', 0.00001], ['ETH', 0.0001]]),
                    houseEdgeContribution: 10,
                    createdBy: req.user._id
                });
                results.push({ gameType, status: 'created' });
            } else {
                results.push({ gameType, status: 'exists' });
            }
        }

        res.json({ message: 'Initialization complete', results });
    } catch (error) {
        console.error('Failed to initialize jackpot conditions:', error);
        res.status(500).json({ error: 'Failed to initialize jackpot conditions' });
    }
});

/**
 * Manual trigger jackpot for testing
 * POST /api/admin/jackpot-conditions/:gameType/trigger
 */
router.post('/:gameType/trigger', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { gameType } = req.params;
        const { userId, amount, reason } = req.body;

        if (!reason || reason.trim().length < 5) {
            return res.status(400).json({ error: 'Reason is required (min 5 chars)' });
        }

        // Find the jackpot for this game
        const jackpot = await Jackpot.findOne({ gameType: gameType.toUpperCase() });

        if (!jackpot) {
            return res.status(404).json({ error: 'No jackpot found for this game' });
        }

        const payoutAmount = amount || jackpot.currentAmount;
        const previousAmount = jackpot.currentAmount;

        // Update jackpot - reset to minimum
        jackpot.currentAmount = jackpot.minAmount;
        jackpot.lastWinnerId = userId;
        jackpot.lastWinAmount = payoutAmount;
        jackpot.lastWinAt = new Date();
        await jackpot.save();

        // Log to audit
        try {
            await AdminActivityLog.create({
                adminId: req.user._id,
                adminUsername: req.user.username || req.user.email || 'admin',
                action: 'JACKPOT_MANUAL_TRIGGER',
                targetType: 'JACKPOT',
                targetId: jackpot._id.toString(),
                previousValue: { amount: previousAmount },
                newValue: {
                    gameType: gameType.toUpperCase(),
                    payoutAmount,
                    userId,
                    isTest: true
                },
                reason,
                ipAddress: req.ip || req.headers?.['x-forwarded-for'] as string || 'unknown'
            });
        } catch (logError) {
            console.error('Failed to log admin activity:', logError);
        }

        res.json({
            success: true,
            gameType: gameType.toUpperCase(),
            previousAmount,
            payoutAmount,
            newAmount: jackpot.minAmount,
            message: `Jackpot manually triggered for ${gameType.toUpperCase()}`
        });
    } catch (error) {
        console.error('Failed to trigger jackpot:', error);
        res.status(500).json({ error: 'Failed to trigger jackpot' });
    }
});

/**
 * Test condition logic (dry run)
 * POST /api/admin/jackpot-conditions/:gameType/test
 */
router.post('/:gameType/test', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { gameType } = req.params;
        const { conditionIndex, testData } = req.body;

        const config = await JackpotConditionConfig.findOne({ gameType: gameType.toUpperCase() });

        if (!config) {
            return res.status(404).json({ error: 'No configuration found for this game' });
        }

        const condition = config.conditions[conditionIndex];

        if (!condition) {
            return res.status(400).json({ error: 'Invalid condition index' });
        }

        // Simulate condition checking (dry run)
        let wouldTrigger = false;
        let explanation = '';

        switch (condition.type) {
            case 'HIT_VALUE':
                wouldTrigger = testData?.value === condition.value;
                explanation = `Value ${testData?.value} ${wouldTrigger ? 'matches' : 'does not match'} target ${condition.value}`;
                break;
            case 'RANDOM_CHANCE':
                const roll = Math.random() * 100;
                wouldTrigger = roll < (condition.probability || 0);
                explanation = `Random roll: ${roll.toFixed(4)}%, Threshold: ${condition.probability}% - ${wouldTrigger ? 'TRIGGERED' : 'not triggered'}`;
                break;
            case 'IN_A_ROW':
                wouldTrigger = (testData?.streak || 0) >= (condition.count || 0);
                explanation = `Streak ${testData?.streak || 0} ${wouldTrigger ? '>=' : '<'} required ${condition.count}`;
                break;
            default:
                explanation = `Condition type ${condition.type} - test not implemented`;
        }

        res.json({
            gameType: gameType.toUpperCase(),
            condition,
            testData,
            wouldTrigger,
            explanation
        });
    } catch (error) {
        console.error('Failed to test condition:', error);
        res.status(500).json({ error: 'Failed to test condition' });
    }
});

export default router;
