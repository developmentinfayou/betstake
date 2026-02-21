'use client';

import { useState } from 'react';

// Types matching the shared package
interface StrategyConditionBlock {
    id: string;
    type: 'bet' | 'profit';
    betTrigger?: {
        frequency: 'every' | 'every_streak_of' | 'first_streak_of' | 'streak_greater_than' | 'streak_lower_than';
        value: number;
        target: 'wins' | 'losses' | 'bets';
    };
    profitTrigger?: {
        source: 'balance' | 'loss' | 'profit';
        operator: 'greater_than' | 'greater_than_or_equal' | 'less_than' | 'less_than_or_equal';
        value: number;
    };
    action: string;
    actionValue?: number;
}

const FREQUENCY_OPTIONS = [
    { value: 'every', label: 'Every' },
    { value: 'every_streak_of', label: 'Every streak of' },
    { value: 'first_streak_of', label: 'First streak of' },
    { value: 'streak_greater_than', label: 'Streak greater than' },
    { value: 'streak_lower_than', label: 'Streak lower than' },
];

const ACTION_OPTIONS = [
    { value: 'increase_bet_amount', label: 'Increase bet amount', hasValue: true },
    { value: 'decrease_bet_amount', label: 'Decrease bet amount', hasValue: true },
    { value: 'add_to_bet_amount', label: 'Add to bet amount', hasValue: true },
    { value: 'subtract_from_bet_amount', label: 'Subtract from bet amount', hasValue: true },
    { value: 'set_bet_amount', label: 'Set bet amount', hasValue: true },
    { value: 'reset_bet_amount', label: 'Reset bet amount', hasValue: false },
    { value: 'stop_autobet', label: 'Stop autobet', hasValue: false },
];

const PROFIT_SOURCE_OPTIONS = [
    { value: 'balance', label: 'Balance' },
    { value: 'loss', label: 'Loss' },
    { value: 'profit', label: 'Profit' },
];

const PROFIT_OP_OPTIONS = [
    { value: 'greater_than', label: '>' },
    { value: 'greater_than_or_equal', label: '>=' },
    { value: 'less_than', label: '<' },
    { value: 'less_than_or_equal', label: '<=' },
];

interface ConditionBlockProps {
    condition: StrategyConditionBlock;
    index: number;
    onChange: (condition: StrategyConditionBlock) => void;
    onDelete: () => void;
    disabled?: boolean;
}

export default function ConditionBlock({ condition, index, onChange, onDelete, disabled }: ConditionBlockProps) {
    const selectedAction = ACTION_OPTIONS.find(a => a.value === condition.action);

    const updateType = (type: 'bet' | 'profit') => {
        const updated: StrategyConditionBlock = { ...condition, type };
        if (type === 'bet' && !updated.betTrigger) {
            updated.betTrigger = { frequency: 'every', value: 1, target: 'wins' };
            delete updated.profitTrigger;
        }
        if (type === 'profit' && !updated.profitTrigger) {
            updated.profitTrigger = { source: 'balance', operator: 'greater_than', value: 0 };
            delete updated.betTrigger;
        }
        onChange(updated);
    };

    return (
        <div className="bg-[#1a2c38] rounded-lg p-4 border border-gray-700/50">
            {/* Header */}
            <div className="text-sm font-semibold text-gray-300 mb-3">
                Condition {index + 1}
            </div>

            {/* Type Toggle */}
            <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer" onClick={() => !disabled && updateType('bet')}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${condition.type === 'bet' ? 'border-emerald-500' : 'border-gray-500'
                        }`}>
                        {condition.type === 'bet' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                    </div>
                    <span className="text-sm font-medium">Bet Condition</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer ml-auto" onClick={() => !disabled && updateType('profit')}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${condition.type === 'profit' ? 'border-emerald-500' : 'border-gray-500'
                        }`}>
                        {condition.type === 'profit' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                    </div>
                    <span className="text-sm font-medium">Profit Condition</span>
                </label>
            </div>

            {/* Trigger Section */}
            <div className="mb-3">
                <div className="text-xs text-gray-400 mb-2">On</div>

                {condition.type === 'bet' ? (
                    <div className="flex gap-2">
                        <select
                            value={condition.betTrigger?.frequency || 'every'}
                            onChange={(e) => onChange({
                                ...condition,
                                betTrigger: { ...condition.betTrigger!, frequency: e.target.value as any },
                            })}
                            className="input flex-1 text-sm py-2"
                            disabled={disabled}
                        >
                            {FREQUENCY_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={condition.betTrigger?.value || 1}
                            onChange={(e) => onChange({
                                ...condition,
                                betTrigger: { ...condition.betTrigger!, value: parseInt(e.target.value) || 1 },
                            })}
                            className="input w-16 text-sm py-2 text-center"
                            min={1}
                            disabled={disabled}
                        />
                        <select
                            value={condition.betTrigger?.target || 'wins'}
                            onChange={(e) => onChange({
                                ...condition,
                                betTrigger: { ...condition.betTrigger!, target: e.target.value as 'wins' | 'losses' | 'bets' },
                            })}
                            className="input flex-1 text-sm py-2"
                            disabled={disabled}
                        >
                            <option value="wins">Wins</option>
                            <option value="losses">Losses</option>
                            <option value="bets">Bets</option>
                        </select>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <select
                            value={condition.profitTrigger?.source || 'balance'}
                            onChange={(e) => onChange({
                                ...condition,
                                profitTrigger: { ...condition.profitTrigger!, source: e.target.value as any },
                            })}
                            className="input flex-1 text-sm py-2"
                            disabled={disabled}
                        >
                            {PROFIT_SOURCE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <select
                            value={condition.profitTrigger?.operator || 'greater_than'}
                            onChange={(e) => onChange({
                                ...condition,
                                profitTrigger: { ...condition.profitTrigger!, operator: e.target.value as any },
                            })}
                            className="input flex-1 text-sm py-2"
                            disabled={disabled}
                        >
                            {PROFIT_OP_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-1">
                            <span className="text-orange-400 text-sm">💰</span>
                            <input
                                type="number"
                                value={condition.profitTrigger?.value || 0}
                                onChange={(e) => onChange({
                                    ...condition,
                                    profitTrigger: { ...condition.profitTrigger!, value: parseFloat(e.target.value) || 0 },
                                })}
                                className="input w-20 text-sm py-2 text-center"
                                step="0.01"
                                disabled={disabled}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Action Section */}
            <div className="mb-3">
                <div className="text-xs text-gray-400 mb-2">Do</div>
                <div className="flex gap-2">
                    <select
                        value={condition.action}
                        onChange={(e) => onChange({ ...condition, action: e.target.value })}
                        className="input flex-1 text-sm py-2"
                        disabled={disabled}
                    >
                        {ACTION_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {selectedAction?.hasValue && (
                        <input
                            type="number"
                            value={condition.actionValue || 0}
                            onChange={(e) => onChange({ ...condition, actionValue: parseFloat(e.target.value) || 0 })}
                            className="input w-24 text-sm py-2 text-center"
                            step="0.01"
                            disabled={disabled}
                        />
                    )}
                </div>
            </div>

            {/* Delete Button */}
            <button
                onClick={onDelete}
                className="text-sm text-gray-500 hover:text-red-400 transition-colors w-full text-center"
                disabled={disabled}
            >
                Delete
            </button>
        </div>
    );
}

export type { StrategyConditionBlock };
