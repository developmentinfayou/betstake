import { Schema, model, Document, Types } from 'mongoose';

export enum JackpotStatus {
  REFILLING = 'REFILLING',
  READY = 'READY',
  MEGA = 'MEGA',
  CALCULATING = 'CALCULATING'
}

export interface IJackpot extends Document {
  gameType?: string;
  currency?: string;
  currentAmount: number;
  minAmount: number;
  status: JackpotStatus;
  houseEdgePercent: number;
  conditions: any;
  lastWinnerId?: Types.ObjectId;
  lastWinAmount?: number;
  lastWinAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jackpotSchema = new Schema<IJackpot>({
  gameType: { type: String },
  currency: { type: String },
  currentAmount: { type: Number, default: 0 },
  minAmount: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(JackpotStatus), default: JackpotStatus.REFILLING, index: true },
  houseEdgePercent: { type: Number, default: 1 },
  conditions: { type: Schema.Types.Mixed, required: true },
  lastWinnerId: { type: Schema.Types.ObjectId, ref: 'User' },
  lastWinAmount: { type: Number },
  lastWinAt: { type: Date }
}, { timestamps: true });

jackpotSchema.index({ gameType: 1, currency: 1 });

export const Jackpot = model<IJackpot>('Jackpot', jackpotSchema);

export interface IJackpotWin extends Document {
  jackpotId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  createdAt: Date;
}

const jackpotWinSchema = new Schema<IJackpotWin>({
  jackpotId: { type: Schema.Types.ObjectId, ref: 'Jackpot', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true }
}, { timestamps: true });

jackpotWinSchema.index({ createdAt: -1 });

export const JackpotWin = model<IJackpotWin>('JackpotWin', jackpotWinSchema);
