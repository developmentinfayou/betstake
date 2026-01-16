'use client';

import { useState, useEffect } from 'react';

export type WheelRisk = 'low' | 'medium' | 'high';

export interface WheelGameParams {
  risk: WheelRisk;
  segments: 10 | 20 | 30 | 40 | 50;
}

interface WheelGameControlsProps {
  onChange: (params: WheelGameParams) => void;
  disabled?: boolean;
}

export default function WheelGameControls({ onChange, disabled = false }: WheelGameControlsProps) {
  const [risk, setRisk] = useState<WheelRisk>('medium');
  const [segments, setSegments] = useState<10 | 20 | 30 | 40 | 50>(10);

  useEffect(() => {
    onChange({ risk, segments });
  }, [risk, segments, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-3">Risk Level</label>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as WheelRisk[]).map(r => (
            <button
              key={r}
              onClick={() => setRisk(r)}
              disabled={disabled}
              className={`py-3 rounded-lg font-bold capitalize transition-all ${
                risk === r ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
              } disabled:opacity-50`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-3">Segments</label>
        <div className="grid grid-cols-5 gap-2">
          {([10, 20, 30, 40, 50] as const).map(s => (
            <button
              key={s}
              onClick={() => setSegments(s)}
              disabled={disabled}
              className={`py-3 rounded-lg font-bold transition-all ${
                segments === s ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
              } disabled:opacity-50`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm text-gray-400">Configuration</div>
          <div className="text-xl font-bold text-primary capitalize">
            {risk} Risk - {segments} Segments
          </div>
        </div>
      </div>
    </div>
  );
}
