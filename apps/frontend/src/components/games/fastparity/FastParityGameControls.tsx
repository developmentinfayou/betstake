'use client';

import { useState, useEffect } from 'react';

export type ParityColor = 'green' | 'red' | 'violet';
export type ParityBetType = 'number' | 'color';

export interface FastParityGameParams {
  betType: ParityBetType;
  value: number | ParityColor;
}

interface FastParityGameControlsProps {
  onChange: (params: FastParityGameParams) => void;
  disabled?: boolean;
}

export default function FastParityGameControls({ onChange, disabled = false }: FastParityGameControlsProps) {
  const [betType, setBetType] = useState<ParityBetType>('color');
  const [value, setValue] = useState<any>('green');

  useEffect(() => {
    onChange({ betType, value });
  }, [betType, value, onChange]);

  const getColorStyle = (color: ParityColor) => {
    const colors = {
      green: '#10b981',
      red: '#ef4444', 
      violet: '#8b5cf6'
    };
    return { backgroundColor: colors[color] };
  };

  const getMultiplier = (color: ParityColor) => {
    return color === 'violet' ? '4.5x' : '1.96x';
  };

  return (
    <div className="space-y-6">
      {/* Color Betting - Main Options */}
      <div>
        <label className="block text-sm text-gray-400 mb-3">Select Color</label>
        <div className="grid grid-cols-3 gap-3">
          {(['green', 'red', 'violet'] as ParityColor[]).map(color => (
            <button
              key={color}
              onClick={() => {
                setBetType('color');
                setValue(color);
              }}
              disabled={disabled}
              className={`py-4 px-6 rounded-lg font-bold capitalize transition-all flex flex-col items-center gap-2 ${
                betType === 'color' && value === color ? 'ring-4 ring-white scale-105' : ''
              } disabled:opacity-50 hover:scale-102`}
              style={getColorStyle(color)}
            >
              <div className="text-white text-lg">Join {color}</div>
              <div className="text-white/90 text-sm">{getMultiplier(color)}</div>
              <div className="text-xs text-white/70">
                🚀
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Number Betting */}
      <div>
        <label className="block text-sm text-gray-400 mb-3">Select Number (9x)</label>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onClick={() => {
                setBetType('number');
                setValue(num);
              }}
              disabled={disabled}
              className={`aspect-square rounded-lg font-bold text-xl transition-all ${
                betType === 'number' && value === num ? 'bg-primary text-white scale-105' : 'bg-gray-800 hover:bg-gray-700'
              } disabled:opacity-50`}
              style={betType === 'number' && value === num ? getColorStyle(
                num === 5 ? 'violet' : [1, 3].includes(num) ? 'green' : 'red'
              ) : undefined}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[6, 7, 8, 9, 0].map(num => (
            <button
              key={num}
              onClick={() => {
                setBetType('number');
                setValue(num);
              }}
              disabled={disabled}
              className={`aspect-square rounded-lg font-bold text-xl transition-all ${
                betType === 'number' && value === num ? 'bg-primary text-white scale-105' : 'bg-gray-800 hover:bg-gray-700'
              } disabled:opacity-50`}
              style={betType === 'number' && value === num ? getColorStyle(
                num === 0 ? 'violet' : [7, 9].includes(num) ? 'green' : 'red'
              ) : undefined}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="text-center mt-2 text-sm text-gray-400">
          9x multiplier for any number
        </div>
      </div>

      {/* Color Legend */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-bold text-gray-300 mb-3">Color Guide</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={getColorStyle('green')}></div>
            <span className="text-gray-300">Green: 1, 3, 7, 9 (1.96x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={getColorStyle('red')}></div>
            <span className="text-gray-300">Red: 2, 4, 6, 8 (1.96x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={getColorStyle('violet')}></div>
            <span className="text-gray-300">Violet: 0, 5 (4.5x)</span>
          </div>
        </div>
      </div>
    </div>
  );
}