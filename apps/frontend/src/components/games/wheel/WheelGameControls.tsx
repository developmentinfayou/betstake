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
  const [segments, setSegments] = useState<10 | 20 | 30 | 40 | 50>(20);

  useEffect(() => {
    onChange({ risk, segments });
  }, [risk, segments, onChange]);

  // Handle slider change — snap to nearest 10
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.round(Number(e.target.value) / 10) * 10;
    const clamped = Math.max(10, Math.min(50, val)) as 10 | 20 | 30 | 40 | 50;
    setSegments(clamped);
  };

  return (
    <div className="space-y-6">
      {/* Segments Slider */}
      <div>
        <label className="block text-sm text-gray-400 mb-3">Segments</label>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white min-w-[24px]">{segments}</span>
          <input
            type="range"
            min={10}
            max={50}
            step={10}
            value={segments}
            onChange={handleSliderChange}
            disabled={disabled}
            className="flex-1 h-2 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #10B981 ${((segments - 10) / 40) * 100}%, #374151 ${((segments - 10) / 40) * 100}%, #374151 100%)`,
            }}
          />
          <span className="text-sm text-gray-400 min-w-[24px]">50</span>
        </div>
      </div>

      {/* Risk Level */}
      <div>
        <label className="block text-sm text-gray-400 mb-3">Risk Level</label>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as WheelRisk[]).map(r => (
            <button
              key={r}
              onClick={() => setRisk(r)}
              disabled={disabled}
              className={`py-3 rounded-lg font-bold capitalize transition-all ${
                risk === r ? 'bg-gray-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              } disabled:opacity-50`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
