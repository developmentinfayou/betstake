import { Schema, model, Document } from 'mongoose';

export interface IGameConfig extends Document {
  gameType: string;
  houseEdge: number;
  minBet: any;
  maxBet: any;
  maxWin: any;
  isEnabled: boolean;
  config: any;
  updatedAt: Date;
}

const gameConfigSchema = new Schema<IGameConfig>({
  gameType: { type: String, required: true, unique: true },
  houseEdge: { type: Number, required: true },
  minBet: { type: Schema.Types.Mixed, required: true },
  maxBet: { type: Schema.Types.Mixed, required: true },
  maxWin: { type: Schema.Types.Mixed, required: true },
  isEnabled: { type: Boolean, default: true },
  config: { type: Schema.Types.Mixed, required: true }
}, { timestamps: true });

export const GameConfig = model<IGameConfig>('GameConfig', gameConfigSchema);
