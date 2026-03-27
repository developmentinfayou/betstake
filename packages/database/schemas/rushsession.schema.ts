import { Schema, model, Document } from 'mongoose';

export type RushDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface IRushSession extends Document {
  userId: string;
  betAmount: number;
  currency: string;
  difficulty: RushDifficulty;
  stepsPassed: number;
  currentMultiplier: number;
  crashPoint: number;
  active: boolean;
  seedPairId: string;
  nonce: number;
  betId?: string;
  createdAt: Date;
}

const rushSessionSchema = new Schema<IRushSession>({
  userId: { type: String, required: true, index: true },
  betAmount: { type: Number, required: true },
  currency: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true },
  stepsPassed: { type: Number, default: 0 },
  currentMultiplier: { type: Number, default: 1 },
  crashPoint: { type: Number, required: true },
  active: { type: Boolean, default: true, index: true },
  seedPairId: { type: String, required: true },
  nonce: { type: Number, required: true },
  betId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const RushSession = model<IRushSession>('RushSession', rushSessionSchema);
