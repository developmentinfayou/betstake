'use client';

import { useState, useEffect } from 'react';

export interface MinesGameParams {
  minesCount: number;
  selectedTiles: number[];
}

interface MinesGameControlsProps {
  onChange: (params: MinesGameParams) => void;
  disabled?: boolean;
  isAutoMode?: boolean;
  revealedTiles?: number[];
  mineTiles?: number[];
  onTileClick?: (index: number) => void;
  gameActive?: boolean;
  gemsFound?: number;
  autoBetActive?: boolean;
}

export default function MinesGameControls({ 
  onChange, 
  disabled = false,
  isAutoMode = false,
  revealedTiles = [],
  mineTiles = [],
  onTileClick,
  gameActive = false,
  gemsFound = 0,
  autoBetActive = false
}: MinesGameControlsProps) {
  const [minesCount, setMinesCount] = useState(3);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const gridSize = 25;

  useEffect(() => {
    onChange({ minesCount, selectedTiles });
  }, [minesCount, selectedTiles, onChange]);

  const handleTileClick = (index: number) => {
    if (disabled || autoBetActive) return;

    if (isAutoMode) {
      if (selectedTiles.includes(index)) {
        setSelectedTiles(selectedTiles.filter(t => t !== index));
      } else {
        setSelectedTiles([...selectedTiles, index]);
      }
    } else if (gameActive && onTileClick) {
      onTileClick(index);
    }
  };

  const getTileClass = (index: number) => {
    if (mineTiles.includes(index)) return 'bg-red-500 text-white';
    if (revealedTiles.includes(index)) return 'bg-green-500 text-white';
    if (isAutoMode && selectedTiles.includes(index)) return 'bg-blue-500 text-white';
    if (gameActive && !isAutoMode) return 'bg-gray-700 hover:bg-gray-600 cursor-pointer';
    if (disabled && !isAutoMode) return 'bg-gray-800';
    return 'bg-gray-700 hover:bg-gray-600 cursor-pointer';
  };

  const getTileContent = (index: number) => {
    if (mineTiles.includes(index)) return '💥';
    if (revealedTiles.includes(index)) return '💎';
    if (isAutoMode && selectedTiles.includes(index)) return '✓';
    return '';
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-2">Mines</label>
          <select
            value={minesCount}
            onChange={(e) => setMinesCount(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            disabled={disabled || gameActive}
          >
            {Array.from({ length: 24 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        
        {gameActive && (
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Gems</label>
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center font-bold">
              {gemsFound}
            </div>
          </div>
        )}
      </div>

      {isAutoMode && (
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3 text-center mb-4">
          <div className="text-sm text-gray-400">AutoBet Configuration</div>
          <div className="text-xl font-bold text-blue-500">{selectedTiles.length} tiles selected</div>
          <div className="text-xs text-gray-400 mt-1">
            {selectedTiles.length > 0 ? `Expected multiplier: ~${(1.2 ** selectedTiles.length).toFixed(2)}x` : 'Select tiles to see multiplier'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: gridSize }, (_, i) => (
          <button
            key={i}
            onClick={() => handleTileClick(i)}
            disabled={disabled || (gameActive && revealedTiles.includes(i)) || (gameActive && mineTiles.includes(i))}
            className={`aspect-square rounded-lg font-bold text-2xl transition-all ${getTileClass(i)}`}
          >
            {getTileContent(i)}
          </button>
        ))}
      </div>
    </div>
  );
}
