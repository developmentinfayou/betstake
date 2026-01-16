import { Schema, model, Document, Types } from 'mongoose';

export interface IMinesSession extends Document {
  userId: Types.ObjectId;
  betId?: Types.ObjectId;
  grid: boolean[];
  revealedTiles: number[];
  minesCount: number;
  gridSize: number;
  currentMultiplier: number;
  betAmount: number;
  currency: string;
  active: boolean;
  seedPairId: Types.ObjectId;
  nonce: number;
  createdAt: Date;
}

const minesSessionSchema = new Schema<IMinesSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  betId: { type: Schema.Types.ObjectId, ref: 'Bet' },
  grid: { type: [Boolean], required: true },
  revealedTiles: { type: [Number], default: [] },
  minesCount: { type: Number, required: true },
  gridSize: { type: Number, required: true },
  currentMultiplier: { type: Number, default: 1 },
  betAmount: { type: Number, required: true },
  currency: { type: String, required: true },
  active: { type: Boolean, default: true },
  seedPairId: { type: Schema.Types.ObjectId, required: true },
  nonce: { type: Number, required: true },
}, { timestamps: true });

minesSessionSchema.index({ userId: 1, active: 1 });

export const MinesSession = model<IMinesSession>('MinesSession', minesSessionSchema);
