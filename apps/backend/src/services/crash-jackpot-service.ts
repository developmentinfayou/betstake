import {
    CrashJackpotCondition,
    CrashPlayerProgress,
    ICrashJackpotCondition,
    CrashJackpotGameType,
    ICrashBet
} from '@casino/database';

export interface CrashJackpotCheckResult {
    triggered: boolean;
    conditionId?: string;
    conditionName?: string;
    prizeAmount?: number;
    winners?: Array<{ userId: string; amount: number }>;
    requireNextWins?: number;
}

export interface ProcessBetParams {
    userId: string;
    gameType: CrashJackpotGameType;
    betAmount: number;
    crashPoint: number;
    cashoutMultiplier?: number;
    betType?: 'crash' | 'red' | 'green' | 'moon';
    won: boolean;
}

export class CrashJackpotService {

    /**
     * Process bet result and check for jackpot triggers
     */
    static async processPlayerBet(params: ProcessBetParams): Promise<CrashJackpotCheckResult> {
        const { userId, gameType, betAmount, crashPoint, cashoutMultiplier, betType, won } = params;

        // Get or create player progress
        let progress = await CrashPlayerProgress.findOne({ userId });

        if (!progress) {
            progress = new CrashPlayerProgress({
                userId,
                currentStreak: { type: null, count: 0 },
                trenballStreaks: { crash: 0, red: 0, green: 0, moon: 0 },
                currentTrenballStreak: null
            });
        }

        // Update win/lose streak
        if (won) {
            if (progress.currentStreak.type === 'win') {
                progress.currentStreak.count++;
            } else {
                progress.currentStreak = { type: 'win', count: 1 };
            }
        } else {
            if (progress.currentStreak.type === 'lose') {
                progress.currentStreak.count++;
            } else {
                progress.currentStreak = { type: 'lose', count: 1 };
            }
        }

        // Update trenball streaks (for trenball mode)
        if (gameType === 'crash_trenball' && betType) {
            if (won) {
                if (progress.currentTrenballStreak === betType) {
                    progress.trenballStreaks[betType]++;
                } else {
                    // Reset all trenball streaks, start new
                    progress.trenballStreaks = { crash: 0, red: 0, green: 0, moon: 0 };
                    progress.trenballStreaks[betType] = 1;
                    progress.currentTrenballStreak = betType;
                }
            } else {
                // Lost - reset trenball streaks
                progress.trenballStreaks = { crash: 0, red: 0, green: 0, moon: 0 };
                progress.currentTrenballStreak = null;
            }
        }

        progress.lastUpdated = new Date();
        await progress.save();

        // Check for jackpot conditions
        return await this.checkJackpotConditions(userId, progress, params);
    }

    /**
     * Check if any active jackpot conditions are met
     */
    static async checkJackpotConditions(
        userId: string,
        progress: any,
        betParams: ProcessBetParams
    ): Promise<CrashJackpotCheckResult> {
        const { gameType, crashPoint, cashoutMultiplier, won, betType } = betParams;

        const activeConditions = await CrashJackpotCondition.find({
            isActive: true,
            gameType: gameType
        });

        for (const condition of activeConditions) {
            const triggered = this.evaluateCondition(condition, progress, betParams);

            if (triggered) {
                // Handle pending jackpot for streak conditions
                if (condition.requireInARow && condition.streakCount && condition.streakCount > 1) {
                    const remainingWins = condition.streakCount - 1;
                    progress.pendingJackpot = {
                        conditionId: condition._id,
                        prizeAmount: condition.prizeAmount,
                        remainingWins: remainingWins,
                        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
                    };
                    await progress.save();

                    return {
                        triggered: true,
                        conditionId: condition._id.toString(),
                        conditionName: condition.name,
                        prizeAmount: condition.prizeAmount,
                        requireNextWins: remainingWins
                    };
                }

                return {
                    triggered: true,
                    conditionId: condition._id.toString(),
                    conditionName: condition.name,
                    prizeAmount: condition.prizeAmount
                };
            }
        }

        return { triggered: false };
    }

    /**
     * Evaluate a single condition against player progress and bet params
     */
    private static evaluateCondition(
        condition: ICrashJackpotCondition,
        progress: any,
        betParams: ProcessBetParams
    ): boolean {
        const { crashPoint, cashoutMultiplier, won, betType } = betParams;

        switch (condition.conditionType) {
            case 'multiplier_hit':
                // Check if crash point hit exactly the target (7.77, 77.77)
                if (condition.targetMultiplier) {
                    return Math.abs(crashPoint - condition.targetMultiplier) < 0.01;
                }
                return false;

            case 'bet_on_multiplier':
                // Player bet when crash hit target multiplier
                if (condition.targetMultiplier) {
                    return Math.abs(crashPoint - condition.targetMultiplier) < 0.01;
                }
                return false;

            case 'win_on_multiplier':
                // Player won and crash >= target multiplier
                if (condition.targetMultiplier && won) {
                    return crashPoint >= condition.targetMultiplier;
                }
                return false;

            case 'lose_on_multiplier':
                // Player lost when crash hit target multiplier
                if (condition.targetMultiplier && !won) {
                    return crashPoint >= condition.targetMultiplier;
                }
                return false;

            case 'win_streak':
                // Player won X times in a row
                if (condition.streakCount) {
                    return progress.currentStreak.type === 'win' &&
                        progress.currentStreak.count >= condition.streakCount;
                }
                return false;

            case 'lose_streak':
                // Player lost X times in a row
                if (condition.streakCount) {
                    return progress.currentStreak.type === 'lose' &&
                        progress.currentStreak.count >= condition.streakCount;
                }
                return false;

            case 'trenball_streak':
                // Player won specific trenball bet type X times
                if (condition.streakCount && condition.betType) {
                    const targetBetType = condition.betType as keyof typeof progress.trenballStreaks;
                    return progress.trenballStreaks[targetBetType] >= condition.streakCount;
                }
                return false;

            case 'percentage_chance':
                // Random X% chance
                if (condition.percentageChance) {
                    const random = Math.random() * 100;
                    return random < condition.percentageChance;
                }
                return false;

            default:
                return false;
        }
    }

    /**
     * Determine winner(s) based on condition's winnerType
     */
    static async determineWinners(
        condition: ICrashJackpotCondition,
        roundBets: ICrashBet[]
    ): Promise<Array<{ userId: string; amount: number }>> {
        const winners: Array<{ userId: string; amount: number }> = [];

        // Apply distribution filter if exists
        let eligibleBets = roundBets;
        if (condition.distributionFilter) {
            if (condition.distributionFilter.betType) {
                eligibleBets = eligibleBets.filter(b => b.betType === condition.distributionFilter!.betType);
            }
            if (condition.distributionFilter.winnersOnly) {
                eligibleBets = eligibleBets.filter(b => b.won);
            }
            if (condition.distributionFilter.bettorsOnly) {
                // Already only bettors
            }
        }

        if (eligibleBets.length === 0) return winners;

        switch (condition.winnerType) {
            case 'highest_bettor':
                const highestBet = eligibleBets.reduce((max, b) => b.amount > max.amount ? b : max);
                winners.push({
                    userId: highestBet.userId.toString(),
                    amount: condition.prizeAmount
                });
                break;

            case 'highest_winner':
                const winningBets = eligibleBets.filter(b => b.won);
                if (winningBets.length > 0) {
                    const highestWinner = winningBets.reduce((max, b) => b.payout > max.payout ? b : max);
                    winners.push({
                        userId: highestWinner.userId.toString(),
                        amount: condition.prizeAmount
                    });
                }
                break;

            case 'highest_loser':
                const losingBets = eligibleBets.filter(b => !b.won);
                if (losingBets.length > 0) {
                    const highestLoser = losingBets.reduce((max, b) => b.amount > max.amount ? b : max);
                    winners.push({
                        userId: highestLoser.userId.toString(),
                        amount: condition.prizeAmount
                    });
                }
                break;

            case 'closest_777':
                // Find bet with cashout closest to 7.77 or 77.77
                const cashedOutBets = eligibleBets.filter(b => b.cashedOut && b.cashoutAt);
                if (cashedOutBets.length > 0) {
                    const closest = cashedOutBets.reduce((best, b) => {
                        const dist777 = Math.abs(b.cashoutAt! - 7.77);
                        const dist7777 = Math.abs(b.cashoutAt! - 77.77);
                        const minDist = Math.min(dist777, dist7777);

                        const bestDist777 = Math.abs(best.cashoutAt! - 7.77);
                        const bestDist7777 = Math.abs(best.cashoutAt! - 77.77);
                        const bestMinDist = Math.min(bestDist777, bestDist7777);

                        return minDist < bestMinDist ? b : best;
                    });
                    winners.push({
                        userId: closest.userId.toString(),
                        amount: condition.prizeAmount
                    });
                }
                break;

            case 'ratio_distribution':
                // Distribute by betting amount ratio
                const totalBetAmount = eligibleBets.reduce((sum, b) => sum + b.amount, 0);
                for (const bet of eligibleBets) {
                    const ratio = bet.amount / totalBetAmount;
                    winners.push({
                        userId: bet.userId.toString(),
                        amount: Math.floor(condition.prizeAmount * ratio)
                    });
                }
                break;

            case 'equal_distribution':
                // Distribute equally
                const perPerson = Math.floor(condition.prizeAmount / eligibleBets.length);
                for (const bet of eligibleBets) {
                    winners.push({
                        userId: bet.userId.toString(),
                        amount: perPerson
                    });
                }
                break;
        }

        return winners;
    }

    /**
     * Validate pending jackpot (for "win next X bets" conditions)
     */
    static async validatePendingJackpot(
        userId: string,
        won: boolean
    ): Promise<{ claimed: boolean; prizeAmount: number } | null> {
        const progress = await CrashPlayerProgress.findOne({ userId });

        if (!progress?.pendingJackpot) return null;

        const { prizeAmount, remainingWins, expiresAt } = progress.pendingJackpot;

        // Check if expired
        if (new Date() > expiresAt) {
            progress.pendingJackpot = undefined;
            await progress.save();
            return { claimed: false, prizeAmount: 0 };
        }

        if (won) {
            if (remainingWins <= 1) {
                // Claimed!
                progress.pendingJackpot = undefined;
                await progress.save();
                return { claimed: true, prizeAmount };
            } else {
                // Decrement remaining wins
                progress.pendingJackpot.remainingWins = remainingWins - 1;
                await progress.save();
                return null; // Still in progress
            }
        } else {
            // Lost - jackpot expired
            progress.pendingJackpot = undefined;
            await progress.save();
            return { claimed: false, prizeAmount: 0 };
        }
    }

    /**
     * Get all active jackpot conditions for display
     */
    static async getActiveConditions(gameType?: CrashJackpotGameType): Promise<ICrashJackpotCondition[]> {
        const query: any = { isActive: true };
        if (gameType) {
            query.gameType = gameType;
        }
        return CrashJackpotCondition.find(query);
    }

    /**
     * Reset player session (call when player leaves game)
     */
    static async resetPlayerSession(userId: string): Promise<void> {
        await CrashPlayerProgress.findOneAndUpdate(
            { userId },
            {
                $set: {
                    currentStreak: { type: null, count: 0 },
                    trenballStreaks: { crash: 0, red: 0, green: 0, moon: 0 },
                    currentTrenballStreak: null,
                    pendingJackpot: undefined
                }
            }
        );
    }
}
