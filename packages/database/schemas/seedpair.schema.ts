import { Schema, model, Document, Types } from 'mongoose';

export interface ISeedPair extends Document {
  userId: Types.ObjectId;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  isActive: boolean;
  revealed: boolean;
  activeGameSession?: string; // NEW: Track active game session
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
  activeGameSession: { type: String }, // NEW: Track active game session
  revealedAt: { type: Date }
}, { timestamps: true });

seedPairSchema.index({ userId: 1, isActive: 1 });

export const SeedPair = model<ISeedPair>('SeedPair', seedPairSchema);
