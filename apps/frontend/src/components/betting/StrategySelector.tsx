import { useState, useEffect, useCallback } from 'react';
import { strategyAPI } from '@/lib/api';
import BetAmountSlider from './BetAmountSlider';
import AdvancedBetModal from './AdvancedBetModal';
import { StrategyConditionBlock } from './ConditionBlock';

interface StrategyFromAPI {
  _id: string;
  name: string;
  conditions: StrategyConditionBlock[];
  isPreset: boolean;
}

interface StrategySelectorProps {
  amount: number;
  balance: number;
  onAmountChange: (amount: number) => void;
  onStart: (config: any) => void;
  onStop: () => void;
  isActive: boolean;
  disabled?: boolean;
}

export default function StrategySelector({
  amount,
  balance,
  onAmountChange,
  onStart,
  onStop,
  isActive,
  disabled = false,
}: StrategySelectorProps) {
  const [strategies, setStrategies] = useState<StrategyFromAPI[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [numberOfBets, setNumberOfBets] = useState(0); // 0 = infinite
  const [activeConditionTab, setActiveConditionTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<StrategyFromAPI | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStrategies = useCallback(async () => {
    try {
      const res = await strategyAPI.getAll();
      const data = res.data?.strategies || [];
      setStrategies(data);
      // Auto-select first strategy if none selected
      if (!selectedStrategyId && data.length > 0) {
        setSelectedStrategyId(data[0]._id);
      }
    } catch (error) {
      console.error('Failed to load strategies:', error);
    }
  }, [selectedStrategyId]);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  const selectedStrategy = strategies.find(s => s._id === selectedStrategyId);

  const handleStart = () => {
    if (!selectedStrategyId || !selectedStrategy) return;

    // Guard: prevent starting with no conditions
    if (selectedStrategy.conditions.length === 0) {
      alert('This strategy has no conditions. Please add at least one condition before starting.');
      return;
    }

    // Strategy mode sends a clean config — no onWin/onLoss (those are Auto mode only).
    // The backend branches on strategyId: if present, uses StrategyEngine; otherwise uses onWin/onLoss.
    const config = {
      enabled: true,
      numberOfBets,
      strategyId: selectedStrategyId,
    };

    onStart(config);
  };

  const handleCreateOrEdit = async (name: string, conditions: StrategyConditionBlock[]) => {
    setLoading(true);
    try {
      if (editingStrategy && !editingStrategy.isPreset) {
        await strategyAPI.update(editingStrategy._id, { name, conditions });
      } else {
        const res = await strategyAPI.create({ name, conditions });
        setSelectedStrategyId(res.data.strategy._id);
      }
      await loadStrategies();
      setModalOpen(false);
      setEditingStrategy(null);
    } catch (error) {
      console.error('Failed to save strategy:', error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedStrategy || selectedStrategy.isPreset) return;
    if (!confirm(`Delete strategy "${selectedStrategy.name}"?`)) return;

    try {
      await strategyAPI.delete(selectedStrategy._id);
      setSelectedStrategyId('');
      await loadStrategies();
    } catch (error) {
      console.error('Failed to delete strategy:', error);
    }
  };

  const handleEdit = () => {
    if (!selectedStrategy) return;
    setEditingStrategy(selectedStrategy);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingStrategy(null);
    setModalOpen(true);
  };

  const isDisabled = disabled || isActive;

  return (
    <>
      <div className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
            className="input w-full mb-3"
            disabled={isDisabled}
          />
          <div className="mb-3">
            <BetAmountSlider
              value={amount}
              min={0.01}
              max={balance || 100}
              onChange={onAmountChange}
              disabled={isDisabled}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => onAmountChange(amount / 2)} disabled={isDisabled} className="btn-secondary py-2 text-sm">½</button>
            <button onClick={() => onAmountChange(amount * 2)} disabled={isDisabled} className="btn-secondary py-2 text-sm">2×</button>
            <button onClick={() => onAmountChange(10)} disabled={isDisabled} className="btn-secondary py-2 text-sm">10</button>
            <button onClick={() => onAmountChange(100)} disabled={isDisabled} className="btn-secondary py-2 text-sm">100</button>
          </div>
        </div>

        {/* Number of Bets */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Number of Bets</label>
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              value={numberOfBets === 0 ? '' : numberOfBets}
              onChange={(e) => setNumberOfBets(parseInt(e.target.value) || 0)}
              placeholder="∞"
              className="input flex-1"
              min={0}
              disabled={isDisabled}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => setNumberOfBets(0)} disabled={isDisabled}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${numberOfBets === 0 ? 'bg-primary text-white' : 'btn-secondary'}`}>
              ∞
            </button>
            <button onClick={() => setNumberOfBets(10)} disabled={isDisabled}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${numberOfBets === 10 ? 'bg-primary text-white' : 'btn-secondary'}`}>
              10
            </button>
            <button onClick={() => setNumberOfBets(100)} disabled={isDisabled}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${numberOfBets === 100 ? 'bg-primary text-white' : 'btn-secondary'}`}>
              100
            </button>
            <button onClick={() => setNumberOfBets(1000)} disabled={isDisabled}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${numberOfBets === 1000 ? 'bg-primary text-white' : 'btn-secondary'}`}>
              1000
            </button>
          </div>
        </div>

        {/* Select Strategy */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Select Strategy</label>
          <select
            value={selectedStrategyId}
            onChange={(e) => {
              setSelectedStrategyId(e.target.value);
              setActiveConditionTab(0);
            }}
            className="input w-full"
            disabled={isDisabled}
          >
            <option value="">Select Strategy</option>
            {strategies.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Conditions Preview */}
        {selectedStrategy && selectedStrategy.conditions.length > 0 && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Conditions</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {selectedStrategy.conditions.map((cond, i) => (
                <button
                  key={cond.id || i}
                  onClick={() => setActiveConditionTab(i)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all relative ${activeConditionTab === i
                    ? 'bg-primary text-white border-2 border-primary'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  {i + 1}
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                </button>
              ))}
            </div>
            {/* Show active condition summary */}
            {selectedStrategy.conditions[activeConditionTab] && (
              <div className="bg-[#1a2c38] rounded-lg p-3 text-xs text-gray-400">
                {formatConditionSummary(selectedStrategy.conditions[activeConditionTab])}
              </div>
            )}
          </div>
        )}

        {/* Create / Delete / Edit */}
        <div className="space-y-2">
          <button
            onClick={handleCreate}
            disabled={isDisabled}
            className="w-full py-2.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] border border-gray-700/50 text-white font-bold text-sm transition-colors disabled:opacity-50"
          >
            Create
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDelete}
              disabled={isDisabled || !selectedStrategy || selectedStrategy.isPreset}
              className="py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Delete
            </button>
            <button
              onClick={handleEdit}
              disabled={isDisabled || !selectedStrategy || selectedStrategy.isPreset}
              className="py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Start / Stop */}
        {isActive ? (
          <button onClick={onStop} className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-lg transition-colors">
            Stop Auto Bet
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isDisabled || !selectedStrategyId || loading}
            className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting...' : 'Start Auto Bet'}
          </button>
        )}
      </div>

      {/* Modal */}
      <AdvancedBetModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingStrategy(null); }}
        onSave={handleCreateOrEdit}
        editStrategy={editingStrategy ? { name: editingStrategy.name, conditions: editingStrategy.conditions } : null}
      />
    </>
  );
}

/** Format a condition block into a readable summary */
function formatConditionSummary(cond: StrategyConditionBlock): string {
  let trigger = '';
  if (cond.type === 'bet' && cond.betTrigger) {
    const freq = cond.betTrigger.frequency.replace(/_/g, ' ');
    trigger = `On ${freq} ${cond.betTrigger.value} ${cond.betTrigger.target}`;
  } else if (cond.type === 'profit' && cond.profitTrigger) {
    const op = cond.profitTrigger.operator.replace(/_/g, ' ');
    trigger = `On ${cond.profitTrigger.source} ${op} ${cond.profitTrigger.value}`;
  }

  const actionLabel = cond.action.replace(/_/g, ' ');
  const value = cond.actionValue !== undefined ? ` ${cond.actionValue}` : '';
  const suffix = cond.action.includes('increase') || cond.action.includes('decrease') ? '%' : '';

  return `${trigger} → ${actionLabel}${value}${suffix}`;
}