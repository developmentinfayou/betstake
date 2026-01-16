import { Schema, model, Document } from 'mongoose';

export interface IStairsSession extends Document {
  userId: string;
  grid: boolean[];
  steps: number;
  betAmount: number;
  currency: string;
  revealedTiles: number[];
  currentMultiplier: number;
  active: boolean;
  seedPairId: string;
  nonce: number;
  betId?: string;
  createdAt: Date;
}

const stairsSessionSchema = new Schema<IStairsSession>({
  userId: { type: String, required: true, index: true },
  grid: { type: [Boolean], required: true },
  steps: { type: Number, required: true },
  betAmount: { type: Number, required: true },
  currency: { type: String, required: true },
  revealedTiles: { type: [Number], default: [] },
  currentMultiplier: { type: Number, default: 1 },
  active: { type: Boolean, default: true, index: true },
  seedPairId: { type: String, required: true },
  nonce: { type: Number, required: true },
  betId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const StairsSession = model<IStairsSession>('StairsSession', stairsSessionSchema);
