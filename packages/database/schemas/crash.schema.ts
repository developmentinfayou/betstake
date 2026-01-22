import { Schema, model, Document, Types } from 'mongoose';

// Game mode types
export type CrashGameMode = 'classic' | 'trenball';
export type TrenballBetType = 'crash' | 'red' | 'green' | 'moon';

// Trenball result structure
export interface TrenballResult {
  type: TrenballBetType;
  multiplier: number;
}

export interface ICrashRound extends Document {
  roundNumber: number;
  mode: CrashGameMode;
  crashPoint: number;
  hash: string;
  startedAt: Date;
  crashedAt?: Date;
  // Trenball mode specific
  trenballResult?: TrenballResult;
}

const crashRoundSchema = new Schema<ICrashRound>({
  roundNumber: { type: Number, required: true, unique: true, index: true },
  mode: { type: String, enum: ['classic', 'trenball'], default: 'classic', required: true },
  crashPoint: { type: Number, required: true },
  hash: { type: String, required: true },
  startedAt: { type: Date, required: true },
  crashedAt: { type: Date },
  trenballResult: {
    type: { type: String, enum: ['crash', 'red', 'green', 'moon'] },
    multiplier: { type: Number }
  }
});

// Index for mode-based queries
crashRoundSchema.index({ mode: 1, roundNumber: -1 });

export const CrashRound = model<ICrashRound>('CrashRound', crashRoundSchema);

export interface ICrashBet extends Document {
  roundId: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  currency: string;
  amount: number;
  // Classic mode fields
  autoCashout?: number;
  cashedOut: boolean;
  cashoutAt?: number;
  // Trenball mode fields
  betType?: TrenballBetType;
  // Common fields
  payout: number;
  won: boolean;
  createdAt: Date;
}

const crashBetSchema = new Schema<ICrashBet>({
  roundId: { type: Schema.Types.ObjectId, ref: 'CrashRound', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  username: { type: String, required: true },
  currency: { type: String, required: true },
  amount: { type: Number, required: true },
  // Classic mode
  autoCashout: { type: Number },
  cashedOut: { type: Boolean, default: false },
  cashoutAt: { type: Number },
  // Trenball mode
  betType: { type: String, enum: ['crash', 'red', 'green', 'moon'] },
  // Common
  payout: { type: Number, default: 0 },
  won: { type: Boolean, default: false }
}, { timestamps: true });

// Compound index for user bet queries
crashBetSchema.index({ userId: 1, createdAt: -1 });

export const CrashBet = model<ICrashBet>('CrashBet', crashBetSchema);
