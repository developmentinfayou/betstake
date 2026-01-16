import { Schema, model, Document, Types } from 'mongoose';

export interface IUserActivity extends Document {
  userId: Types.ObjectId;
  activity: string;
  description?: string;
  severity: string;
  metadata?: any;
  createdAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  activity: { type: String, required: true },
  description: { type: String },
  severity: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

userActivitySchema.index({ createdAt: -1 });
userActivitySchema.index({ userId: 1, createdAt: -1 });

export const UserActivity = model<IUserActivity>('UserActivity', userActivitySchema);