import mongoose from 'mongoose';

// Fast Parity specific jackpot condition types
export interface IFastParityJackpotCondition {
    _id: mongoose.Types.ObjectId;
    name: string;
    type: 'color_streak' | 'number_match' | 'overall_color' | 'number_color_combo';
    targetCount: number;
    targetValue?: string | number;
    prizeAmount: number;
    prizeType: 'fixed' | 'multiplier';
    isActive: boolean;
    requireNextWin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Track player progress toward jackpot conditions
export interface IFastParityPlayerProgress {
    _id: mongoose.Types.ObjectId;
    userId: string;
    colorStreak: { green: number; red: number; violet: number };
    currentStreakColor: string | null;
    numberWins: number;
    sessionColorWins: { green: number; red: number; violet: number };
    pendingJackpot?: {
        conditionId: mongoose.Types.ObjectId;
        prizeAmount: number;
        expiresAt: Date;
    };
    lastUpdated: Date;
}

const FastParityJackpotConditionSchema = new mongoose.Schema<IFastParityJackpotCondition>({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['color_streak', 'number_match', 'overall_color', 'number_color_combo'],
        required: true
    },
    targetCount: { type: Number, required: true, min: 1 },
    targetValue: { type: mongoose.Schema.Types.Mixed },
    prizeAmount: { type: Number, required: true, min: 0 },
    prizeType: { type: String, enum: ['fixed', 'multiplier'], default: 'fixed' },
    isActive: { type: Boolean, default: true },
    requireNextWin: { type: Boolean, default: false }
}, { timestamps: true, collection: 'fastparityjackpotconditions' });

const FastParityPlayerProgressSchema = new mongoose.Schema<IFastParityPlayerProgress>({
    userId: { type: String, required: true, unique: true },
    colorStreak: {
        green: { type: Number, default: 0 },
        red: { type: Number, default: 0 },
        violet: { type: Number, default: 0 }
    },
    currentStreakColor: { type: String, default: null },
    numberWins: { type: Number, default: 0 },
    sessionColorWins: {
        green: { type: Number, default: 0 },
        red: { type: Number, default: 0 },
        violet: { type: Number, default: 0 }
    },
    pendingJackpot: {
        conditionId: { type: mongoose.Schema.Types.ObjectId },
        prizeAmount: Number,
        expiresAt: Date
    },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'fastparityplayerprogress' });

// Indexes
FastParityJackpotConditionSchema.index({ isActive: 1, type: 1 });
FastParityPlayerProgressSchema.index({ userId: 1 });

export const FastParityJackpotCondition = mongoose.model<IFastParityJackpotCondition>(
    'FastParityJackpotCondition',
    FastParityJackpotConditionSchema
);

export const FastParityPlayerProgress = mongoose.model<IFastParityPlayerProgress>(
    'FastParityPlayerProgress',
    FastParityPlayerProgressSchema
);
