import mongoose from 'mongoose';

// Game types for crash jackpot
export type CrashJackpotGameType = 'crash_classic' | 'crash_trenball' | 'solo_crash';

// Winner selection types
export type CrashWinnerType =
    | 'highest_bettor'      // Highest bet amount of the round
    | 'highest_winner'      // Highest winner of the round
    | 'highest_loser'       // Highest loser of the round
    | 'closest_777'         // Closest cashout to 7.77 or 77.77
    | 'ratio_distribution'  // Distribute by betting amount ratio
    | 'equal_distribution'; // Distribute equally to all bettors

// Trigger condition types
export type CrashConditionType =
    | 'multiplier_hit'      // Crash hits specific multiplier (7.77, 77.77)
    | 'bet_on_multiplier'   // Player bets when crash hits multiplier
    | 'win_on_multiplier'   // Player wins when crash >= multiplier
    | 'lose_on_multiplier'  // Player loses when crash < multiplier
    | 'win_streak'          // Win X times in a row
    | 'lose_streak'         // Lose X times in a row
    | 'trenball_streak'     // Win specific trenball type X times
    | 'percentage_chance';  // X% random chance per bet

// Jackpot condition (admin configurable)
export interface ICrashJackpotCondition {
    _id: mongoose.Types.ObjectId;
    name: string;
    gameType: CrashJackpotGameType;

    // Winner Selection
    winnerType: CrashWinnerType;
    distributionFilter?: {
        betType?: 'crash' | 'red' | 'green' | 'moon';  // Only for specific trenball bet types
        winnersOnly?: boolean;                          // Only distribute to winners
        bettorsOnly?: boolean;                          // Only distribute to people who bet
    };

    // Trigger Condition
    conditionType: CrashConditionType;
    targetMultiplier?: number;       // 7.77, 77.77, etc.
    streakCount?: number;            // Number of times in a row
    betType?: string;                // For trenball streak conditions
    percentageChance?: number;       // For percentage-based triggers (0-100)
    requireInARow?: boolean;         // "+ in a row" option

    // Prize Settings
    prizeAmount: number;
    prizeType: 'fixed' | 'multiplier';

    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Player progress tracking for jackpot conditions
export interface ICrashPlayerProgress {
    _id: mongoose.Types.ObjectId;
    userId: string;

    // Win/Lose streak tracking
    currentStreak: {
        type: 'win' | 'lose' | null;
        count: number;
    };

    // Trenball color streak tracking
    trenballStreaks: {
        crash: number;
        red: number;
        green: number;
        moon: number;
    };
    currentTrenballStreak: string | null;

    // Pending jackpot (for "win next X bets" condition)
    pendingJackpot?: {
        conditionId: mongoose.Types.ObjectId;
        prizeAmount: number;
        remainingWins: number;
        expiresAt: Date;
    };

    lastUpdated: Date;
}

// Jackpot Condition Schema
const CrashJackpotConditionSchema = new mongoose.Schema<ICrashJackpotCondition>({
    name: { type: String, required: true },
    gameType: {
        type: String,
        enum: ['crash_classic', 'crash_trenball', 'solo_crash'],
        required: true
    },

    // Winner Selection
    winnerType: {
        type: String,
        enum: ['highest_bettor', 'highest_winner', 'highest_loser', 'closest_777', 'ratio_distribution', 'equal_distribution'],
        required: true
    },
    distributionFilter: {
        betType: { type: String, enum: ['crash', 'red', 'green', 'moon'] },
        winnersOnly: { type: Boolean },
        bettorsOnly: { type: Boolean }
    },

    // Trigger Condition
    conditionType: {
        type: String,
        enum: ['multiplier_hit', 'bet_on_multiplier', 'win_on_multiplier', 'lose_on_multiplier', 'win_streak', 'lose_streak', 'trenball_streak', 'percentage_chance'],
        required: true
    },
    targetMultiplier: { type: Number },
    streakCount: { type: Number, min: 1 },
    betType: { type: String },
    percentageChance: { type: Number, min: 0, max: 100 },
    requireInARow: { type: Boolean, default: false },

    // Prize
    prizeAmount: { type: Number, required: true, min: 0 },
    prizeType: { type: String, enum: ['fixed', 'multiplier'], default: 'fixed' },

    isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'crashjackpotconditions' });

// Player Progress Schema
const CrashPlayerProgressSchema = new mongoose.Schema<ICrashPlayerProgress>({
    userId: { type: String, required: true, unique: true },

    currentStreak: {
        type: { type: String, enum: ['win', 'lose', null], default: null },
        count: { type: Number, default: 0 }
    },

    trenballStreaks: {
        crash: { type: Number, default: 0 },
        red: { type: Number, default: 0 },
        green: { type: Number, default: 0 },
        moon: { type: Number, default: 0 }
    },
    currentTrenballStreak: { type: String, default: null },

    pendingJackpot: {
        conditionId: { type: mongoose.Schema.Types.ObjectId },
        prizeAmount: { type: Number },
        remainingWins: { type: Number },
        expiresAt: { type: Date }
    },

    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'crashplayerprogress' });

// Indexes
CrashJackpotConditionSchema.index({ isActive: 1, gameType: 1 });
CrashJackpotConditionSchema.index({ conditionType: 1 });
CrashPlayerProgressSchema.index({ userId: 1 });

export const CrashJackpotCondition = mongoose.model<ICrashJackpotCondition>(
    'CrashJackpotCondition',
    CrashJackpotConditionSchema
);

export const CrashPlayerProgress = mongoose.model<ICrashPlayerProgress>(
    'CrashPlayerProgress',
    CrashPlayerProgressSchema
);
