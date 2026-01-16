import { Schema, model, Document, Types } from 'mongoose';

export interface IStrategy extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  gameType: string;
  isPublic: boolean;
  commission: number;
  conditions: any;
  script?: string;
  totalUses: number;
  totalProfit: number;
  aum: number;
  createdAt: Date;
  updatedAt: Date;
}

const strategySchema = new Schema<IStrategy>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  gameType: { type: String, required: true, index: true },
  isPublic: { type: Boolean, default: false, index: true },
  commission: { type: Number, default: 0 },
  conditions: { type: Schema.Types.Mixed, required: true },
  script: { type: String },
  totalUses: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  aum: { type: Number, default: 0 }
}, { timestamps: true });

export const Strategy = model<IStrategy>('Strategy', strategySchema);
