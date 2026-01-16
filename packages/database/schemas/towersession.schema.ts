import { Schema, model, Document } from 'mongoose';

export interface ITowerSession extends Document {
  userId: string;
  grid: boolean[];
  floors: number;
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

const towerSessionSchema = new Schema<ITowerSession>({
  userId: { type: String, required: true, index: true },
  grid: { type: [Boolean], required: true },
  floors: { type: Number, required: true },
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

export const TowerSession = model<ITowerSession>('TowerSession', towerSessionSchema);
