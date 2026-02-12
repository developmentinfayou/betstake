import { Schema, model, Document, Types } from 'mongoose';

/**
 * Unified Jackpot Player Progress
 * Tracks per-user, per-game streaks and progress for jackpot condition evaluation.
 * Replaces game-specific progress tracking (FastParityPlayerProgress, crash streak tracking).
 */
export interface IJackpotPlayerProgress extends Document {
    userId: Types.ObjectId;
    gameType: string;

    // General streaks
    winStreak: number;
    loseStreak: number;
    currentStreakType: 'win' | 'lose' | null;

    // Color-based streaks (FastParity, Roulette)
    colorStreak: {
        green: number;
        red: number;
        violet: number;
        black: number;
    };
    currentStreakColor: string | null;
    sessionColorWins: {
        green: number;
        red: number;
        violet: number;
        black: number;
    };

    // Number match tracking
    numberWins: number;

    // Trenball streaks (Crash)
    trenballStreaks: {
        red: number;
        green: number;
        moon: number;
    };

    // Recent results for trajectory/pattern matching (Plinko, etc.)
    lastResults: any[];

    // Pending jackpot (for WIN_NEXT / LOSE_NEXT conditions)
    pendingJackpot?: {
        conditionId: Types.ObjectId;
        prizeAmount: number;
        conditionType: string;
        remainingCount: number;
        expiresAt: Date;
    };

    lastUpdated: Date;
}

const jackpotPlayerProgressSchema = new Schema<IJackpotPlayerProgress>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gameType: { type: String, required: true },

    winStreak: { type: Number, default: 0 },
    loseStreak: { type: Number, default: 0 },
    currentStreakType: { type: String, enum: ['win', 'lose', null], default: null },

    colorStreak: {
        green: { type: Number, default: 0 },
        red: { type: Number, default: 0 },
        violet: { type: Number, default: 0 },
        black: { type: Number, default: 0 },
    },
    currentStreakColor: { type: String, default: null },
    sessionColorWins: {
        green: { type: Number, default: 0 },
        red: { type: Number, default: 0 },
        violet: { type: Number, default: 0 },
        black: { type: Number, default: 0 },
    },

    numberWins: { type: Number, default: 0 },

    trenballStreaks: {
        red: { type: Number, default: 0 },
        green: { type: Number, default: 0 },
        moon: { type: Number, default: 0 },
    },

    lastResults: [{ type: Schema.Types.Mixed }],

    pendingJackpot: {
        conditionId: { type: Schema.Types.ObjectId },
        prizeAmount: { type: Number },
        conditionType: { type: String },
        remainingCount: { type: Number },
        expiresAt: { type: Date },
    },

    lastUpdated: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

// Compound index for fast lookup
jackpotPlayerProgressSchema.index({ userId: 1, gameType: 1 }, { unique: true });

export const JackpotPlayerProgress = model<IJackpotPlayerProgress>(
    'JackpotPlayerProgress',
    jackpotPlayerProgressSchema
);
