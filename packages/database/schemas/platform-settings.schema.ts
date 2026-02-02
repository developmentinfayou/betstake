import { Schema, model, Document, Types } from 'mongoose';

/**
 * Platform Settings Schema
 * Global configuration for the casino platform
 */

export interface IPlatformSettings extends Document {
    // General Settings
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;

    // Game Settings
    defaultHouseEdge: number;        // Default house edge percentage (0-10)
    maxBetMultiplier: number;        // Max bet multiplier
    minBetAmount: Map<string, number>;   // Min bet by currency
    maxBetAmount: Map<string, number>;   // Max bet by currency

    // Jackpot Settings
    jackpotContributionPercent: number;  // % of house edge to jackpot
    jackpotMinSeed: Map<string, number>; // Minimum jackpot by currency

    // User Settings
    maxDailyWithdrawal: Map<string, number>;
    maxWithdrawalsPerDay: number;
    newUserBonusEnabled: boolean;
    newUserBonusAmount: Map<string, number>;

    // Security Settings
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
    sessionTimeoutMinutes: number;
    require2FA: boolean;

    // Audit
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const platformSettingsSchema = new Schema<IPlatformSettings>({
    // General
    siteName: { type: String, default: 'CasinoBit' },
    siteDescription: { type: String, default: 'Fair & Transparent Crypto Gaming' },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'We are currently performing maintenance. Please check back soon.' },

    // Game Settings
    defaultHouseEdge: { type: Number, default: 1, min: 0, max: 10 },
    maxBetMultiplier: { type: Number, default: 10000 },
    minBetAmount: {
        type: Schema.Types.Map,
        of: Number,
        default: new Map([['USD', 0.1], ['BTC', 0.00001], ['ETH', 0.0001]])
    },
    maxBetAmount: {
        type: Schema.Types.Map,
        of: Number,
        default: new Map([['USD', 10000], ['BTC', 1], ['ETH', 10]])
    },

    // Jackpot
    jackpotContributionPercent: { type: Number, default: 10, min: 0, max: 100 },
    jackpotMinSeed: {
        type: Schema.Types.Map,
        of: Number,
        default: new Map([['USD', 1000], ['BTC', 0.1], ['ETH', 1]])
    },

    // User
    maxDailyWithdrawal: {
        type: Schema.Types.Map,
        of: Number,
        default: new Map([['USD', 50000], ['BTC', 5], ['ETH', 50]])
    },
    maxWithdrawalsPerDay: { type: Number, default: 5 },
    newUserBonusEnabled: { type: Boolean, default: false },
    newUserBonusAmount: {
        type: Schema.Types.Map,
        of: Number,
        default: new Map([['USD', 10], ['BTC', 0.001], ['ETH', 0.01]])
    },

    // Security
    maxLoginAttempts: { type: Number, default: 5 },
    lockoutDurationMinutes: { type: Number, default: 30 },
    sessionTimeoutMinutes: { type: Number, default: 60 },
    require2FA: { type: Boolean, default: false },

    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const PlatformSettings = model<IPlatformSettings>('PlatformSettings', platformSettingsSchema);

// Default settings factory
export const DEFAULT_PLATFORM_SETTINGS = {
    siteName: 'CasinoBit',
    siteDescription: 'Fair & Transparent Crypto Gaming',
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
    defaultHouseEdge: 1,
    maxBetMultiplier: 10000,
    minBetAmount: { USD: 0.1, BTC: 0.00001, ETH: 0.0001 },
    maxBetAmount: { USD: 10000, BTC: 1, ETH: 10 },
    jackpotContributionPercent: 10,
    jackpotMinSeed: { USD: 1000, BTC: 0.1, ETH: 1 },
    maxDailyWithdrawal: { USD: 50000, BTC: 5, ETH: 50 },
    maxWithdrawalsPerDay: 5,
    newUserBonusEnabled: false,
    newUserBonusAmount: { USD: 10, BTC: 0.001, ETH: 0.01 },
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    sessionTimeoutMinutes: 60,
    require2FA: false
};
