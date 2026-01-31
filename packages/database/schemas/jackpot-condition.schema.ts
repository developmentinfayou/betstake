import { Schema, model, Document, Types } from 'mongoose';

/**
 * Game-Specific Jackpot Conditions
 * Per client documentation - each game has unique jackpot trigger conditions
 */

// Condition Types based on client documentation
export enum JackpotConditionType {
    HIT_VALUE = 'HIT_VALUE',           // Roll/Get specific value (e.g., 77.77, 7.77)
    IN_A_ROW = 'IN_A_ROW',             // Same result X times in a row
    WIN_NEXT = 'WIN_NEXT',             // Win next X bets
    LOSE_NEXT = 'LOSE_NEXT',           // Lose next X bets  
    RANDOM_CHANCE = 'RANDOM_CHANCE',   // X% chance every bet
    SAME_TRAJECTORY = 'SAME_TRAJECTORY', // Plinko: same path X times
    HIT_MULTIPLIER = 'HIT_MULTIPLIER', // Hit specific multiplier (Crash, Limbo)
    WIN_COLOR = 'WIN_COLOR',           // FastParity: win specific color X times
    WIN_NUMBER = 'WIN_NUMBER',         // FastParity: win specific number X times
    PUMP_TIMES = 'PUMP_TIMES'          // Balloon: pump X times by difficulty
}

// Winner Identifier for multiplayer games (Crash, FastParity)
export enum JackpotWinnerIdentifier {
    HIGHEST_BETTOR = 'HIGHEST_BETTOR',
    HIGHEST_WINNER = 'HIGHEST_WINNER',
    RANDOM_WINNER = 'RANDOM_WINNER',
    DISTRIBUTE_BY_RATIO = 'DISTRIBUTE_BY_RATIO'
}

export interface IJackpotCondition {
    type: JackpotConditionType;
    enabled: boolean;
    value?: number;           // Target value (e.g., 77.77 for HIT_VALUE)
    count?: number;           // Times required (e.g., 3 for IN_A_ROW)
    inARow?: boolean;         // Whether "in a row" modifier applies
    probability?: number;     // For RANDOM_CHANCE (0-100%)
    color?: string;           // For WIN_COLOR
    number?: number;          // For WIN_NUMBER
    difficulty?: string;      // For PUMP_TIMES (easy/medium/hard)
}

export interface IPayoutTier {
    minBetAmount: number;
    payoutPercent: number;    // Percentage of jackpot to award
}

export interface IJackpotConditionConfig extends Document {
    gameType: string;
    enabled: boolean;
    conditions: IJackpotCondition[];
    payoutTiers: IPayoutTier[];
    winnerIdentifier?: JackpotWinnerIdentifier;  // For multiplayer games
    minBetAmount: Map<string, number>;            // Min bet per currency
    houseEdgeContribution: number;                // % of house edge to jackpot
    createdAt: Date;
    updatedAt: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}

const jackpotConditionSchema = new Schema<IJackpotConditionConfig>({
    gameType: {
        type: String,
        required: true,
        unique: true,
        enum: ['DICE', 'LIMBO', 'PLINKO', 'MINES', 'CRASH', 'FASTPARITY', 'BALLOON',
            'COINFLIP', 'WHEEL', 'ROULETTE', 'KENO', 'HILO', 'BLACKJACK', 'TOWER', 'STAIRS']
    },
    enabled: { type: Boolean, default: true },
    conditions: [{
        type: {
            type: String,
            enum: Object.values(JackpotConditionType),
            required: true
        },
        enabled: { type: Boolean, default: true },
        value: { type: Number },
        count: { type: Number },
        inARow: { type: Boolean, default: false },
        probability: { type: Number },
        color: { type: String },
        number: { type: Number },
        difficulty: { type: String }
    }],
    payoutTiers: [{
        minBetAmount: { type: Number, required: true },
        payoutPercent: { type: Number, required: true, min: 0, max: 100 }
    }],
    winnerIdentifier: {
        type: String,
        enum: Object.values(JackpotWinnerIdentifier)
    },
    minBetAmount: {
        type: Schema.Types.Map,
        of: Number,
        default: new Map([['USD', 1], ['BTC', 0.00001], ['ETH', 0.0001]])
    },
    houseEdgeContribution: { type: Number, default: 10 }, // 10% of house edge
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const JackpotConditionConfig = model<IJackpotConditionConfig>('JackpotConditionConfig', jackpotConditionSchema);

// Default conditions per game based on client documentation
export const DEFAULT_GAME_CONDITIONS: Record<string, IJackpotCondition[]> = {
    DICE: [
        { type: JackpotConditionType.HIT_VALUE, enabled: true, value: 77.77, inARow: false },
        { type: JackpotConditionType.HIT_VALUE, enabled: true, value: 7.77, inARow: true, count: 3 },
        { type: JackpotConditionType.WIN_NEXT, enabled: false, count: 5 },
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: false, probability: 0.01 }
    ],
    LIMBO: [
        { type: JackpotConditionType.HIT_MULTIPLIER, enabled: true, value: 7.77, inARow: false },
        { type: JackpotConditionType.HIT_MULTIPLIER, enabled: true, value: 77.77, inARow: true, count: 2 },
        { type: JackpotConditionType.WIN_NEXT, enabled: false, count: 5 },
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: false, probability: 0.01 }
    ],
    CRASH: [
        { type: JackpotConditionType.HIT_MULTIPLIER, enabled: true, value: 7.77 },
        { type: JackpotConditionType.HIT_MULTIPLIER, enabled: true, value: 77.77 },
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: false, probability: 0.01 }
    ],
    PLINKO: [
        { type: JackpotConditionType.SAME_TRAJECTORY, enabled: true, count: 3 },
        { type: JackpotConditionType.WIN_NEXT, enabled: false, count: 5 },
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: false, probability: 0.01 }
    ],
    MINES: [
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: true, probability: 0.5 },
        { type: JackpotConditionType.WIN_NEXT, enabled: false, count: 3 }
    ],
    FASTPARITY: [
        { type: JackpotConditionType.WIN_COLOR, enabled: true, color: 'green', count: 3 },
        { type: JackpotConditionType.WIN_NUMBER, enabled: true, number: 7, count: 2 },
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: false, probability: 0.01 }
    ],
    BALLOON: [
        { type: JackpotConditionType.HIT_MULTIPLIER, enabled: true, value: 1.77 },
        { type: JackpotConditionType.HIT_MULTIPLIER, enabled: true, value: 7.77 },
        { type: JackpotConditionType.PUMP_TIMES, enabled: false, count: 10, difficulty: 'hard' }
    ],
    COINFLIP: [
        { type: JackpotConditionType.IN_A_ROW, enabled: true, count: 7 },
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: false, probability: 0.01 }
    ],
    WHEEL: [
        { type: JackpotConditionType.IN_A_ROW, enabled: true, count: 3 },
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: false, probability: 0.01 }
    ],
    ROULETTE: [
        { type: JackpotConditionType.IN_A_ROW, enabled: true, count: 3 },
        { type: JackpotConditionType.WIN_COLOR, enabled: true, color: 'green', count: 2 }
    ],
    KENO: [
        { type: JackpotConditionType.IN_A_ROW, enabled: true, count: 5 },
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: false, probability: 0.01 }
    ],
    HILO: [
        { type: JackpotConditionType.IN_A_ROW, enabled: true, count: 7 },
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: false, probability: 0.01 }
    ],
    BLACKJACK: [
        { type: JackpotConditionType.IN_A_ROW, enabled: true, count: 5 },
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: false, probability: 0.01 }
    ],
    TOWER: [
        { type: JackpotConditionType.WIN_NEXT, enabled: true, count: 10 },
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: false, probability: 0.01 }
    ],
    STAIRS: [
        { type: JackpotConditionType.WIN_NEXT, enabled: true, count: 10 },
        { type: JackpotConditionType.RANDOM_CHANCE, enabled: false, probability: 0.01 }
    ]
};

// Default payout tiers
export const DEFAULT_PAYOUT_TIERS: IPayoutTier[] = [
    { minBetAmount: 1, payoutPercent: 50 },
    { minBetAmount: 10, payoutPercent: 75 },
    { minBetAmount: 100, payoutPercent: 100 }
];
