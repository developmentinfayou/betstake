import { Schema, model, Document, Types } from 'mongoose';

/**
 * Rakeback Configuration for Admin
 * Defines rakeback tiers, percentages, and eligibility rules
 */

export interface IRakebackTier {
    name: string;
    minWagered: number;      // Minimum total wagered to reach this tier
    percentage: number;      // Rakeback percentage (0-100)
    claimFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface IRakebackConfig extends Document {
    enabled: boolean;
    currency: string;
    tiers: IRakebackTier[];
    minClaimAmount: number;   // Minimum amount to claim
    maxClaimAmount: number;   // Maximum amount per claim
    autoCredit: boolean;      // Auto credit to wallet vs manual claim
    eligibleGames: string[];  // Games that contribute to rakeback
    contributionPercent: number;  // % of house edge that goes to rakeback
    createdAt: Date;
    updatedAt: Date;
    updatedBy?: Types.ObjectId;
}

const rakebackConfigSchema = new Schema<IRakebackConfig>({
    enabled: { type: Boolean, default: true },
    currency: { type: String, required: true, unique: true },
    tiers: [{
        name: { type: String, required: true },
        minWagered: { type: Number, required: true },
        percentage: { type: Number, required: true, min: 0, max: 100 },
        claimFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' }
    }],
    minClaimAmount: { type: Number, default: 1 },
    maxClaimAmount: { type: Number, default: 10000 },
    autoCredit: { type: Boolean, default: false },
    eligibleGames: [{ type: String }],
    contributionPercent: { type: Number, default: 5, min: 0, max: 50 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const RakebackConfig = model<IRakebackConfig>('RakebackConfig', rakebackConfigSchema);

// Default tiers
export const DEFAULT_RAKEBACK_TIERS: IRakebackTier[] = [
    { name: 'Bronze', minWagered: 0, percentage: 5, claimFrequency: 'weekly' },
    { name: 'Silver', minWagered: 1000, percentage: 7, claimFrequency: 'weekly' },
    { name: 'Gold', minWagered: 10000, percentage: 10, claimFrequency: 'weekly' },
    { name: 'Platinum', minWagered: 50000, percentage: 12, claimFrequency: 'daily' },
    { name: 'Diamond', minWagered: 100000, percentage: 15, claimFrequency: 'daily' }
];

export const DEFAULT_ELIGIBLE_GAMES = [
    'DICE', 'LIMBO', 'CRASH', 'PLINKO', 'MINES', 'FASTPARITY', 'BALLOON',
    'COINFLIP', 'WHEEL', 'ROULETTE', 'KENO', 'HILO', 'BLACKJACK', 'TOWER', 'STAIRS'
];
