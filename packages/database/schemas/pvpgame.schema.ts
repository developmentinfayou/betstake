import { Schema, model, Document, Types } from 'mongoose';

export enum PVPGameStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

export enum PVPGameType {
  LUDO = 'LUDO',
  CHESS = 'CHESS'
}

export interface IPVPGame extends Document {
  gameType: PVPGameType;
  mode: string;
  players: Types.ObjectId[];
  betAmount: number;
  currency: string;
  status: PVPGameStatus;
  winner?: Types.ObjectId;
  moves: any[];
  gameState: any;
  startedAt?: Date;
  finishedAt?: Date;
  shareableLink: string;
  antiCheatData: any;
  createdAt: Date;
  updatedAt: Date;
}

const pvpGameSchema = new Schema<IPVPGame>({
  gameType: { type: String, enum: Object.values(PVPGameType), required: true },
  mode: { type: String, required: true },
  players: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  betAmount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: Object.values(PVPGameStatus), default: PVPGameStatus.WAITING },
  winner: { type: Schema.Types.ObjectId, ref: 'User' },
  moves: [{ type: Schema.Types.Mixed }],
  gameState: { type: Schema.Types.Mixed, required: true },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  shareableLink: { type: String, required: true, unique: true },
  antiCheatData: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

pvpGameSchema.index({ status: 1, gameType: 1 });
pvpGameSchema.index({ players: 1 });

export const PVPGame = model<IPVPGame>('PVPGame', pvpGameSchema);