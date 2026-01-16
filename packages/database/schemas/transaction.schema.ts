import { Schema, model, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  walletId: Types.ObjectId;
  amount: number;
  type: string;
  beforeAmount: number;
  afterAmount: number;
  meta?: any;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true, index: true },
  beforeAmount: { type: Number, required: true },
  afterAmount: { type: Number, required: true },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true });

transactionSchema.index({ createdAt: -1 });

export const Transaction = model<ITransaction>('Transaction', transactionSchema);
