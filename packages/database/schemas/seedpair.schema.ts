import { Schema, model, Document, Types } from 'mongoose';

export interface IActiveGameEntry {
  gameType: string;
  sessionId: string;
}

export interface ISeedPair extends Document {
  userId: Types.ObjectId;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  isActive: boolean;
  revealed: boolean;
  activeGameSessions: IActiveGameEntry[];
  createdAt: Date;
  revealedAt?: Date;
}

const seedPairSchema = new Schema<ISeedPair>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  serverSeed: { type: String, required: true },
  serverSeedHash: { type: String, required: true },
  clientSeed: { type: String, required: true },
  nonce: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  revealed: { type: Boolean, default: false },
  activeGameSessions: [{
    gameType: { type: String, required: true },
    sessionId: { type: String, required: true },
  }],
  revealedAt: { type: Date }
}, { timestamps: true });

seedPairSchema.index({ userId: 1, isActive: 1 });

export const SeedPair = model<ISeedPair>('SeedPair', seedPairSchema);
