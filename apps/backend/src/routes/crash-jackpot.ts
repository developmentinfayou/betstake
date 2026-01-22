import { Router, Request, Response } from 'express';
import { CrashJackpotCondition } from '@casino/database';

const router = Router();

// Get all jackpot conditions
router.get('/conditions', async (req: Request, res: Response) => {
    try {
        const { gameType } = req.query;
        const query: any = {};
        if (gameType) {
            query.gameType = gameType;
        }
        const conditions = await CrashJackpotCondition.find(query).sort({ createdAt: -1 });
        res.json({ success: true, conditions });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new jackpot condition
router.post('/conditions', async (req: Request, res: Response) => {
    try {
        const {
            name,
            gameType,
            winnerType,
            distributionFilter,
            conditionType,
            targetMultiplier,
            streakCount,
            betType,
            percentageChance,
            requireInARow,
            prizeAmount,
            prizeType
        } = req.body;

        // Validation
        if (!name || !gameType || !winnerType || !conditionType || prizeAmount === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, gameType, winnerType, conditionType, prizeAmount'
            });
        }

        const condition = new CrashJackpotCondition({
            name,
            gameType,
            winnerType,
            distributionFilter,
            conditionType,
            targetMultiplier,
            streakCount,
            betType,
            percentageChance,
            requireInARow: requireInARow || false,
            prizeAmount,
            prizeType: prizeType || 'fixed',
            isActive: true
        });

        await condition.save();
        res.json({ success: true, condition });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update jackpot condition
router.put('/conditions/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const condition = await CrashJackpotCondition.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        if (!condition) {
            return res.status(404).json({ success: false, error: 'Condition not found' });
        }

        res.json({ success: true, condition });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Toggle condition active status
router.patch('/conditions/:id/toggle', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const condition = await CrashJackpotCondition.findById(id);
        if (!condition) {
            return res.status(404).json({ success: false, error: 'Condition not found' });
        }

        condition.isActive = !condition.isActive;
        await condition.save();

        res.json({ success: true, condition });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete jackpot condition
router.delete('/conditions/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await CrashJackpotCondition.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ success: false, error: 'Condition not found' });
        }

        res.json({ success: true, message: 'Condition deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get active conditions (for frontend display)
router.get('/active', async (req: Request, res: Response) => {
    try {
        const { gameType } = req.query;
        const query: any = { isActive: true };
        if (gameType) {
            query.gameType = gameType;
        }
        const conditions = await CrashJackpotCondition.find(query)
            .select('name gameType winnerType conditionType targetMultiplier streakCount prizeAmount prizeType');
        res.json({ success: true, conditions });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
