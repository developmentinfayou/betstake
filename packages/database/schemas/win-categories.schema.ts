import { Schema, model, Document, Types } from 'mongoose';

/**
 * Win Categories Schema
 * Admin-configurable thresholds for High Roller, Big Win, Lucky Win
 * Phase 1 MVP: Single currency (USD)
 */

export interface IWinCategories extends Document {
    highRoller: {
        mode: 'AMOUNT' | 'MULTIPLIER';
        amountUSD: number;
        multiplier: number;
    };
    bigWin: {
        minBetAmountUSD: number;
    };
    luckyWin: {
        mode: 'GLOBAL' | 'PER_GAME';
        globalMinMultiplier: number;
        perGameMinMultiplier: Map<string, number>;
    };
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const winCategoriesSchema = new Schema<IWinCategories>({
    highRoller: {
        mode: { type: String, enum: ['AMOUNT', 'MULTIPLIER'], default: 'AMOUNT' },
        amountUSD: { type: Number, default: 100, min: 0 },
        multiplier: { type: Number, default: 10, min: 1 }
    },
    bigWin: {
        minBetAmountUSD: { type: Number, default: 10, min: 0 }
    },
    luckyWin: {
        mode: { type: String, enum: ['GLOBAL', 'PER_GAME'], default: 'GLOBAL' },
        globalMinMultiplier: { type: Number, default: 10, min: 1 },
        perGameMinMultiplier: {
            type: Schema.Types.Map,
            of: Number,
            default: new Map()
        }
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const WinCategories = model<IWinCategories>('WinCategories', winCategoriesSchema);

// Default win category settings
export const DEFAULT_WIN_CATEGORIES = {
    highRoller: { mode: 'AMOUNT', amountUSD: 100, multiplier: 10 },
    bigWin: { minBetAmountUSD: 10 },
    luckyWin: { mode: 'GLOBAL', globalMinMultiplier: 10, perGameMinMultiplier: {} }
};
