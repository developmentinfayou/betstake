import { Router } from 'express';
import { z } from 'zod';
import {
    Challenge,
    ChallengeStatus,
    ChallengeConditionType,
    ConditionOperator,
    WinnerType,
    PrizeDistribution,
    AdminActivityLog,
    AdminAction,
    AdminTargetType,
    GameType
} from '@casino/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole } from '@casino/database';

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
 * Log admin activity for audit trail
 */
const logAdminActivity = async (
    req: AuthRequest,
    action: AdminAction,
    targetType: AdminTargetType,
    targetId?: string,
    targetName?: string,
    previousValue?: any,
    newValue?: any,
    reason?: string
) => {
    try {
        await AdminActivityLog.create({
            timestamp: new Date(),
            adminId: req.user._id,
            adminUsername: req.user.username,
            action,
            targetType,
            targetId,
            targetName,
            previousValue,
            newValue,
            reason,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
            userAgent: req.headers['user-agent']
        });
    } catch (error) {
        console.error('Failed to log admin activity:', error);
    }
};

/**
 * Validation Schemas
 */
const challengeConditionSchema = z.object({
    type: z.nativeEnum(ChallengeConditionType),
    count: z.number().min(1).optional(),
    multiplierCondition: z.object({
        operator: z.nativeEnum(ConditionOperator),
        value: z.number().min(0)
    }).optional(),
    winChanceCondition: z.object({
        operator: z.nativeEnum(ConditionOperator),
        value: z.number().min(0).max(100)
    }).optional(),
    targetMultiplier: z.number().min(0).optional()
});

const createChallengeSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    image: z.string().url().optional(),
    games: z.array(z.string()).min(1),
    minBetAmount: z.number().min(0),
    currency: z.string().default('USD'),
    conditions: z.array(challengeConditionSchema).min(1),
    prize: z.object({
        type: z.enum(['FIXED', 'POOL']),
        amount: z.number().min(0),
        currency: z.string(),
        distribution: z.nativeEnum(PrizeDistribution).optional()
    }),
    winners: z.object({
        type: z.nativeEnum(WinnerType),
        count: z.number().min(1),
        duration: z.number().optional()
    }),
    startTime: z.string().transform(str => new Date(str)),
    endTime: z.string().transform(str => new Date(str)),
    status: z.nativeEnum(ChallengeStatus).optional()
});

const updateChallengeSchema = createChallengeSchema.partial();

/**
 * GET /api/admin/challenges
 * List all challenges with pagination and filters
 */
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            game
        } = req.query;

        const query: any = {};

        if (status) {
            query.status = status;
        }

        if (game) {
            query.games = game;
        }

        const challenges = await Challenge.find(query)
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Challenge.countDocuments(query);

        res.json({
            challenges,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (error) {
        console.error('Failed to fetch challenges:', error);
        res.status(500).json({ error: 'Failed to fetch challenges' });
    }
});

/**
 * GET /api/admin/challenges/:id
 * Get single challenge by ID
 */
router.get('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')
            .populate('completedBy', 'username');

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        res.json(challenge);
    } catch (error) {
        console.error('Failed to fetch challenge:', error);
        res.status(500).json({ error: 'Failed to fetch challenge' });
    }
});

/**
 * POST /api/admin/challenges
 * Create new challenge
 */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const validated = createChallengeSchema.parse(req.body);

        // Validate games exist
        const validGames = Object.values(GameType);
        for (const game of validated.games) {
            if (!validGames.includes(game as GameType)) {
                return res.status(400).json({ error: `Invalid game type: ${game}` });
            }
        }

        // Validate end time is after start time
        if (validated.endTime <= validated.startTime) {
            return res.status(400).json({ error: 'End time must be after start time' });
        }

        // Ensure user is authenticated with valid ID
        if (!req.user?._id) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const challenge = await Challenge.create({
            ...validated,
            createdBy: req.user._id,
            status: validated.status || ChallengeStatus.DRAFT
        });

        // Log admin activity
        await logAdminActivity(
            req,
            AdminAction.CHALLENGE_CREATE,
            AdminTargetType.CHALLENGE,
            challenge._id.toString(),
            challenge.title,
            null,
            validated
        );

        res.status(201).json(challenge);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('Failed to create challenge:', error);
        res.status(500).json({ error: 'Failed to create challenge' });
    }
});

/**
 * PUT /api/admin/challenges/:id
 * Update challenge
 */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Cannot update active or completed challenges (except to cancel)
        if (challenge.status === ChallengeStatus.ACTIVE && !req.body.status) {
            return res.status(400).json({ error: 'Cannot modify active challenge. Cancel it first.' });
        }

        if (challenge.status === ChallengeStatus.COMPLETED) {
            return res.status(400).json({ error: 'Cannot modify completed challenge' });
        }

        const validated = updateChallengeSchema.parse(req.body);
        const previousValue = challenge.toObject();

        // Validate games if provided
        if (validated.games) {
            const validGames = Object.values(GameType);
            for (const game of validated.games) {
                if (!validGames.includes(game as GameType)) {
                    return res.status(400).json({ error: `Invalid game type: ${game}` });
                }
            }
        }

        const updatedChallenge = await Challenge.findByIdAndUpdate(
            req.params.id,
            { ...validated, updatedBy: req.user._id },
            { new: true }
        );

        // Log admin activity
        await logAdminActivity(
            req,
            AdminAction.CHALLENGE_UPDATE,
            AdminTargetType.CHALLENGE,
            challenge._id.toString(),
            challenge.title,
            previousValue,
            validated
        );

        res.json(updatedChallenge);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('Failed to update challenge:', error);
        res.status(500).json({ error: 'Failed to update challenge' });
    }
});

/**
 * DELETE /api/admin/challenges/:id
 * Delete challenge (only drafts can be deleted)
 */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Only drafts can be deleted
        if (challenge.status !== ChallengeStatus.DRAFT) {
            return res.status(400).json({
                error: 'Only draft challenges can be deleted. Cancel or complete active challenges first.'
            });
        }

        await Challenge.findByIdAndDelete(req.params.id);

        // Log admin activity
        await logAdminActivity(
            req,
            AdminAction.CHALLENGE_DELETE,
            AdminTargetType.CHALLENGE,
            challenge._id.toString(),
            challenge.title,
            challenge.toObject(),
            null,
            req.body.reason
        );

        res.json({ success: true, message: 'Challenge deleted' });
    } catch (error) {
        console.error('Failed to delete challenge:', error);
        res.status(500).json({ error: 'Failed to delete challenge' });
    }
});

/**
 * POST /api/admin/challenges/:id/activate
 * Activate a scheduled challenge
 */
router.post('/:id/activate', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        if (challenge.status !== ChallengeStatus.DRAFT && challenge.status !== ChallengeStatus.SCHEDULED) {
            return res.status(400).json({ error: 'Only draft or scheduled challenges can be activated' });
        }

        const previousStatus = challenge.status;
        challenge.status = ChallengeStatus.ACTIVE;
        await challenge.save();

        // Log admin activity
        await logAdminActivity(
            req,
            AdminAction.CHALLENGE_ACTIVATE,
            AdminTargetType.CHALLENGE,
            challenge._id.toString(),
            challenge.title,
            { status: previousStatus },
            { status: ChallengeStatus.ACTIVE }
        );

        res.json({ success: true, message: 'Challenge activated', challenge });
    } catch (error) {
        console.error('Failed to activate challenge:', error);
        res.status(500).json({ error: 'Failed to activate challenge' });
    }
});

/**
 * POST /api/admin/challenges/:id/cancel
 * Cancel an active challenge
 */
router.post('/:id/cancel', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Reason is required to cancel a challenge' });
        }

        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        if (challenge.status === ChallengeStatus.COMPLETED || challenge.status === ChallengeStatus.CANCELLED) {
            return res.status(400).json({ error: 'Challenge is already completed or cancelled' });
        }

        const previousStatus = challenge.status;
        challenge.status = ChallengeStatus.CANCELLED;
        await challenge.save();

        // Log admin activity with reason
        await logAdminActivity(
            req,
            AdminAction.CHALLENGE_CANCEL,
            AdminTargetType.CHALLENGE,
            challenge._id.toString(),
            challenge.title,
            { status: previousStatus },
            { status: ChallengeStatus.CANCELLED },
            reason
        );

        res.json({ success: true, message: 'Challenge cancelled', challenge });
    } catch (error) {
        console.error('Failed to cancel challenge:', error);
        res.status(500).json({ error: 'Failed to cancel challenge' });
    }
});

/**
 * GET /api/admin/challenges/:id/leaderboard
 * Get challenge leaderboard/participants
 */
router.get('/:id/leaderboard', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate('participants.userId', 'username email')
            .populate('completedBy', 'username email');

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Sort participants by progress (descending)
        const sortedParticipants = [...challenge.participants].sort((a, b) => b.progress - a.progress);

        res.json({
            challengeId: challenge._id,
            title: challenge.title,
            status: challenge.status,
            totalParticipants: challenge.participants.length,
            completedCount: challenge.completedBy.length,
            participants: sortedParticipants,
            completedBy: challenge.completedBy
        });
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

/**
 * POST /api/admin/challenges/:id/payout
 * Manual payout trigger for completed challenge
 */
router.post('/:id/payout', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { reason } = req.body;

        const challenge = await Challenge.findById(req.params.id)
            .populate('completedBy', 'username');

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        if (challenge.completedBy.length === 0) {
            return res.status(400).json({ error: 'No winners to payout' });
        }

        // TODO: Implement actual payout logic via WalletService
        // For now, just log the action

        // Log admin activity
        await logAdminActivity(
            req,
            AdminAction.CHALLENGE_PAYOUT,
            AdminTargetType.CHALLENGE,
            challenge._id.toString(),
            challenge.title,
            null,
            {
                winnersCount: challenge.completedBy.length,
                prizeAmount: challenge.prize.amount,
                prizeCurrency: challenge.prize.currency
            },
            reason
        );

        // Mark as completed if still active
        if (challenge.status === ChallengeStatus.ACTIVE) {
            challenge.status = ChallengeStatus.COMPLETED;
            await challenge.save();
        }

        res.json({
            success: true,
            message: 'Payout initiated',
            winnersCount: challenge.completedBy.length,
            prizeAmount: challenge.prize.amount
        });
    } catch (error) {
        console.error('Failed to process payout:', error);
        res.status(500).json({ error: 'Failed to process payout' });
    }
});

/**
 * GET /api/admin/challenges/stats
 * Get challenge statistics
 */
router.get('/stats/overview', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const [total, active, draft, completed, cancelled] = await Promise.all([
            Challenge.countDocuments(),
            Challenge.countDocuments({ status: ChallengeStatus.ACTIVE }),
            Challenge.countDocuments({ status: ChallengeStatus.DRAFT }),
            Challenge.countDocuments({ status: ChallengeStatus.COMPLETED }),
            Challenge.countDocuments({ status: ChallengeStatus.CANCELLED })
        ]);

        res.json({
            total,
            active,
            draft,
            completed,
            cancelled
        });
    } catch (error) {
        console.error('Failed to fetch challenge stats:', error);
        res.status(500).json({ error: 'Failed to fetch challenge stats' });
    }
});

export default router;
