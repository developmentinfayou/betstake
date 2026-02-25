import { Schema, model, Document, Types } from 'mongoose';

export interface ICoinFlipSession extends Document {
    userId: Types.ObjectId;
    betId?: Types.ObjectId;
    results: ('heads' | 'tails')[];    // Pre-generated results for all rounds
    picks: ('heads' | 'tails')[];       // User's picks so far
    currentRound: number;               // Rounds completed (0-indexed)
    maxRounds: number;                   // Max possible rounds
    currentMultiplier: number;
    betAmount: number;
    currency: string;
    active: boolean;
    seedPairId: Types.ObjectId;
    nonce: number;
    createdAt: Date;
}

const coinFlipSessionSchema = new Schema<ICoinFlipSession>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    betId: { type: Schema.Types.ObjectId, ref: 'Bet' },
    results: { type: [String], required: true },
    picks: { type: [String], default: [] },
    currentRound: { type: Number, default: 0 },
    maxRounds: { type: Number, default: 20 },
    currentMultiplier: { type: Number, default: 1 },
    betAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    active: { type: Boolean, default: true },
    seedPairId: { type: Schema.Types.ObjectId, required: true },
    nonce: { type: Number, required: true },
}, { timestamps: true });

coinFlipSessionSchema.index({ userId: 1, active: 1 });

export const CoinFlipSession = model<ICoinFlipSession>('CoinFlipSession', coinFlipSessionSchema);
