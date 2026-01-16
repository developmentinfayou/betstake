'use client';

import { useState, useEffect } from 'react';

export interface TowerGameParams {
  floors: 8 | 10 | 12 | 15;
}

interface TowerGameControlsProps {
  onChange: (params: TowerGameParams) => void;
  disabled?: boolean;
  revealedTiles?: number[];
  dangerTiles?: number[];
  onTileClick?: (index: number) => void;
}

export default function TowerGameControls({ 
  onChange, 
  disabled = false,
  revealedTiles = [],
  dangerTiles = [],
  onTileClick
}: TowerGameControlsProps) {
  const [floors, setFloors] = useState<8 | 10 | 12 | 15>(10);

  useEffect(() => {
    onChange({ floors });
  }, [floors, onChange]);

  const handleTileClick = (index: number) => {
    if (disabled || !onTileClick) return;
    onTileClick(index);
  };

  const getTileClass = (index: number) => {
    if (dangerTiles.includes(index)) return 'bg-red-500 text-white';
    if (revealedTiles.includes(index)) return 'bg-green-500 text-white';
    if (disabled) return 'bg-gray-800';
    return 'bg-gray-700 hover:bg-gray-600 cursor-pointer';
  };

  const getTileContent = (index: number) => {
    if (dangerTiles.includes(index)) return '💀';
    if (revealedTiles.includes(index)) return '✓';
    return '';
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Floors</label>
        <div className="grid grid-cols-4 gap-2">
          {([8, 10, 12, 15] as const).map(f => (
            <button
              key={f}
              onClick={() => setFloors(f)}
              disabled={disabled}
              className={`py-3 rounded-lg font-bold ${floors === f ? 'bg-primary' : 'bg-gray-800'} disabled:opacity-50`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: floors }, (_, floor) => (
          <div key={floor} className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }, (_, tile) => {
              const index = floor * 3 + tile;
              return (
                <button
                  key={index}
                  onClick={() => handleTileClick(index)}
                  disabled={disabled}
                  className={`aspect-square rounded-lg font-bold text-2xl transition-all ${getTileClass(index)}`}
                >
                  {getTileContent(index)}
                </button>
              );
            })}
          </div>
        )).reverse()}
      </div>
    </div>
  );
}
