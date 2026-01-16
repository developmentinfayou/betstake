import { Schema, model, Document, Types } from 'mongoose';

export enum Currency {
  BTC = 'BTC',
  ETH = 'ETH',
  LTC = 'LTC',
  USDT = 'USDT',
  USD = 'USD',
  EUR = 'EUR'
}

export interface IWallet extends Document {
  userId: Types.ObjectId;
  currency: Currency;
  balance: number;
  lockedBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  currency: { type: String, enum: Object.values(Currency), required: true },
  balance: { type: Number, default: 0 },
  lockedBalance: { type: Number, default: 0 }
}, { timestamps: true });

walletSchema.index({ userId: 1, currency: 1 }, { unique: true });

export const Wallet = model<IWallet>('Wallet', walletSchema);
