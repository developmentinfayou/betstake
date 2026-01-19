import { Router, Request, Response } from 'express';
import { FastParityJackpotCondition } from '@casino/database';

const router = Router();

// Get all jackpot conditions
router.get('/conditions', async (req: Request, res: Response) => {
    try {
        const conditions = await FastParityJackpotCondition.find().sort({ createdAt: -1 });
        res.json({ success: true, conditions });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new jackpot condition
router.post('/conditions', async (req: Request, res: Response) => {
    try {
        const { name, type, targetCount, targetValue, prizeAmount, prizeType, requireNextWin } = req.body;

        const condition = new FastParityJackpotCondition({
            name,
            type,
            targetCount,
            targetValue,
            prizeAmount,
            prizeType: prizeType || 'fixed',
            requireNextWin: requireNextWin || false,
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

        const condition = await FastParityJackpotCondition.findByIdAndUpdate(
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

        const condition = await FastParityJackpotCondition.findById(id);
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

        const result = await FastParityJackpotCondition.findByIdAndDelete(id);
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
        const conditions = await FastParityJackpotCondition.find({ isActive: true })
            .select('name type targetCount targetValue prizeAmount prizeType');
        res.json({ success: true, conditions });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
