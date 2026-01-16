import { Schema, model, Document, Types } from 'mongoose';

export interface ICrashRound extends Document {
  roundNumber: number;
  crashPoint: number;
  hash: string;
  startedAt: Date;
  crashedAt?: Date;
}

const crashRoundSchema = new Schema<ICrashRound>({
  roundNumber: { type: Number, required: true, unique: true, index: true },
  crashPoint: { type: Number, required: true },
  hash: { type: String, required: true },
  startedAt: { type: Date, required: true },
  crashedAt: { type: Date }
});

export const CrashRound = model<ICrashRound>('CrashRound', crashRoundSchema);

export interface ICrashBet extends Document {
  roundId: Types.ObjectId;
  userId: Types.ObjectId;
  currency: string;
  amount: number;
  autoCashout?: number;
  cashedOut: boolean;
  cashoutAt?: number;
  payout: number;
  createdAt: Date;
}

const crashBetSchema = new Schema<ICrashBet>({
  roundId: { type: Schema.Types.ObjectId, ref: 'CrashRound', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  currency: { type: String, required: true },
  amount: { type: Number, required: true },
  autoCashout: { type: Number },
  cashedOut: { type: Boolean, default: false },
  cashoutAt: { type: Number },
  payout: { type: Number, default: 0 }
}, { timestamps: true });

export const CrashBet = model<ICrashBet>('CrashBet', crashBetSchema);
