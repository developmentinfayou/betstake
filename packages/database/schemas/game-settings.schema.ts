import { Schema, model, Document, Types } from 'mongoose';

/**
 * Game Settings Schema
 * Admin-configurable UI/UX settings for all games
 * Phase 1 MVP: Single currency (USD)
 */

export interface IGameSettings extends Document {
    // Bet Amount Presets (USD for MVP)
    betPresets: number[];

    // Bet Input Controls
    betControls: {
        halfX: boolean;
        doubleX: boolean;
    };

    // Show Profit on Win
    showProfitOnWin: boolean;

    // Live Stats
    liveStats: {
        enabled: boolean;
        defaultOn: boolean;
    };

    // Leaderboard
    leaderboardVisible: boolean;

    // Animations
    animationsDefault: boolean;

    // Sounds
    sounds: {
        defaultOn: boolean;
        defaultVolume: number;   // 0-100
    };

    // Hotkeys
    hotkeys: {
        enabled: boolean;
        perGameKeys: Map<string, any>;  // gameType -> { actionName: keyBinding }
        allowUserModify: boolean;
    };

    // Max Bet
    maxBet: {
        defaultOn: boolean;
        allowUserManualToggle: boolean;
    };

    // Instant Bet
    instantBet: {
        defaultOn: boolean;
        animations: boolean;
        speedMultiplier: number;   // e.g., 2 or 100
    };

    // Auto Bet (per game toggle)
    autoBetEnabled: Map<string, boolean>;

    // Advanced Auto Bet Options (per game toggle)
    advancedAutoBetEnabled: Map<string, boolean>;

    // Audit
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const gameSettingsSchema = new Schema<IGameSettings>({
    betPresets: {
        type: [Number],
        default: [0.1, 1, 5, 10, 50, 100]
    },

    betControls: {
        halfX: { type: Boolean, default: true },
        doubleX: { type: Boolean, default: true }
    },

    showProfitOnWin: { type: Boolean, default: true },

    liveStats: {
        enabled: { type: Boolean, default: true },
        defaultOn: { type: Boolean, default: true }
    },

    leaderboardVisible: { type: Boolean, default: true },

    animationsDefault: { type: Boolean, default: true },

    sounds: {
        defaultOn: { type: Boolean, default: true },
        defaultVolume: { type: Number, default: 50, min: 0, max: 100 }
    },

    hotkeys: {
        enabled: { type: Boolean, default: false },
        perGameKeys: {
            type: Schema.Types.Map,
            of: Schema.Types.Mixed,
            default: new Map()
        },
        allowUserModify: { type: Boolean, default: true }
    },

    maxBet: {
        defaultOn: { type: Boolean, default: true },
        allowUserManualToggle: { type: Boolean, default: true }
    },

    instantBet: {
        defaultOn: { type: Boolean, default: false },
        animations: { type: Boolean, default: true },
        speedMultiplier: { type: Number, default: 2, min: 1, max: 100 }
    },

    autoBetEnabled: {
        type: Schema.Types.Map,
        of: Boolean,
        default: new Map()
    },

    advancedAutoBetEnabled: {
        type: Schema.Types.Map,
        of: Boolean,
        default: new Map()
    },

    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const GameSettings = model<IGameSettings>('GameSettings', gameSettingsSchema);

// Default settings factory
export const DEFAULT_GAME_SETTINGS = {
    betPresets: [0.1, 1, 5, 10, 50, 100],
    betControls: { halfX: true, doubleX: true },
    showProfitOnWin: true,
    liveStats: { enabled: true, defaultOn: true },
    leaderboardVisible: true,
    animationsDefault: true,
    sounds: { defaultOn: true, defaultVolume: 50 },
    hotkeys: { enabled: false, perGameKeys: {}, allowUserModify: true },
    maxBet: { defaultOn: true, allowUserManualToggle: true },
    instantBet: { defaultOn: false, animations: true, speedMultiplier: 2 },
    autoBetEnabled: {},
    advancedAutoBetEnabled: {}
};
