import { FastParityJackpotCondition, FastParityPlayerProgress, IFastParityJackpotCondition } from '@casino/database';

export interface JackpotCheckResult {
    triggered: boolean;
    conditionId?: string;
    conditionName?: string;
    prizeAmount?: number;
    requireNextWin?: boolean;
}

export class FastParityJackpotService {

    /**
     * Update player progress after each bet result and check for jackpot triggers
     */
    static async processPlayerBet(
        userId: string,
        betType: 'number' | 'color',
        betValue: number | string,
        resultNumber: number,
        resultColor: 'green' | 'red' | 'violet',
        won: boolean,
        betAmount: number
    ): Promise<JackpotCheckResult> {
        // Get or create player progress
        let progress = await FastParityPlayerProgress.findOne({ userId });

        if (!progress) {
            progress = new FastParityPlayerProgress({
                userId,
                colorStreak: { green: 0, red: 0, violet: 0 },
                currentStreakColor: null,
                numberWins: 0,
                sessionColorWins: { green: 0, red: 0, violet: 0 }
            });
        }

        // Update progress based on bet result
        if (won) {
            if (betType === 'color') {
                const color = betValue as string;

                // Update streak - reset others, increment winning color
                if (progress.currentStreakColor === color) {
                    progress.colorStreak[color as keyof typeof progress.colorStreak]++;
                } else {
                    // Reset all streaks, start new streak
                    progress.colorStreak = { green: 0, red: 0, violet: 0 };
                    progress.colorStreak[color as keyof typeof progress.colorStreak] = 1;
                    progress.currentStreakColor = color;
                }

                // Update overall session wins
                progress.sessionColorWins[color as keyof typeof progress.sessionColorWins]++;
            } else if (betType === 'number') {
                progress.numberWins++;
            }
        } else {
            // Lost - reset streaks
            progress.colorStreak = { green: 0, red: 0, violet: 0 };
            progress.currentStreakColor = null;
        }

        progress.lastUpdated = new Date();
        await progress.save();

        // Check for jackpot conditions
        return await this.checkJackpotConditions(userId, progress);
    }

    /**
     * Check if any active jackpot conditions are met
     */
    static async checkJackpotConditions(
        userId: string,
        progress: any
    ): Promise<JackpotCheckResult> {
        const activeConditions = await FastParityJackpotCondition.find({ isActive: true });

        for (const condition of activeConditions) {
            const triggered = this.evaluateCondition(condition, progress);

            if (triggered) {
                // Handle pending jackpot if requireNextWin is true
                if (condition.requireNextWin) {
                    progress.pendingJackpot = {
                        conditionId: condition._id,
                        prizeAmount: condition.prizeAmount,
                        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes to win next bet
                    };
                    await progress.save();
                }

                return {
                    triggered: true,
                    conditionId: condition._id.toString(),
                    conditionName: condition.name,
                    prizeAmount: condition.prizeAmount,
                    requireNextWin: condition.requireNextWin
                };
            }
        }

        return { triggered: false };
    }

    /**
     * Evaluate a single condition against player progress
     */
    private static evaluateCondition(
        condition: IFastParityJackpotCondition,
        progress: any
    ): boolean {
        switch (condition.type) {
            case 'color_streak':
                const targetColor = condition.targetValue as string;
                const currentStreak = progress.colorStreak[targetColor] || 0;
                return currentStreak >= condition.targetCount;

            case 'overall_color':
                const overallColor = condition.targetValue as string;
                const totalWins = progress.sessionColorWins[overallColor] || 0;
                return totalWins >= condition.targetCount;

            case 'number_match':
                return progress.numberWins >= condition.targetCount;

            default:
                return false;
        }
    }

    /**
     * Check if player has pending jackpot that needs next win validation
     */
    static async validatePendingJackpot(
        userId: string,
        won: boolean
    ): Promise<{ claimed: boolean; prizeAmount: number } | null> {
        const progress = await FastParityPlayerProgress.findOne({ userId });

        if (!progress?.pendingJackpot) return null;

        const { prizeAmount, expiresAt } = progress.pendingJackpot;

        // Check if expired
        if (new Date() > expiresAt) {
            progress.pendingJackpot = undefined;
            await progress.save();
            return { claimed: false, prizeAmount: 0 };
        }

        // Check if won next bet
        if (won) {
            progress.pendingJackpot = undefined;
            await progress.save();
            return { claimed: true, prizeAmount };
        }

        // Lost - jackpot expired
        progress.pendingJackpot = undefined;
        await progress.save();
        return { claimed: false, prizeAmount: 0 };
    }

    /**
     * Get all active jackpot conditions for display
     */
    static async getActiveConditions(): Promise<IFastParityJackpotCondition[]> {
        return FastParityJackpotCondition.find({ isActive: true });
    }

    /**
     * Reset player session (call when player leaves game)
     */
    static async resetPlayerSession(userId: string): Promise<void> {
        await FastParityPlayerProgress.findOneAndUpdate(
            { userId },
            {
                $set: {
                    colorStreak: { green: 0, red: 0, violet: 0 },
                    currentStreakColor: null,
                    numberWins: 0,
                    sessionColorWins: { green: 0, red: 0, violet: 0 }
                }
            }
        );
    }
}
