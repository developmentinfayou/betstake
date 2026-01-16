import { Schema, model, Document } from 'mongoose';

export enum UserRole {
  USER = 'USER',
  VIP = 'VIP',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  level: number;
  xp: number;
  isVip: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  isVip: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false }
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
