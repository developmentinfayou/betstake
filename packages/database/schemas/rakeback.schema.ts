import { Schema, model, Document, Types } from 'mongoose';

export interface IRakeback extends Document {
  userId: Types.ObjectId;
  currency: string;
  amount: number;
  claimed: boolean;
  claimedAt?: Date;
  createdAt: Date;
}

const rakebackSchema = new Schema<IRakeback>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  currency: { type: String, required: true },
  amount: { type: Number, required: true },
  claimed: { type: Boolean, default: false },
  claimedAt: { type: Date }
}, { timestamps: true });

rakebackSchema.index({ userId: 1, claimed: 1 });

export const Rakeback = model<IRakeback>('Rakeback', rakebackSchema);
