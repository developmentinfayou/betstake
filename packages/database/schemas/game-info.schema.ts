import { Schema, model, Document, Types } from 'mongoose';

/**
 * Game Info Schema
 * Per-game content managed by admin: descriptions, rules, how-to-play, videos, icons
 */

export interface IHowToPlayStep {
    stepNumber: number;
    description: string;    // HTML content
    imageUrl?: string;
}

export interface IGameVideo {
    description: string;
    url: string;
    sourceType: 'upload' | 'youtube';
}

export interface IGameInfo extends Document {
    gameType: string;
    description: string;          // HTML content
    rules: string;                // HTML content
    limits?: {
        minBet?: number;
        maxBet?: number;
        maxWin?: number;
    };
    howToPlay: IHowToPlayStep[];
    videos: IGameVideo[];
    gameIcon?: string;            // URL/path to icon
    rankings: {
        defaultTab: string;
        leaderboardDefault: string;
    };
    shareEnabled: boolean;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const howToPlayStepSchema = new Schema({
    stepNumber: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String }
}, { _id: false });

const gameVideoSchema = new Schema({
    description: { type: String, required: true },
    url: { type: String, required: true },
    sourceType: { type: String, enum: ['upload', 'youtube'], default: 'youtube' }
}, { _id: false });

const gameInfoSchema = new Schema<IGameInfo>({
    gameType: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        index: true
    },
    description: { type: String, default: '' },
    rules: { type: String, default: '' },
    limits: {
        minBet: { type: Number },
        maxBet: { type: Number },
        maxWin: { type: Number }
    },
    howToPlay: { type: [howToPlayStepSchema], default: [] },
    videos: { type: [gameVideoSchema], default: [] },
    gameIcon: { type: String },
    rankings: {
        defaultTab: { type: String, default: 'my_bets' },
        leaderboardDefault: { type: String, default: 'wager' }
    },
    shareEnabled: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const GameInfo = model<IGameInfo>('GameInfo', gameInfoSchema);

// Default game info factory
export const DEFAULT_GAME_INFO = {
    description: '',
    rules: '',
    howToPlay: [],
    videos: [],
    rankings: { defaultTab: 'my_bets', leaderboardDefault: 'wager' },
    shareEnabled: true
};
