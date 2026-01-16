'use client';

import { useState, useEffect } from 'react';

export type SoloCrashMode = 'quick' | 'custom';

export interface SoloCrashGameParams {
  mode: SoloCrashMode;
  targetMultiplier: number;
}

interface SoloCrashGameControlsProps {
  onChange: (params: SoloCrashGameParams) => void;
  disabled?: boolean;
}

export default function SoloCrashGameControls({ onChange, disabled = false }: SoloCrashGameControlsProps) {
  const [mode, setMode] = useState<SoloCrashMode>('quick');
  const [targetMultiplier, setTargetMultiplier] = useState(2.0);

  useEffect(() => {
    onChange({ mode, targetMultiplier });
  }, [mode, targetMultiplier, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-3">Mode</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode('quick')}
            disabled={disabled}
            className={`py-4 rounded-lg font-bold transition-all ${
              mode === 'quick' ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            ⚡ Quick Rise
          </button>
          <button
            onClick={() => setMode('custom')}
            disabled={disabled}
            className={`py-4 rounded-lg font-bold transition-all ${
              mode === 'custom' ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            🎯 Custom Rise
          </button>
        </div>
      </div>

      {mode === 'custom' && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Target Multiplier</label>
          <input
            type="number"
            value={targetMultiplier}
            onChange={(e) => setTargetMultiplier(Number(e.target.value))}
            className="input w-full"
            min="1.01"
            max="1000"
            step="0.01"
            disabled={disabled}
          />
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm text-gray-400">Target</div>
          <div className="text-3xl font-bold text-primary">
            {mode === 'quick' ? '2.00x' : `${targetMultiplier.toFixed(2)}x`}
          </div>
        </div>
      </div>
    </div>
  );
}
