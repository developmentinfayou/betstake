import { Schema, model, Document, Types } from 'mongoose';

export interface IDiamondTransaction extends Document {
    userId: Types.ObjectId;
    amount: number;
    type: 'strategy_used' | 'spend' | 'bonus';
    relatedStrategyId?: Types.ObjectId;
    usedByUserId?: Types.ObjectId;
    createdAt: Date;
}

const diamondTransactionSchema = new Schema<IDiamondTransaction>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['strategy_used', 'spend', 'bonus'], required: true },
    relatedStrategyId: { type: Schema.Types.ObjectId, ref: 'Strategy' },
    usedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

diamondTransactionSchema.index({ userId: 1, createdAt: -1 });

export const DiamondTransaction = model<IDiamondTransaction>('DiamondTransaction', diamondTransactionSchema);
