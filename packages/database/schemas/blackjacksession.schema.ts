import { Schema, model, Document } from 'mongoose';

export interface IBlackjackSession extends Document {
  userId: string;
  dealerHand: Array<{ rank: string; suit: string; value: number }>;
  playerHands: Array<Array<{ rank: string; suit: string; value: number }>>;
  activeHandIndex: number;
  deck: Array<{ rank: string; suit: string; value: number }>;
  betAmount: number;
  currency: string;
  status: string;
  result: any;
  active: boolean;
  seedPairId: string;
  nonce: number;
  betId?: string;
  createdAt: Date;
}

const blackjackSessionSchema = new Schema<IBlackjackSession>({
  userId: { type: String, required: true, index: true },
  dealerHand: { type: [Object], required: true },
  playerHands: { type: [[Object]], required: true },
  activeHandIndex: { type: Number, default: 0 },
  deck: { type: [Object], required: true },
  betAmount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, default: 'active' },
  result: { type: Object },
  active: { type: Boolean, default: true, index: true },
  seedPairId: { type: String, required: true },
  nonce: { type: Number, required: true },
  betId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const BlackjackSession = model<IBlackjackSession>('BlackjackSession', blackjackSessionSchema);
