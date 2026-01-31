import { Schema, model, Document, Types } from 'mongoose';
import { GameType } from './bet.schema';

/**
 * Challenge Status
 */
export enum ChallengeStatus {
    DRAFT = 'DRAFT',
    SCHEDULED = 'SCHEDULED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

/**
 * Challenge Condition Types
 * Based on client documentation:
 * - Win/Lose X times in a row with multiplier/win percent conditions
 * - Wager X times in a row with multiplier/win percent conditions
 * - Hit specific multiplier (for games where multiplier cannot be set)
 */
export enum ChallengeConditionType {
    WIN_X_IN_ROW = 'WIN_X_IN_ROW',
    LOSE_X_IN_ROW = 'LOSE_X_IN_ROW',
    WAGER_X_IN_ROW = 'WAGER_X_IN_ROW',
    HIT_MULTIPLIER = 'HIT_MULTIPLIER'
}

export enum ConditionOperator {
    GT = 'GT',   // Greater than
    LT = 'LT',   // Less than
    GTE = 'GTE', // Greater than or equal
    LTE = 'LTE', // Less than or equal
    EQ = 'EQ'    // Equal
}

export enum WinnerType {
    FIRST_X = 'FIRST_X',
    TOP_X_IN_DURATION = 'TOP_X_IN_DURATION'
}

export enum PrizeDistribution {
    EQUAL = 'EQUAL',
    TIERED = 'TIERED'
}

/**
 * Challenge Condition Interface
 */
export interface IChallengeCondition {
    type: ChallengeConditionType;
    count?: number;                    // X times for WIN/LOSE/WAGER_X_IN_ROW
    multiplierCondition?: {
        operator: ConditionOperator;
        value: number;
    };
    winChanceCondition?: {
        operator: ConditionOperator;
        value: number;                   // Win percent
    };
    targetMultiplier?: number;         // For HIT_MULTIPLIER type
}

/**
 * Challenge Participant
 */
export interface IChallengeParticipant {
    userId: Types.ObjectId;
    progress: number;                  // Current progress toward condition
    completedAt?: Date;
    qualifyingBets: Types.ObjectId[];  // Bets that count toward challenge
}

/**
 * Challenge Interface
 */
export interface IChallenge extends Document {
    // Basic Info
    title: string;
    description: string;
    image?: string;                    // Challenge banner image URL

    // Step 1: Games
    games: string[];                   // GameType[] - single or multiple games

    // Step 2: Minimum Bet
    minBetAmount: number;
    currency: string;

    // Step 3: Conditions
    conditions: IChallengeCondition[];

    // Prize
    prize: {
        type: 'FIXED' | 'POOL';
        amount: number;
        currency: string;
        distribution?: PrizeDistribution;
    };

    // Winners
    winners: {
        type: WinnerType;
        count: number;                   // First X or Top X
        duration?: number;               // Hours (for TOP_X_IN_DURATION)
    };

    // Schedule
    startTime: Date;
    endTime: Date;

    // Status
    status: ChallengeStatus;

    // Participants tracking
    participants: IChallengeParticipant[];
    completedBy: Types.ObjectId[];     // Users who completed

    // Admin tracking
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Challenge Schema
 */
const challengeConditionSchema = new Schema({
    type: { type: String, enum: Object.values(ChallengeConditionType), required: true },
    count: { type: Number },
    multiplierCondition: {
        operator: { type: String, enum: Object.values(ConditionOperator) },
        value: { type: Number }
    },
    winChanceCondition: {
        operator: { type: String, enum: Object.values(ConditionOperator) },
        value: { type: Number }
    },
    targetMultiplier: { type: Number }
}, { _id: false });

const challengeParticipantSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    progress: { type: Number, default: 0 },
    completedAt: { type: Date },
    qualifyingBets: [{ type: Schema.Types.ObjectId, ref: 'Bet' }]
}, { _id: false });

const challengeSchema = new Schema<IChallenge>({
    // Basic Info
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },

    // Step 1: Games
    games: [{ type: String, enum: Object.values(GameType), required: true }],

    // Step 2: Minimum Bet
    minBetAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'USD' },

    // Step 3: Conditions
    conditions: { type: [challengeConditionSchema], required: true },

    // Prize
    prize: {
        type: { type: String, enum: ['FIXED', 'POOL'], required: true },
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true },
        distribution: { type: String, enum: Object.values(PrizeDistribution) }
    },

    // Winners
    winners: {
        type: { type: String, enum: Object.values(WinnerType), required: true },
        count: { type: Number, required: true, min: 1 },
        duration: { type: Number }  // Hours
    },

    // Schedule
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    // Status
    status: {
        type: String,
        enum: Object.values(ChallengeStatus),
        default: ChallengeStatus.DRAFT,
        index: true
    },

    // Participants tracking
    participants: { type: [challengeParticipantSchema], default: [] },
    completedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // Admin tracking
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
challengeSchema.index({ status: 1, startTime: 1 });
challengeSchema.index({ status: 1, endTime: 1 });
challengeSchema.index({ games: 1 });
challengeSchema.index({ 'participants.userId': 1 });
challengeSchema.index({ createdAt: -1 });

export const Challenge = model<IChallenge>('Challenge', challengeSchema);
