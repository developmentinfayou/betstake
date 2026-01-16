'use client';

import { useState, useEffect } from 'react';
import { AutoBetConfig } from '@/components/betting/AutoBetControls';
import BetAmountSlider from './BetAmountSlider';

interface Strategy {
  id: string;
  name: string;
  description: string;
}

interface StrategySelectorProps {
  amount: number;
  balance: number;
  onAmountChange: (amount: number) => void;
  onStart: (config: AutoBetConfig) => void;
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
  disabled = false
}: StrategySelectorProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [numberOfBets, setNumberOfBets] = useState(10);
  const [stopOnProfit, setStopOnProfit] = useState(0);
  const [stopOnLoss, setStopOnLoss] = useState(0);

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      const response = await fetch('/api/strategy/defaults');
      const data = await response.json();
      setStrategies(data.strategies || []);
    } catch (error) {
      console.error('Failed to load strategies');
    }
  };

  const handleStart = () => {
    if (!selectedStrategy) return;

    const config: AutoBetConfig = {
      enabled: true,
      numberOfBets,
      onWin: { reset: true }, // Will be overridden by strategy
      onLoss: { reset: true }, // Will be overridden by strategy
      stopOnProfit: stopOnProfit > 0 ? stopOnProfit : undefined,
      stopOnLoss: stopOnLoss > 0 ? stopOnLoss : undefined,
    };

    // Apply strategy - this would need API call to get strategy config
    onStart(config);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
          className="input w-full mb-3"
          disabled={disabled || isActive}
        />
        <div className="mb-3">
          <BetAmountSlider
            value={amount}
            min={0.01}
            max={balance || 100}
            onChange={onAmountChange}
            disabled={disabled || isActive}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => onAmountChange(amount / 2)} disabled={disabled || isActive} className="btn-secondary py-2">½×</button>
          <button onClick={() => onAmountChange(amount * 2)} disabled={disabled || isActive} className="btn-secondary py-2">2×</button>
          <button onClick={() => onAmountChange(balance)} disabled={disabled || isActive} className="btn-secondary py-2">Max</button>
          <button onClick={() => onAmountChange(10)} disabled={disabled || isActive} className="btn-secondary py-2">Reset</button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Strategy</label>
        <select
          value={selectedStrategy}
          onChange={(e) => setSelectedStrategy(e.target.value)}
          className="input w-full"
          disabled={disabled || isActive}
        >
          <option value="">Select Strategy</option>
          {strategies.map(strategy => (
            <option key={strategy.id} value={strategy.id}>
              {strategy.name}
            </option>
          ))}
        </select>
        {selectedStrategy && (
          <div className="text-xs text-gray-500 mt-1">
            {strategies.find(s => s.id === selectedStrategy)?.description}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Number of Bets</label>
        <input
          type="number"
          value={numberOfBets}
          onChange={(e) => setNumberOfBets(parseInt(e.target.value) || 0)}
          className="input w-full"
          disabled={disabled || isActive}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Stop on Profit</label>
        <input
          type="number"
          value={stopOnProfit}
          onChange={(e) => setStopOnProfit(parseFloat(e.target.value) || 0)}
          className="input w-full"
          step="0.01"
          disabled={disabled || isActive}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Stop on Loss</label>
        <input
          type="number"
          value={stopOnLoss}
          onChange={(e) => setStopOnLoss(parseFloat(e.target.value) || 0)}
          className="input w-full"
          step="0.01"
          disabled={disabled || isActive}
        />
      </div>

      {isActive ? (
        <button onClick={onStop} className="btn-secondary w-full py-3 text-lg">
          Stop Strategy
        </button>
      ) : (
        <button
          onClick={handleStart}
          disabled={disabled || !selectedStrategy}
          className="btn-primary w-full py-3 text-lg disabled:opacity-50"
        >
          Start Strategy
        </button>
      )}
    </div>
  );
}