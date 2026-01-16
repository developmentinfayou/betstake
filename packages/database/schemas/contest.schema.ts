import { Schema, model, Document, Types } from 'mongoose';

export interface IContest extends Document {
  title: string;
  type: string;
  currency?: string;
  prizePool: number;
  startAt: Date;
  endAt: Date;
  conditions: any;
  prizes: any;
  lastWinnerId?: Types.ObjectId;
  createdAt: Date;
}

const contestSchema = new Schema<IContest>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  currency: { type: String },
  prizePool: { type: Number, required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  conditions: { type: Schema.Types.Mixed, required: true },
  prizes: { type: Schema.Types.Mixed, required: true },
  lastWinnerId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

contestSchema.index({ startAt: 1, endAt: 1 });

export const Contest = model<IContest>('Contest', contestSchema);

export interface IContestEntry extends Document {
  contestId: Types.ObjectId;
  userId: Types.ObjectId;
  wagered: number;
  profit: number;
  rank?: number;
  prize?: number;
  createdAt: Date;
  updatedAt: Date;
}

const contestEntrySchema = new Schema<IContestEntry>({
  contestId: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wagered: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  rank: { type: Number },
  prize: { type: Number }
}, { timestamps: true });

contestEntrySchema.index({ contestId: 1, userId: 1 }, { unique: true });
contestEntrySchema.index({ contestId: 1, wagered: -1 });

export const ContestEntry = model<IContestEntry>('ContestEntry', contestEntrySchema);
