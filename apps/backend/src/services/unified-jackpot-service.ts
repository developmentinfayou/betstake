import {
    Jackpot, JackpotWin, JackpotStatus,
    JackpotConditionConfig, IJackpotCondition, JackpotConditionType, JackpotWinnerIdentifier,
    JackpotPlayerProgress,
    Bet
} from '@casino/database';
import { WalletService } from './wallet-service';
import { EventEmitter } from 'events';
import mongoose from 'mongoose';

export const jackpotEvents = new EventEmitter();

/**
 * Unified Jackpot Service
 * 
 * Replaces the 3 disconnected services (JackpotService, CrashJackpotService, FastParityJackpotService)
 * with a single admin-configurable runtime service powered by JackpotConditionConfig.
 */
export class UnifiedJackpotService {

    // ─── Pool Management ───────────────────────────────────────────────

    /**
     * Get or create jackpot pool for game/currency
     */
    static async getJackpot(gameType: string, currency: string) {
        let jackpot = await Jackpot.findOne({ gameType, currency });

        if (!jackpot) {
            // Get contribution % from admin config
            const config = await JackpotConditionConfig.findOne({ gameType });
            const houseEdgePercent = config?.houseEdgeContribution || 10;

            jackpot = await Jackpot.create({
                gameType,
                currency,
                currentAmount: 0,
                minAmount: 100,
                status: JackpotStatus.REFILLING,
                houseEdgePercent,
                conditions: {},
            });
        }

        return jackpot;
    }

    /**
     * Add to jackpot pool from house edge.
     * Uses houseEdgeContribution from admin config to determine how much of the house edge goes to jackpot.
     */
    static async addToPool(gameType: string, currency: string, betAmount: number) {
        const config = await JackpotConditionConfig.findOne({ gameType });
        if (!config?.enabled) return null;

        const jackpot = await this.getJackpot(gameType, currency);

        // houseEdgeContribution is % of house edge that goes to jackpot (e.g. 10 = 10%)
        const houseEdgeContributionPct = config.houseEdgeContribution || 10;
        const contribution = betAmount * (jackpot.houseEdgePercent / 100) * (houseEdgeContributionPct / 100);

        const updated = await Jackpot.findByIdAndUpdate(
            jackpot._id,
            { $inc: { currentAmount: contribution } },
            { new: true }
        );

        await this.updateJackpotStatus(updated!._id.toString());
        return updated;
    }

    /**
     * Update jackpot status based on current amount
     */
    private static async updateJackpotStatus(jackpotId: string) {
        const jackpot = await Jackpot.findById(jackpotId);
        if (!jackpot) return;

        let newStatus = jackpot.status;
        if (jackpot.currentAmount < jackpot.minAmount) {
            newStatus = JackpotStatus.REFILLING;
        } else if (jackpot.currentAmount >= jackpot.minAmount * 5) {
            newStatus = JackpotStatus.MEGA;
        } else {
            newStatus = JackpotStatus.READY;
        }

        if (newStatus !== jackpot.status) {
            await Jackpot.findByIdAndUpdate(jackpotId, { status: newStatus });
        }
    }

    // ─── Main Entry Point ──────────────────────────────────────────────

    /**
     * Process a bet for jackpot evaluation.
     * Called after every bet from bet-engine or websocket handlers.
     */
    static async processBet(
        userId: string,
        gameType: string,
        currency: string,
        betAmount: number,
        gameResult: any,
        betId?: string,
    ): Promise<{ won: boolean; amount?: number; conditionName?: string }> {
        try {
            // Load admin config for this game
            const config = await JackpotConditionConfig.findOne({ gameType });
            if (!config?.enabled) return { won: false };

            // Check minimum bet per currency
            const minBet = config.minBetAmount?.get(currency) || 0;
            if (betAmount < minBet) return { won: false };

            // Check if jackpot pool is ready
            const jackpot = await this.getJackpot(gameType, currency);
            if (jackpot.status === JackpotStatus.REFILLING) return { won: false };

            // Add to pool
            await this.addToPool(gameType, currency, betAmount);

            // Update player progress
            const progress = await this.updatePlayerProgress(userId, gameType, gameResult);

            // Check for pending jackpot (WIN_NEXT / LOSE_NEXT)
            const pendingResult = await this.checkPendingJackpot(userId, gameType, gameResult);
            if (pendingResult) {
                if (pendingResult.claimed) {
                    await this.awardJackpot(jackpot._id.toString(), userId, betAmount, currency, pendingResult.prizeAmount);
                    return { won: true, amount: pendingResult.prizeAmount, conditionName: 'Pending Jackpot' };
                }
                // Pending expired, continue with normal evaluation
            }

            // Evaluate conditions
            const enabledConditions = config.conditions.filter((c: IJackpotCondition) => c.enabled);
            for (const condition of enabledConditions) {
                const triggered = this.evaluateCondition(condition, progress, gameResult, gameType);

                if (triggered) {
                    // Handle WIN_NEXT / LOSE_NEXT — defer the award
                    if (condition.type === JackpotConditionType.WIN_NEXT || condition.type === JackpotConditionType.LOSE_NEXT) {
                        await this.setPendingJackpot(userId, gameType, condition, jackpot.currentAmount);
                        return {
                            won: false,  // Not yet — pending next outcome
                            conditionName: `${condition.type}: need ${condition.count} more`,
                        };
                    }

                    // Calculate payout based on tiers
                    const payoutAmount = this.calculateTieredPayout(jackpot.currentAmount, betAmount, config.payoutTiers || []);

                    await this.awardJackpot(jackpot._id.toString(), userId, betAmount, currency, payoutAmount);
                    return {
                        won: true,
                        amount: payoutAmount,
                        conditionName: `${condition.type}${condition.value ? `: ${condition.value}` : ''}`,
                    };
                }
            }

            return { won: false };
        } catch (error) {
            console.error('❌ UnifiedJackpotService.processBet error:', error);
            return { won: false };
        }
    }

    // ─── Condition Evaluation ──────────────────────────────────────────

    /**
     * Evaluate a single jackpot condition against player progress and game result
     */
    private static evaluateCondition(
        condition: IJackpotCondition,
        progress: any,
        gameResult: any,
        gameType: string,
    ): boolean {
        switch (condition.type) {

            case JackpotConditionType.HIT_VALUE:
                // Game-specific value matching
                return this.checkHitValue(condition, gameResult, gameType);

            case JackpotConditionType.HIT_MULTIPLIER:
                // Match multiplier (Crash, Limbo, Balloon)
                const multiplier = gameResult.crashPoint || gameResult.multiplier || 0;
                if (!condition.value) return false;
                return Math.abs(multiplier - condition.value) < 0.01;

            case JackpotConditionType.RANDOM_CHANCE:
                // Simple probability check
                const probability = (condition.probability || 0) / 100;
                return Math.random() < probability;

            case JackpotConditionType.IN_A_ROW:
                // Check win streak
                if (!condition.count) return false;
                return (progress.winStreak >= condition.count) ||
                    (progress.loseStreak >= condition.count);

            case JackpotConditionType.WIN_NEXT:
            case JackpotConditionType.LOSE_NEXT:
                // These are deferred — handled by setPendingJackpot + checkPendingJackpot
                // Only trigger the initial condition here (e.g., random chance or some other trigger)
                // For now, use a base probability
                return false; // Initial trigger handled by other conditions

            case JackpotConditionType.WIN_COLOR:
                // Color streak check (FastParity, Roulette)
                if (!condition.color || !condition.count) return false;
                const colorKey = condition.color as keyof typeof progress.colorStreak;
                const colorStreak = progress.colorStreak?.[colorKey] || 0;
                return colorStreak >= condition.count;

            case JackpotConditionType.WIN_NUMBER:
                // Number win count (FastParity)
                if (!condition.count) return false;
                return progress.numberWins >= condition.count;

            case JackpotConditionType.SAME_TRAJECTORY:
                // Same path X times (Plinko)
                if (!condition.count || !progress.lastResults?.length) return false;
                const recentPaths = progress.lastResults.slice(-condition.count);
                if (recentPaths.length < condition.count) return false;
                return recentPaths.every((r: any) =>
                    JSON.stringify(r.path) === JSON.stringify(recentPaths[0].path)
                );

            case JackpotConditionType.PUMP_TIMES:
                // Balloon pump count by difficulty
                if (!condition.count) return false;
                const pumps = gameResult.pumps || gameResult.pumpCount || 0;
                if (condition.difficulty && gameResult.difficulty !== condition.difficulty) return false;
                return pumps >= condition.count;

            default:
                return false;
        }
    }

    /**
     * Check HIT_VALUE for game-specific result values
     */
    private static checkHitValue(condition: IJackpotCondition, gameResult: any, gameType: string): boolean {
        if (!condition.value) return false;

        switch (gameType) {
            case 'DICE':
                return Math.abs((gameResult.roll || 0) - condition.value) < 0.01;
            case 'LIMBO':
                return Math.abs((gameResult.multiplier || 0) - condition.value) < 0.01;
            case 'CRASH':
                return Math.abs((gameResult.crashPoint || 0) - condition.value) < 0.01;
            case 'KENO':
                return gameResult.matchCount === condition.value;
            default:
                // Generic multiplier check
                return Math.abs((gameResult.multiplier || 0) - condition.value) < 0.01;
        }
    }

    // ─── Player Progress Tracking ──────────────────────────────────────

    /**
     * Update player progress after a bet result
     */
    static async updatePlayerProgress(userId: string, gameType: string, gameResult: any) {
        let progress = await JackpotPlayerProgress.findOne({ userId, gameType });

        if (!progress) {
            progress = new JackpotPlayerProgress({
                userId,
                gameType,
                winStreak: 0,
                loseStreak: 0,
                currentStreakType: null,
                colorStreak: { green: 0, red: 0, violet: 0, black: 0 },
                currentStreakColor: null,
                sessionColorWins: { green: 0, red: 0, violet: 0, black: 0 },
                numberWins: 0,
                trenballStreaks: { red: 0, green: 0, moon: 0 },
                lastResults: [],
            });
        }

        const won = gameResult.won || false;

        // Update win/lose streaks
        if (won) {
            if (progress.currentStreakType === 'win') {
                progress.winStreak += 1;
            } else {
                progress.winStreak = 1;
                progress.loseStreak = 0;
                progress.currentStreakType = 'win';
            }
        } else {
            if (progress.currentStreakType === 'lose') {
                progress.loseStreak += 1;
            } else {
                progress.loseStreak = 1;
                progress.winStreak = 0;
                progress.currentStreakType = 'lose';
            }
        }

        // Update color tracking (FastParity, Roulette)
        if (gameResult.color) {
            const color = gameResult.color as string;
            if (won) {
                if (progress.currentStreakColor === color) {
                    (progress.colorStreak as any)[color] = ((progress.colorStreak as any)[color] || 0) + 1;
                } else {
                    progress.colorStreak = { green: 0, red: 0, violet: 0, black: 0 };
                    (progress.colorStreak as any)[color] = 1;
                    progress.currentStreakColor = color;
                }
                (progress.sessionColorWins as any)[color] = ((progress.sessionColorWins as any)[color] || 0) + 1;
            } else {
                progress.colorStreak = { green: 0, red: 0, violet: 0, black: 0 };
                progress.currentStreakColor = null;
            }
        }

        // Number match tracking
        if (gameResult.numberMatch && won) {
            progress.numberWins += 1;
        }

        // Trenball tracking (Crash)
        if (gameResult.trenballOutcome) {
            const outcome = gameResult.trenballOutcome as string;
            // Reset all, increment matching
            progress.trenballStreaks = { red: 0, green: 0, moon: 0 };
            (progress.trenballStreaks as any)[outcome] = ((progress.trenballStreaks as any)[outcome] || 0) + 1;
        }

        // Store recent results for trajectory matching (limit to 20)
        progress.lastResults = [...(progress.lastResults || []).slice(-19), {
            won,
            multiplier: gameResult.multiplier,
            path: gameResult.path,
            roll: gameResult.roll,
            crashPoint: gameResult.crashPoint,
            color: gameResult.color,
            timestamp: Date.now(),
        }];

        progress.lastUpdated = new Date();
        await progress.save();

        return progress;
    }

    // ─── Pending Jackpot (WIN_NEXT / LOSE_NEXT) ────────────────────────

    /**
     * Set a pending jackpot for WIN_NEXT / LOSE_NEXT conditions
     */
    private static async setPendingJackpot(
        userId: string,
        gameType: string,
        condition: IJackpotCondition,
        currentJackpotAmount: number,
    ) {
        await JackpotPlayerProgress.findOneAndUpdate(
            { userId, gameType },
            {
                pendingJackpot: {
                    conditionId: null, // Could store condition ref if needed
                    prizeAmount: currentJackpotAmount,
                    conditionType: condition.type,
                    remainingCount: condition.count || 1,
                    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minute expiry
                },
            },
            { upsert: true }
        );
    }

    /**
     * Check if player has a pending jackpot that needs validation
     */
    private static async checkPendingJackpot(
        userId: string,
        gameType: string,
        gameResult: any,
    ): Promise<{ claimed: boolean; prizeAmount: number } | null> {
        const progress = await JackpotPlayerProgress.findOne({ userId, gameType });
        if (!progress?.pendingJackpot) return null;

        const { prizeAmount, expiresAt, conditionType, remainingCount } = progress.pendingJackpot;

        // Check expiry
        if (new Date() > expiresAt) {
            progress.pendingJackpot = undefined;
            await progress.save();
            return { claimed: false, prizeAmount: 0 };
        }

        const won = gameResult.won || false;
        const needsWin = conditionType === JackpotConditionType.WIN_NEXT;

        if ((needsWin && won) || (!needsWin && !won)) {
            const newRemaining = remainingCount - 1;
            if (newRemaining <= 0) {
                // Condition met!
                progress.pendingJackpot = undefined;
                await progress.save();
                return { claimed: true, prizeAmount };
            }
            // Still counting
            progress.pendingJackpot.remainingCount = newRemaining;
            await progress.save();
            return null; // Still pending
        }

        // Failed — reset
        progress.pendingJackpot = undefined;
        await progress.save();
        return { claimed: false, prizeAmount: 0 };
    }

    // ─── Payout & Award ────────────────────────────────────────────────

    /**
     * Calculate payout based on tiered payout configuration
     */
    private static calculateTieredPayout(
        jackpotAmount: number,
        betAmount: number,
        tiers: Array<{ minBetAmount: number; payoutPercent: number }>,
    ): number {
        if (!tiers.length) return jackpotAmount; // No tiers = full jackpot

        // Find highest applicable tier
        const sortedTiers = [...tiers].sort((a, b) => b.minBetAmount - a.minBetAmount);
        const applicableTier = sortedTiers.find(t => betAmount >= t.minBetAmount);

        if (!applicableTier) {
            // Bet below all tiers — use lowest tier
            const lowestTier = tiers.reduce((min, t) => t.minBetAmount < min.minBetAmount ? t : min);
            return jackpotAmount * (lowestTier.payoutPercent / 100);
        }

        return jackpotAmount * (applicableTier.payoutPercent / 100);
    }

    /**
     * Award jackpot to winner with transaction safety
     */
    private static async awardJackpot(
        jackpotId: string,
        userId: string,
        betAmount: number,
        currency: string,
        payoutAmount?: number,
    ) {
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                const jackpot = await Jackpot.findById(jackpotId).session(session);
                if (!jackpot) return;

                const awardAmount = payoutAmount || jackpot.currentAmount;

                await Jackpot.findByIdAndUpdate(
                    jackpotId,
                    { status: JackpotStatus.CALCULATING },
                    { session }
                );

                // Credit winner's wallet
                await WalletService.creditBalanceWithSession(
                    userId,
                    currency,
                    awardAmount,
                    session
                );

                // Record the win
                await JackpotWin.create([{
                    jackpotId: jackpot._id,
                    userId,
                    amount: awardAmount,
                    currency,
                }], { session });

                // Deduct awarded amount from pool and reset
                const newAmount = Math.max(0, jackpot.currentAmount - awardAmount);
                await Jackpot.findByIdAndUpdate(
                    jackpotId,
                    {
                        currentAmount: newAmount,
                        status: newAmount < jackpot.minAmount ? JackpotStatus.REFILLING : JackpotStatus.READY,
                        lastWinnerId: userId,
                        lastWinAmount: awardAmount,
                        lastWinAt: new Date(),
                    },
                    { session }
                );

                // Emit event for websocket broadcast
                setImmediate(() => {
                    jackpotEvents.emit('jackpot-won', {
                        userId,
                        amount: awardAmount,
                        currency,
                        gameType: jackpot.gameType,
                    });
                });

                console.log(`🎰 JACKPOT WON! User ${userId} won ${awardAmount} ${currency} on ${jackpot.gameType}`);
            });
        } finally {
            await session.endSession();
        }
    }

    // ─── Query Methods ─────────────────────────────────────────────────

    /**
     * Get all active jackpots
     */
    static async getAllJackpots() {
        return Jackpot.find().sort({ currentAmount: -1 });
    }

    /**
     * Get jackpot winners
     */
    static async getJackpotWinners(limit = 50) {
        return JackpotWin.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('jackpotId', 'gameType')
            .populate('userId', 'username');
    }

    /**
     * Get player progress for a specific game
     */
    static async getPlayerProgress(userId: string, gameType: string) {
        return JackpotPlayerProgress.findOne({ userId, gameType });
    }

    /**
     * Reset player progress (e.g., when player leaves a game session)
     */
    static async resetPlayerProgress(userId: string, gameType: string) {
        await JackpotPlayerProgress.findOneAndUpdate(
            { userId, gameType },
            {
                $set: {
                    winStreak: 0,
                    loseStreak: 0,
                    currentStreakType: null,
                    colorStreak: { green: 0, red: 0, violet: 0, black: 0 },
                    currentStreakColor: null,
                    sessionColorWins: { green: 0, red: 0, violet: 0, black: 0 },
                    numberWins: 0,
                    trenballStreaks: { red: 0, green: 0, moon: 0 },
                    lastResults: [],
                    pendingJackpot: undefined,
                },
            }
        );
    }
}
