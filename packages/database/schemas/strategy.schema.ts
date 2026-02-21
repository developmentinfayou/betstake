import { Schema, model, Document, Types } from 'mongoose';
import { StrategyConditionBlock } from '@casino/shared';

export interface IStrategy extends Document {
  userId: string; // 'system' for presets
  name: string;
  conditions: StrategyConditionBlock[];
  isPreset: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conditionBlockSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['bet', 'profit'], required: true },
  betTrigger: {
    frequency: { type: String, enum: ['every', 'every_streak_of', 'first_streak_of', 'streak_greater_than', 'streak_lower_than'] },
    value: { type: Number },
    target: { type: String, enum: ['wins', 'losses', 'bets'] },
  },
  profitTrigger: {
    source: { type: String, enum: ['balance', 'loss', 'profit'] },
    operator: { type: String, enum: ['greater_than', 'greater_than_or_equal', 'less_than', 'less_than_or_equal'] },
    value: { type: Number },
  },
  action: {
    type: String,
    enum: ['increase_bet_amount', 'decrease_bet_amount', 'add_to_bet_amount', 'subtract_from_bet_amount', 'set_bet_amount', 'reset_bet_amount', 'stop_autobet'],
    required: true,
  },
  actionValue: { type: Number },
}, { _id: false });

const strategySchema = new Schema<IStrategy>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  conditions: { type: [conditionBlockSchema], required: true, validate: [(v: any[]) => v.length > 0, 'At least one condition is required'] },
  isPreset: { type: Boolean, default: false, index: true },
}, { timestamps: true });

// Compound index for efficient querying
strategySchema.index({ userId: 1, isPreset: 1 });

export const Strategy = model<IStrategy>('Strategy', strategySchema);
