import { Schema, model, Document, Types } from 'mongoose';

/**
 * Admin Activity Log - High-level audit logging for casino platform
 * Required for money-related operations per client requirements
 */
export enum AdminAction {
    // User Management
    USER_BAN = 'USER_BAN',
    USER_UNBAN = 'USER_UNBAN',
    USER_ROLE_CHANGE = 'USER_ROLE_CHANGE',
    USER_BALANCE_ADJUST = 'USER_BALANCE_ADJUST',
    BAN_USER = 'BAN_USER',
    UNBAN_USER = 'UNBAN_USER',
    BALANCE_ADJUST = 'BALANCE_ADJUST',

    // Game Management
    GAME_CONFIG_UPDATE = 'GAME_CONFIG_UPDATE',
    GAME_ENABLE = 'GAME_ENABLE',
    GAME_DISABLE = 'GAME_DISABLE',

    // Jackpot Management
    JACKPOT_CONFIG_UPDATE = 'JACKPOT_CONFIG_UPDATE',
    JACKPOT_MANUAL_TRIGGER = 'JACKPOT_MANUAL_TRIGGER',
    JACKPOT_AMOUNT_ADJUST = 'JACKPOT_AMOUNT_ADJUST',

    // Challenge Management
    CHALLENGE_CREATE = 'CHALLENGE_CREATE',
    CHALLENGE_UPDATE = 'CHALLENGE_UPDATE',
    CHALLENGE_DELETE = 'CHALLENGE_DELETE',
    CHALLENGE_ACTIVATE = 'CHALLENGE_ACTIVATE',
    CHALLENGE_CANCEL = 'CHALLENGE_CANCEL',
    CHALLENGE_PAYOUT = 'CHALLENGE_PAYOUT',

    // Contest Management
    CONTEST_CREATE = 'CONTEST_CREATE',
    CONTEST_UPDATE = 'CONTEST_UPDATE',
    CONTEST_DELETE = 'CONTEST_DELETE',

    // Settings Management
    PLATFORM_SETTINGS_UPDATE = 'PLATFORM_SETTINGS_UPDATE',
    RAKEBACK_CONFIG_UPDATE = 'RAKEBACK_CONFIG_UPDATE',
    UPDATE_PLATFORM_SETTINGS = 'UPDATE_PLATFORM_SETTINGS',
    RESET_PLATFORM_SETTINGS = 'RESET_PLATFORM_SETTINGS',
    ENABLE_MAINTENANCE = 'ENABLE_MAINTENANCE',
    DISABLE_MAINTENANCE = 'DISABLE_MAINTENANCE',
    UPDATE_RAKEBACK_CONFIG = 'UPDATE_RAKEBACK_CONFIG',

    // Rakeback Management
    APPROVE_RAKEBACK = 'APPROVE_RAKEBACK',

    // Reports
    EXPORT_REPORT = 'EXPORT_REPORT',

    // Other
    ADMIN_LOGIN = 'ADMIN_LOGIN',
    ADMIN_LOGOUT = 'ADMIN_LOGOUT'
}

export enum AdminTargetType {
    USER = 'USER',
    GAME = 'GAME',
    JACKPOT = 'JACKPOT',
    CHALLENGE = 'CHALLENGE',
    CONTEST = 'CONTEST',
    SETTINGS = 'SETTINGS',
    SYSTEM = 'SYSTEM',
    RAKEBACK = 'RAKEBACK',
    REPORT = 'REPORT'
}

export interface IAdminActivityLog extends Document {
    timestamp: Date;
    adminId: Types.ObjectId;
    adminUsername: string;           // Denormalized for quick display
    action: AdminAction;
    targetType: AdminTargetType;
    targetId?: string;               // ID of affected entity
    targetName?: string;             // Name/title for display

    // Change details
    previousValue?: any;             // State before change
    newValue?: any;                  // State after change

    // Required for sensitive operations
    reason?: string;

    // Request metadata
    ipAddress: string;
    userAgent?: string;

    createdAt: Date;
}

const adminActivityLogSchema = new Schema<IAdminActivityLog>({
    timestamp: { type: Date, default: Date.now, required: true, index: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    adminUsername: { type: String, required: true },
    action: { type: String, enum: Object.values(AdminAction), required: true, index: true },
    targetType: { type: String, enum: Object.values(AdminTargetType), required: true, index: true },
    targetId: { type: String },
    targetName: { type: String },

    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },

    reason: { type: String },

    ipAddress: { type: String, required: true },
    userAgent: { type: String }
}, { timestamps: true });

// Indexes for efficient querying
adminActivityLogSchema.index({ timestamp: -1 });
adminActivityLogSchema.index({ adminId: 1, timestamp: -1 });
adminActivityLogSchema.index({ action: 1, timestamp: -1 });
adminActivityLogSchema.index({ targetType: 1, targetId: 1, timestamp: -1 });

export const AdminActivityLog = model<IAdminActivityLog>('AdminActivityLog', adminActivityLogSchema);
