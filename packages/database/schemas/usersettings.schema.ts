import { Schema, model, Document, Types } from 'mongoose';

export interface IUserSettings extends Document {
  userId: Types.ObjectId;
  animations: boolean;
  hotkeysEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  showMaxBet: boolean;
  instantBet: boolean;
  theatreMode: boolean;
  rakebackOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSettingsSchema = new Schema<IUserSettings>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  animations: { type: Boolean, default: true },
  hotkeysEnabled: { type: Boolean, default: true },
  soundEnabled: { type: Boolean, default: true },
  soundVolume: { type: Number, default: 0.5 },
  showMaxBet: { type: Boolean, default: true },
  instantBet: { type: Boolean, default: false },
  theatreMode: { type: Boolean, default: false },
  rakebackOptIn: { type: Boolean, default: false }
}, { timestamps: true });

export const UserSettings = model<IUserSettings>('UserSettings', userSettingsSchema);
