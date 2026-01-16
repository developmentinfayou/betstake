'use client';

import { useState } from 'react';
import BetAmountSlider from './BetAmountSlider';

export interface AutoBetConfig {
  numberOfBets: number;
  onWin: {
    action: 'reset' | 'increase';
    value?: number;
  };
  onLoss: {
    action: 'reset' | 'increase';
    value?: number;
  };
  stopOnProfit?: number;
  stopOnLoss?: number;
}

interface AutoBetControlsProps {
  amount: number;
  balance: number;
  onAmountChange: (amount: number) => void;
  onStart: (config: AutoBetConfig) => void;
  onStop: () => void;
  isActive: boolean;
  disabled?: boolean;
}

export default function AutoBetControls({ amount, balance, onAmountChange, onStart, onStop, isActive, disabled }: AutoBetControlsProps) {
  const [numberOfBets, setNumberOfBets] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [onWinAction, setOnWinAction] = useState<'reset' | 'increase'>('reset');
  const [onWinValue, setOnWinValue] = useState(0);
  const [onLossAction, setOnLossAction] = useState<'reset' | 'increase'>('reset');
  const [onLossValue, setOnLossValue] = useState(0);
  const [stopOnProfit, setStopOnProfit] = useState<number>(0);
  const [stopOnLoss, setStopOnLoss] = useState<number>(0);

  const handleStart = () => {
    const config: AutoBetConfig = {
      enabled: true,
      numberOfBets,
      onWin: {
        reset: onWinAction === 'reset',
        increaseBy: onWinAction === 'increase' ? onWinValue : undefined,
      },
      onLoss: {
        reset: onLossAction === 'reset',
        increaseBy: onLossAction === 'increase' ? onLossValue : undefined,
      },
      stopOnProfit: showAdvanced && stopOnProfit > 0 ? stopOnProfit : undefined,
      stopOnLoss: showAdvanced && stopOnLoss > 0 ? stopOnLoss : undefined,
    };
    
    onStart(config);
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Auto Bet</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
            className="input w-full mb-3"
            min="0"
            step="0.01"
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
          <label className="block text-sm text-gray-400 mb-2">Number of Games</label>
          <div className="relative">
            <input
              type="number"
              value={numberOfBets}
              onChange={(e) => setNumberOfBets(parseInt(e.target.value) || 0)}
              className="input w-full pr-10"
              min="0"
              disabled={disabled || isActive}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">∞</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-400">Advanced</label>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={disabled || isActive}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showAdvanced ? 'bg-green-500' : 'bg-gray-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showAdvanced ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {showAdvanced && (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-2">On Win</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOnWinAction('reset')}
                  disabled={disabled || isActive}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${onWinAction === 'reset' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Reset
                </button>
                <button
                  onClick={() => setOnWinAction('increase')}
                  disabled={disabled || isActive}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${onWinAction === 'increase' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Increase by:
                </button>
                {onWinAction === 'increase' && (
                  <>
                    <input
                      type="number"
                      value={onWinValue}
                      onChange={(e) => setOnWinValue(parseFloat(e.target.value) || 0)}
                      className="input w-20"
                      disabled={disabled || isActive}
                    />
                    <span className="flex items-center text-gray-400">%</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">On Loss</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOnLossAction('reset')}
                  disabled={disabled || isActive}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${onLossAction === 'reset' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Reset
                </button>
                <button
                  onClick={() => setOnLossAction('increase')}
                  disabled={disabled || isActive}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${onLossAction === 'increase' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Increase by:
                </button>
                {onLossAction === 'increase' && (
                  <>
                    <input
                      type="number"
                      value={onLossValue}
                      onChange={(e) => setOnLossValue(parseFloat(e.target.value) || 0)}
                      className="input w-20"
                      disabled={disabled || isActive}
                    />
                    <span className="flex items-center text-gray-400">%</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Stop on Net Gain</label>
              <input
                type="number"
                value={stopOnProfit}
                onChange={(e) => setStopOnProfit(parseFloat(e.target.value) || 0)}
                className="input w-full"
                step="0.00000001"
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
                step="0.00000001"
                disabled={disabled || isActive}
              />
            </div>
          </>
        )}

        {isActive ? (
          <button onClick={onStop} className="btn-secondary w-full py-3 text-lg">
            Stop Autoplay
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={disabled}
            className="btn-primary w-full py-3 text-lg disabled:opacity-50"
          >
            Start Autoplay
          </button>
        )}
      </div>
    </div>
  );
}
