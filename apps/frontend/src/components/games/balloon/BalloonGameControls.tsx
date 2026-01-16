'use client';

import { useState, useEffect } from 'react';

export type BalloonDifficulty = 'simple' | 'easy' | 'medium' | 'hard' | 'expert';
export type BalloonPumpMode = 'random' | 'specific' | 'custom';

export interface BalloonGameParams {
  difficulty: BalloonDifficulty;
  pumpMode: BalloonPumpMode;
  targetMultiplier: number;
  targetPumps: number;
}

interface BalloonGameControlsProps {
  onChange: (params: BalloonGameParams) => void;
  disabled?: boolean;
}

export default function BalloonGameControls({ onChange, disabled = false }: BalloonGameControlsProps) {
  const [difficulty, setDifficulty] = useState<BalloonDifficulty>('medium');
  const [pumpMode, setPumpMode] = useState<BalloonPumpMode>('custom');
  const [targetMultiplier, setTargetMultiplier] = useState(1.5);
  const [targetPumps, setTargetPumps] = useState(5);

  const maxMultipliers = {
    simple: 2.0,
    easy: 2.6,
    medium: 3.5,
    hard: 4.0,
    expert: 5.0,
  };

  const maxPumps = {
    simple: 10,
    easy: 20,
    medium: 50,
    hard: 100,
    expert: 200,
  };

  useEffect(() => {
    onChange({ difficulty, pumpMode, targetMultiplier, targetPumps });
  }, [difficulty, pumpMode, targetMultiplier, targetPumps, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-3">Difficulty</label>
        <div className="grid grid-cols-3 gap-2">
          {(['simple', 'easy', 'medium', 'hard', 'expert'] as BalloonDifficulty[]).map(d => (
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
        <label className="block text-sm text-gray-400 mb-3">Pump Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {(['random', 'specific', 'custom'] as BalloonPumpMode[]).map(m => (
            <button
              key={m}
              onClick={() => setPumpMode(m)}
              disabled={disabled}
              className={`py-3 rounded-lg font-bold capitalize transition-all ${
                pumpMode === m ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
              } disabled:opacity-50`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {pumpMode === 'custom' && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Target Multiplier</label>
          <input
            type="number"
            value={targetMultiplier}
            onChange={(e) => setTargetMultiplier(Math.max(1, Math.min(maxMultipliers[difficulty], Number(e.target.value))))}
            className="input w-full"
            min="1"
            max={maxMultipliers[difficulty]}
            step="0.1"
            disabled={disabled}
          />
          <div className="text-xs text-gray-500 mt-1">
            Max: {maxMultipliers[difficulty]}x
          </div>
        </div>
      )}

      {pumpMode === 'specific' && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Target Pumps</label>
          <input
            type="number"
            value={targetPumps}
            onChange={(e) => setTargetPumps(Math.max(1, Math.min(maxPumps[difficulty], Number(e.target.value))))}
            className="input w-full"
            min="1"
            max={maxPumps[difficulty]}
            disabled={disabled}
          />
          <div className="text-xs text-gray-500 mt-1">
            Max: {maxPumps[difficulty]} pumps
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm text-gray-400">Max Multiplier</div>
          <div className="text-2xl font-bold text-primary">
            {maxMultipliers[difficulty]}x
          </div>
        </div>
      </div>
    </div>
  );
}
