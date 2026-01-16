import { Schema, model, Document, Types } from 'mongoose';

export interface IUserStats extends Document {
  userId: Types.ObjectId;
  totalWagered: number;
  totalProfit: number;
  totalWins: number;
  totalLosses: number;
  updatedAt: Date;
}

const userStatsSchema = new Schema<IUserStats>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalWagered: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  totalWins: { type: Number, default: 0 },
  totalLosses: { type: Number, default: 0 }
}, { timestamps: true });

export const UserStats = model<IUserStats>('UserStats', userStatsSchema);
