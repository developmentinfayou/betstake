'use client';

import { useState, useEffect } from 'react';

export interface RouletteBet {
  type: string;
  numbers: number[];
  amount: number;
}

export interface RouletteGameParams {
  bets: RouletteBet[];
}

interface RouletteGameControlsProps {
  onChange: (params: RouletteGameParams) => void;
  disabled?: boolean;
  amount: number;
}

export default function RouletteGameControls({ onChange, disabled = false, amount }: RouletteGameControlsProps) {
  const [bets, setBets] = useState<RouletteBet[]>([]);
  const [chipValue, setChipValue] = useState(1);

  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  useEffect(() => {
    onChange({ bets });
  }, [bets, onChange]);

  const addBet = (type: string, numbers: number[]) => {
    if (disabled) return;
    const existing = bets.find(b => b.type === type && JSON.stringify(b.numbers) === JSON.stringify(numbers));
    if (existing) {
      setBets(bets.map(b => b === existing ? { ...b, amount: b.amount + chipValue } : b));
    } else {
      setBets([...bets, { type, numbers, amount: chipValue }]);
    }
  };

  const clearBets = () => setBets([]);
  const doubleBets = () => setBets(bets.map(b => ({ ...b, amount: b.amount * 2 })));
  const halveBets = () => setBets(bets.map(b => ({ ...b, amount: b.amount / 2 })));
  const undoLast = () => setBets(bets.slice(0, -1));

  const totalBet = bets.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        {[1, 5, 10, 25, 100].map(v => (
          <button
            key={v}
            onClick={() => setChipValue(v)}
            disabled={disabled}
            className={`w-12 h-12 rounded-full font-bold ${
              chipValue === v ? 'bg-primary text-white' : 'bg-gray-700'
            } disabled:opacity-50`}
          >
            ${v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <button onClick={() => addBet('red', redNumbers)} disabled={disabled} className="btn-secondary py-2 bg-red-600">Red</button>
        <button onClick={() => addBet('black', [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35])} disabled={disabled} className="btn-secondary py-2 bg-gray-900">Black</button>
        <button onClick={() => addBet('zero', [0])} disabled={disabled} className="btn-secondary py-2 bg-green-600">0</button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => addBet('even', Array.from({length:18}, (_,i) => (i+1)*2))} disabled={disabled} className="btn-secondary py-2">Even</button>
        <button onClick={() => addBet('odd', Array.from({length:18}, (_,i) => i*2+1))} disabled={disabled} className="btn-secondary py-2">Odd</button>
        <button onClick={() => addBet('low', Array.from({length:18}, (_,i) => i+1))} disabled={disabled} className="btn-secondary py-2">1-18</button>
        <button onClick={() => addBet('high', Array.from({length:18}, (_,i) => i+19))} disabled={disabled} className="btn-secondary py-2">19-36</button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button onClick={halveBets} disabled={disabled || bets.length === 0} className="btn-secondary py-2">½</button>
        <button onClick={doubleBets} disabled={disabled || bets.length === 0} className="btn-secondary py-2">2×</button>
        <button onClick={undoLast} disabled={disabled || bets.length === 0} className="btn-secondary py-2">Undo</button>
        <button onClick={clearBets} disabled={disabled || bets.length === 0} className="btn-secondary py-2">Clear</button>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between">
          <span className="text-gray-400">Total Bet:</span>
          <span className="text-xl font-bold text-primary">${totalBet.toFixed(2)}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">{bets.length} bet(s) placed</div>
      </div>
    </div>
  );
}
