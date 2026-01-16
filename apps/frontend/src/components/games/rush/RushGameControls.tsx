'use client';

import { useState, useEffect } from 'react';

export type RushDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface RushGameParams {
  difficulty: RushDifficulty;
  targetMultiplier: number;
}

interface RushGameControlsProps {
  onChange: (params: RushGameParams) => void;
  disabled?: boolean;
}

export default function RushGameControls({ onChange, disabled = false }: RushGameControlsProps) {
  const [difficulty, setDifficulty] = useState<RushDifficulty>('medium');
  const [targetMultiplier, setTargetMultiplier] = useState(2.0);

  const ranges = {
    easy: { min: 1.5, max: 5 },
    medium: { min: 1.2, max: 10 },
    hard: { min: 1.1, max: 50 },
    expert: { min: 1.01, max: 100 },
  };

  useEffect(() => {
    const range = ranges[difficulty];
    if (targetMultiplier < range.min) setTargetMultiplier(range.min);
    if (targetMultiplier > range.max) setTargetMultiplier(range.max);
  }, [difficulty]);

  useEffect(() => {
    onChange({ difficulty, targetMultiplier });
  }, [difficulty, targetMultiplier, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-3">Difficulty</label>
        <div className="grid grid-cols-2 gap-2">
          {(['easy', 'medium', 'hard', 'expert'] as RushDifficulty[]).map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              disabled={disabled}
              className={`py-3 rounded-lg font-bold capitalize transition-all ${
                difficulty === d ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
              } disabled:opacity-50`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Target Multiplier</label>
        <input
          type="number"
          value={targetMultiplier}
          onChange={(e) => setTargetMultiplier(Number(e.target.value))}
          className="input w-full"
          min={ranges[difficulty].min}
          max={ranges[difficulty].max}
          step="0.01"
          disabled={disabled}
        />
        <div className="text-xs text-gray-500 mt-1">
          Range: {ranges[difficulty].min}x - {ranges[difficulty].max}x
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-sm text-gray-400">Win Chance</div>
          <div className="text-xl font-bold text-primary">
            {((1 / targetMultiplier) * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-sm text-gray-400">Payout</div>
          <div className="text-xl font-bold text-green-500">
            {(targetMultiplier * 0.99).toFixed(2)}x
          </div>
        </div>
      </div>
    </div>
  );
}
