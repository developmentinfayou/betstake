import { Schema, model, Document } from 'mongoose';

export interface IHiLoSession extends Document {
  userId: string;
  currentCard: number;
  cardHistory: number[];
  betAmount: number;
  currency: string;
  currentMultiplier: number;
  active: boolean;
  seedPairId: string;
  nonce: number;
  betId?: string;
  createdAt: Date;
}

const hiloSessionSchema = new Schema<IHiLoSession>({
  userId: { type: String, required: true, index: true },
  currentCard: { type: Number, required: true },
  cardHistory: { type: [Number], default: [] },
  betAmount: { type: Number, required: true },
  currency: { type: String, required: true },
  currentMultiplier: { type: Number, default: 1 },
  active: { type: Boolean, default: true, index: true },
  seedPairId: { type: String, required: true },
  nonce: { type: Number, required: true },
  betId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const HiLoSession = model<IHiLoSession>('HiLoSession', hiloSessionSchema);
