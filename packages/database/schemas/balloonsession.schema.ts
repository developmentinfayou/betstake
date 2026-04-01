import { Schema, model, Document } from 'mongoose';

export type PumpDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface IBalloonSession extends Document {
  userId: string;
  betAmount: number;
  currency: string;
  difficulty: PumpDifficulty;
  pumpsPassed: number;
  currentMultiplier: number;
  burstPoint: number;
  active: boolean;
  seedPairId: string;
  nonce: number;
  betId?: string;
  createdAt: Date;
}

const balloonSessionSchema = new Schema<IBalloonSession>({
  userId: { type: String, required: true, index: true },
  betAmount: { type: Number, required: true },
  currency: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true },
  pumpsPassed: { type: Number, default: 0 },
  currentMultiplier: { type: Number, default: 1 },
  burstPoint: { type: Number, required: true },
  active: { type: Boolean, default: true, index: true },
  seedPairId: { type: String, required: true },
  nonce: { type: Number, required: true },
  betId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const BalloonSession = model<IBalloonSession>('BalloonSession', balloonSessionSchema);
