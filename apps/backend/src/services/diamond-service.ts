import { User, DiamondTransaction } from '@casino/database';

const DIAMONDS_PER_STRATEGY_USE = 20;

/**
 * Diamond Service — manages the diamond virtual currency
 */
export class DiamondService {

    /**
     * Award diamonds to a strategy creator when their strategy is used
     */
    static async awardForStrategyUse(
        creatorId: string,
        strategyId: string,
        usedByUserId: string
    ): Promise<number> {
        // Atomically increment diamond balance
        const user = await User.findByIdAndUpdate(
            creatorId,
            { $inc: { diamonds: DIAMONDS_PER_STRATEGY_USE } },
            { new: true }
        );

        if (!user) {
            throw new Error('Creator user not found');
        }

        // Log the transaction
        await DiamondTransaction.create({
            userId: creatorId,
            amount: DIAMONDS_PER_STRATEGY_USE,
            type: 'strategy_used',
            relatedStrategyId: strategyId,
            usedByUserId,
        });

        console.log(`[Diamond] 💎 Awarded ${DIAMONDS_PER_STRATEGY_USE} diamonds to user ${creatorId} for strategy ${strategyId} used by ${usedByUserId}`);

        return user.diamonds;
    }

    /**
     * Get diamond balance for a user
     */
    static async getBalance(userId: string): Promise<number> {
        const user = await User.findById(userId).select('diamonds');
        return user?.diamonds || 0;
    }

    /**
     * Get diamond transaction history
     */
    static async getHistory(userId: string, limit: number = 50) {
        return DiamondTransaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('relatedStrategyId', 'name')
            .populate('usedByUserId', 'username');
    }
}
