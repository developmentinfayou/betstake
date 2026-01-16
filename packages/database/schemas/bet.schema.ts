import { Schema, model, Document, Types } from 'mongoose';

export enum BetStatus {
  PENDING = 'PENDING',
  WON = 'WON',
  LOST = 'LOST',
  REFUNDED = 'REFUNDED'
}

export enum GameType {
  DICE = 'DICE',
  LIMBO = 'LIMBO',
  CRASH = 'CRASH',
  MINES = 'MINES',
  PLINKO = 'PLINKO',
  ROULETTE = 'ROULETTE',
  FASTPARITY = 'FASTPARITY',
  KENO = 'KENO',
  TOWER = 'TOWER',
  HILO = 'HILO',
  BLACKJACK = 'BLACKJACK',
  WHEEL = 'WHEEL',
  BALLOON = 'BALLOON',
  RUSH = 'RUSH',
  COINFLIP = 'COINFLIP',
  TRENBALL = 'TRENBALL',
  LUDO = 'LUDO',
  CHESS = 'CHESS',
  STAIRS = 'STAIRS'
}

export interface IBet extends Document {
  userId: Types.ObjectId;
  gameType: GameType;
  currency: string;
  amount: number;
  multiplier: number;
  payout: number;
  profit: number;
  status: BetStatus;
  seedPairId: Types.ObjectId;
  nonce: number;
  gameData: any;
  result: any;
  isDemo: boolean;
  isAutoBet: boolean;
  strategyId?: Types.ObjectId;
  createdAt: Date;
}

const betSchema = new Schema<IBet>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gameType: { type: String, enum: Object.values(GameType), required: true, index: true },
  currency: { type: String, required: true },
  amount: { type: Number, required: true },
  multiplier: { type: Number, required: true },
  payout: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(BetStatus), default: BetStatus.PENDING, index: true },
  seedPairId: { type: Schema.Types.ObjectId, ref: 'SeedPair', required: true },
  nonce: { type: Number, required: true },
  gameData: { type: Schema.Types.Mixed, required: true },
  result: { type: Schema.Types.Mixed, required: true },
  isDemo: { type: Boolean, default: false },
  isAutoBet: { type: Boolean, default: false },
  strategyId: { type: Schema.Types.ObjectId, ref: 'Strategy' }
}, { timestamps: true });

betSchema.index({ createdAt: -1 });

export const Bet = model<IBet>('Bet', betSchema);
