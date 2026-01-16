'use client';

import { useState, useEffect } from 'react';

export interface LimboGameParams {
  targetMultiplier: number;
  winChance: number;
  payout: number;
}

interface Props {
  onChange: (params: LimboGameParams) => void;
  disabled?: boolean;
  amount: number;
}

export default function LimboGameControls({ onChange, disabled, amount }: Props) {
  const [targetMultiplier, setTargetMultiplier] = useState(2.00);

  useEffect(() => {
    const houseEdge = 1;
    const winChance = ((100 - houseEdge) / targetMultiplier);
    const payout = amount * targetMultiplier;

    onChange({
      targetMultiplier,
      winChance,
      payout,
    });
  }, [targetMultiplier, amount, onChange]);

  const adjustMultiplier = (delta: number) => {
    const newValue = Math.max(1.01, Math.min(1000, targetMultiplier + delta));
    setTargetMultiplier(parseFloat(newValue.toFixed(2)));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Target Multiplier</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustMultiplier(-0.1)}
            disabled={disabled || targetMultiplier <= 1.01}
            className="btn-secondary px-3 py-2"
          >
            -
          </button>
          <input
            type="number"
            value={targetMultiplier}
            onChange={(e) => setTargetMultiplier(parseFloat(e.target.value) || 1.01)}
            disabled={disabled}
            step="0.01"
            min="1.01"
            max="1000"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-center text-xl font-bold"
          />
          <button
            onClick={() => adjustMultiplier(0.1)}
            disabled={disabled || targetMultiplier >= 1000}
            className="btn-secondary px-3 py-2"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded p-3">
          <div className="text-sm text-gray-400">Win Chance</div>
          <div className="text-xl font-bold text-primary">
            {((100 - 1) / targetMultiplier).toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="text-sm text-gray-400">Payout</div>
          <div className="text-xl font-bold text-green-500">
            ${(amount * targetMultiplier).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTargetMultiplier(2.00)} disabled={disabled} className="btn-secondary flex-1">2x</button>
        <button onClick={() => setTargetMultiplier(5.00)} disabled={disabled} className="btn-secondary flex-1">5x</button>
        <button onClick={() => setTargetMultiplier(10.00)} disabled={disabled} className="btn-secondary flex-1">10x</button>
        <button onClick={() => setTargetMultiplier(50.00)} disabled={disabled} className="btn-secondary flex-1">50x</button>
      </div>
    </div>
  );
}
