import { useState, useEffect } from 'react';
import ConditionBlock, { StrategyConditionBlock } from './ConditionBlock';

interface AdvancedBetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, conditions: StrategyConditionBlock[], isPublic: boolean) => void;
    editStrategy?: { name: string; conditions: StrategyConditionBlock[]; isPublic?: boolean } | null;
}

function generateId() {
    return 'c_' + Math.random().toString(36).substring(2, 9);
}

function createDefaultCondition(): StrategyConditionBlock {
    return {
        id: generateId(),
        type: 'bet',
        betTrigger: { frequency: 'every', value: 1, target: 'wins' },
        action: 'increase_bet_amount',
        actionValue: 0,
    };
}

export default function AdvancedBetModal({ isOpen, onClose, onSave, editStrategy }: AdvancedBetModalProps) {
    const [name, setName] = useState('');
    const [conditions, setConditions] = useState<StrategyConditionBlock[]>([createDefaultCondition()]);
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        if (editStrategy) {
            setName(editStrategy.name);
            setConditions(editStrategy.conditions.length > 0 ? editStrategy.conditions : [createDefaultCondition()]);
            setIsPublic(editStrategy.isPublic || false);
        } else {
            setName('');
            setConditions([createDefaultCondition()]);
            setIsPublic(false);
        }
    }, [editStrategy, isOpen]);

    const handleConditionChange = (index: number, updated: StrategyConditionBlock) => {
        const newConditions = [...conditions];
        newConditions[index] = updated;
        setConditions(newConditions);
    };

    const handleDeleteCondition = (index: number) => {
        if (conditions.length <= 1) return; // Must have at least 1
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const handleAddCondition = () => {
        setConditions([...conditions, createDefaultCondition()]);
    };

    const handleSave = () => {
        if (!name.trim()) return;
        if (conditions.length === 0) return;
        onSave(name.trim(), conditions, isPublic);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f1923] rounded-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col border border-gray-700/50 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                    <h2 className="text-lg font-bold text-white">Advanced Bet</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body - scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Strategy Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">
                            Strategy Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Strategy Name"
                            className="input w-full"
                        />
                    </div>

                    {/* Conditions */}
                    <div className="space-y-3">
                        {conditions.map((condition, index) => (
                            <ConditionBlock
                                key={condition.id}
                                condition={condition}
                                index={index}
                                onChange={(updated) => handleConditionChange(index, updated)}
                                onDelete={() => handleDeleteCondition(index)}
                            />
                        ))}
                    </div>

                    {/* Add Condition */}
                    <button
                        onClick={handleAddCondition}
                        className="w-full py-2.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] border border-gray-700/50 text-emerald-400 font-bold text-sm transition-colors"
                    >
                        Add Condition
                    </button>

                    {/* Make Public Toggle */}
                    <div className="flex items-center justify-between bg-[#1a2c38] rounded-lg p-3 border border-gray-700/50">
                        <div>
                            <p className="text-sm font-medium text-white">Make Public</p>
                            <p className="text-xs text-gray-400">Other users can use this strategy. You earn 💎20 per use.</p>
                        </div>
                        <button
                            onClick={() => setIsPublic(!isPublic)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-cyan-500' : 'bg-gray-600'
                                }`}
                        >
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isPublic ? 'left-[26px]' : 'left-0.5'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700/50">
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || conditions.length === 0}
                        className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {editStrategy ? 'Save' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}
