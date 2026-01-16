'use client';

import { useState } from 'react';

export interface AutoBetConfig {
  enabled: boolean;
  numberOfBets: number;
  onWin: {
    reset: boolean;
    increaseBy?: number;
  };
  onLoss: {
    reset: boolean;
    increaseBy?: number;
  };
  stopOnProfit?: number;
  stopOnLoss?: number;
}

interface AutoBetControlsProps {
  onStart: (config: AutoBetConfig) => void;
  onStop: () => void;
  isActive: boolean;
  disabled?: boolean;
}

const STRATEGY_PRESETS = {
  manual: {
    name: 'Manual',
    onWin: { reset: false },
    onLoss: { reset: false },
  },
  martingale: {
    name: 'Martingale',
    onWin: { reset: true },
    onLoss: { reset: false, increaseBy: 100 },
  },
  reverseMartingale: {
    name: 'Reverse Martingale',
    onWin: { reset: false, increaseBy: 100 },
    onLoss: { reset: true },
  },
  dalembert: {
    name: "D'Alembert",
    onWin: { reset: true },
    onLoss: { reset: false, increaseBy: 10 },
  },
  paroli: {
    name: 'Paroli',
    onWin: { reset: false, increaseBy: 100 },
    onLoss: { reset: true },
  },
};

export default function AutoBetControls({ onStart, onStop, isActive, disabled }: AutoBetControlsProps) {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [numberOfBets, setNumberOfBets] = useState(0);
  const [strategy, setStrategy] = useState<keyof typeof STRATEGY_PRESETS>('manual');
  
  const [onWinAction, setOnWinAction] = useState<'reset' | 'increase'>('reset');
  const [onWinPercent, setOnWinPercent] = useState(100);
  
  const [onLossAction, setOnLossAction] = useState<'reset' | 'increase'>('reset');
  const [onLossPercent, setOnLossPercent] = useState(100);
  
  const [stopOnProfit, setStopOnProfit] = useState<number | undefined>();
  const [stopOnLoss, setStopOnLoss] = useState<number | undefined>();

  const applyPreset = (presetKey: keyof typeof STRATEGY_PRESETS) => {
    const preset = STRATEGY_PRESETS[presetKey];
    setStrategy(presetKey);
    
    if (preset.onWin.reset) {
      setOnWinAction('reset');
    } else if (preset.onWin.increaseBy) {
      setOnWinAction('increase');
      setOnWinPercent(preset.onWin.increaseBy);
    }
    
    if (preset.onLoss.reset) {
      setOnLossAction('reset');
    } else if (preset.onLoss.increaseBy) {
      setOnLossAction('increase');
      setOnLossPercent(preset.onLoss.increaseBy);
    }
  };

  const handleStart = () => {
    const config: any = {
      enabled: true,
      numberOfBets,
      onWin: {
        reset: onWinAction === 'reset',
        increaseBy: onWinAction === 'increase' ? onWinPercent : undefined,
      },
      onLoss: {
        reset: onLossAction === 'reset',
        increaseBy: onLossAction === 'increase' ? onLossPercent : undefined,
      },
    };
    
    // Only add stop conditions if they are set
    if (stopOnProfit && stopOnProfit > 0) {
      config.stopOnProfit = stopOnProfit;
    }
    if (stopOnLoss && stopOnLoss > 0) {
      config.stopOnLoss = stopOnLoss;
    }
    
    onStart(config);
  };

  if (mode === 'manual') {
    return (
      <div className="card">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('manual')}
            className="flex-1 py-2 rounded-lg font-bold bg-primary text-white"
          >
            Manual
          </button>
          <button
            onClick={() => setMode('auto')}
            className="flex-1 py-2 rounded-lg font-bold bg-gray-800 hover:bg-gray-700"
          >
            Auto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('manual')}
          className="flex-1 py-2 rounded-lg font-bold bg-gray-800 hover:bg-gray-700"
        >
          Manual
        </button>
        <button
          onClick={() => setMode('auto')}
          className="flex-1 py-2 rounded-lg font-bold bg-primary text-white"
        >
          Auto
        </button>
      </div>

      <div className="space-y-4">
        {/* Strategy Preset */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Strategy Preset</label>
          <select
            value={strategy}
            onChange={(e) => applyPreset(e.target.value as keyof typeof STRATEGY_PRESETS)}
            className="input w-full"
          >
            {Object.entries(STRATEGY_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>{preset.name}</option>
            ))}
          </select>
        </div>

        {/* Number of Bets */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Number of Bets (0 = Infinite)
          </label>
          <input
            type="number"
            value={numberOfBets}
            onChange={(e) => setNumberOfBets(parseInt(e.target.value) || 0)}
            className="input w-full"
            min="0"
          />
        </div>

        {/* On Win */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">On Win</label>
          <div className="flex gap-2">
            <select
              value={onWinAction}
              onChange={(e) => setOnWinAction(e.target.value as any)}
              className="input flex-1"
            >
              <option value="reset">Reset</option>
              <option value="increase">Increase %</option>
            </select>
            {onWinAction !== 'reset' && (
              <input
                type="number"
                value={onWinPercent}
                onChange={(e) => setOnWinPercent(parseFloat(e.target.value) || 0)}
                className="input w-24"
                placeholder="%"
              />
            )}
          </div>
        </div>

        {/* On Loss */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">On Loss</label>
          <div className="flex gap-2">
            <select
              value={onLossAction}
              onChange={(e) => setOnLossAction(e.target.value as any)}
              className="input flex-1"
            >
              <option value="reset">Reset</option>
              <option value="increase">Increase %</option>
            </select>
            {onLossAction !== 'reset' && (
              <input
                type="number"
                value={onLossPercent}
                onChange={(e) => setOnLossPercent(parseFloat(e.target.value) || 0)}
                className="input w-24"
                placeholder="%"
              />
            )}
          </div>
        </div>

        {/* Stop Conditions */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Stop on Profit ($)</label>
          <input
            type="number"
            value={stopOnProfit || ''}
            onChange={(e) => setStopOnProfit(parseFloat(e.target.value) || undefined)}
            className="input w-full"
            placeholder="Leave empty for no limit"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Stop on Loss ($)</label>
          <input
            type="number"
            value={stopOnLoss || ''}
            onChange={(e) => setStopOnLoss(parseFloat(e.target.value) || undefined)}
            className="input w-full"
            placeholder="Leave empty for no limit"
          />
        </div>

        {/* Start/Stop Button */}
        {isActive ? (
          <button
            onClick={onStop}
            className="btn-secondary w-full py-3 text-lg"
          >
            Stop Auto-Bet
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={disabled}
            className="btn-primary w-full py-3 text-lg disabled:opacity-50"
          >
            Start Auto-Bet
          </button>
        )}
      </div>
    </div>
  );
}
