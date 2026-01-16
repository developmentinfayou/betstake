'use client';

import { useState, useEffect } from 'react';

export type KenoRisk = 'low' | 'medium' | 'high';

export interface KenoGameParams {
  selectedNumbers: number[];
  risk: KenoRisk;
}

interface KenoGameControlsProps {
  onChange: (params: KenoGameParams) => void;
  disabled?: boolean;
}

// Simple client-side shuffle for UI (not for actual game logic)
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function KenoGameControls({ onChange, disabled = false }: KenoGameControlsProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [risk, setRisk] = useState<KenoRisk>('medium');

  useEffect(() => {
    onChange({ selectedNumbers, risk });
  }, [selectedNumbers, risk, onChange]);

  const toggleNumber = (num: number) => {
    if (disabled) return;
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < 10) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const randomPick = () => {
    if (disabled) return;
    
    const maxNumbers = 10;
    const needed = maxNumbers - selectedNumbers.length;
    
    if (needed <= 0) {
      // Replace all with new random selection
      const allNumbers = Array.from({ length: 40 }, (_, i) => i + 1);
      const shuffled = shuffleArray(allNumbers);
      setSelectedNumbers(shuffled.slice(0, maxNumbers).sort((a, b) => a - b));
    } else {
      // Add random numbers to fill up to 10
      const available = Array.from({ length: 40 }, (_, i) => i + 1)
        .filter(n => !selectedNumbers.includes(n));
      
      const shuffled = shuffleArray(available);
      const newPicks = shuffled.slice(0, needed);
      
      setSelectedNumbers([...selectedNumbers, ...newPicks].sort((a, b) => a - b));
    }
  };

  const clearTable = () => {
    if (disabled) return;
    setSelectedNumbers([]);
  };

  const getSelectionText = () => {
    if (selectedNumbers.length === 0) {
      return 'Select 1 - 10 numbers to play';
    }
    return `${selectedNumbers.length}/10 numbers selected`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <div className="text-sm text-gray-400">Selected Numbers</div>
        <div className="text-3xl font-bold text-primary">{selectedNumbers.length}/10</div>
      </div>

      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: 40 }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            onClick={() => toggleNumber(num)}
            disabled={disabled || (selectedNumbers.length >= 10 && !selectedNumbers.includes(num))}
            className={`aspect-square rounded-lg font-bold transition-all ${
              selectedNumbers.includes(num)
                ? 'bg-primary text-white scale-110 shadow-lg'
                : 'bg-gray-800 hover:bg-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={randomPick} disabled={disabled} className="btn-secondary flex-1">
          Random Pick
        </button>
        <button onClick={clearTable} disabled={disabled} className="btn-secondary flex-1">
          Clear Table
        </button>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Risk Level</label>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as KenoRisk[]).map(r => (
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

      <div className="text-center text-sm text-gray-400 py-2">
        {getSelectionText()}
      </div>
    </div>
  );
}
