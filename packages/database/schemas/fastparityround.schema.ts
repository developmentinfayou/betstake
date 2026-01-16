import mongoose from 'mongoose';

export interface IFastParityRound {
  _id: mongoose.Types.ObjectId;
  roundId: string;
  number: number;
  color: 'green' | 'red' | 'violet';
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  
  // Round timing
  startTime: Date;
  bettingEndTime: Date;
  resultTime: Date;
  
  // Round state
  status: 'betting' | 'closed' | 'completed';
  
  // Statistics
  totalBets: number;
  totalAmount: number;
  totalPayout: number;
  playerCount: number;
  
  // Bets in this round
  bets: Array<{
    userId: string;
    username: string;
    betType: 'number' | 'color';
    value: number | string;
    amount: number;
    multiplier: number;
    payout: number;
    won: boolean;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const FastParityRoundSchema = new mongoose.Schema<IFastParityRound>({
  roundId: { type: String, required: true, unique: true },
  number: { type: Number, required: true, min: 0, max: 9 },
  color: { type: String, enum: ['green', 'red', 'violet'], required: true },
  serverSeed: { type: String, required: true },
  serverSeedHash: { type: String, required: true },
  clientSeed: { type: String, required: true },
  nonce: { type: Number, required: true },
  
  startTime: { type: Date, required: true },
  bettingEndTime: { type: Date, required: true },
  resultTime: { type: Date, required: true },
  
  status: { 
    type: String, 
    enum: ['betting', 'closed', 'completed'], 
    default: 'betting' 
  },
  
  totalBets: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  totalPayout: { type: Number, default: 0 },
  playerCount: { type: Number, default: 0 },
  
  bets: [{
    userId: String,
    username: String,
    betType: { type: String, enum: ['number', 'color'] },
    value: mongoose.Schema.Types.Mixed,
    amount: Number,
    multiplier: Number,
    payout: Number,
    won: Boolean
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'fastparityrounds'
});

// Compound indexes for performance
FastParityRoundSchema.index({ status: 1, startTime: -1 });
FastParityRoundSchema.index({ createdAt: -1 });
FastParityRoundSchema.index({ 'bets.userId': 1 });

export const FastParityRound = mongoose.model<IFastParityRound>('FastParityRound', FastParityRoundSchema);