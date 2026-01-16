'use client';

import { useState, useEffect } from 'react';

export interface DiceGameParams {
  mode: 'classic' | 'ultimate';
  multiplier: number;
  winChance: number;
  // Classic mode
  target?: number;
  isOver?: boolean;
  // Ultimate mode
  rangeStart?: number;
  rangeEnd?: number;
  rollInside?: boolean;
  rangeType?: 'under' | 'over' | 'inside' | 'outside';
}

interface DiceGameControlsProps {
  onChange: (params: DiceGameParams) => void;
  disabled?: boolean;
}

export default function DiceGameControls({ onChange, disabled = false }: DiceGameControlsProps) {
  const [mode, setMode] = useState<'classic' | 'ultimate'>('classic');
  const [rangeType, setRangeType] = useState<'under' | 'over' | 'inside' | 'outside'>('over');
  const [multiplier, setMultiplier] = useState(2.0);
  const [winChance, setWinChance] = useState(49.5);
  
  // For under/over (single slider)
  const [target, setTarget] = useState(50.5);
  
  // For inside/outside (dual slider)
  const [rangeStart, setRangeStart] = useState(25);
  const [rangeEnd, setRangeEnd] = useState(75);

  useEffect(() => {
    const params: DiceGameParams = {
      mode,
      multiplier,
      winChance,
      rangeType,
      ...(rangeType === 'under' || rangeType === 'over' 
        ? { target, isOver: rangeType === 'over' } 
        : { rangeStart, rangeEnd, rollInside: rangeType === 'inside' }
      ),
    };
    onChange(params);
  }, [mode, multiplier, winChance, rangeType, target, rangeStart, rangeEnd]);

  const handleTargetChange = (value: number) => {
    if (value < 0.01) value = 0.01;
    if (value > 99.99) value = 99.99;
    setTarget(value);
    const newWinChance = rangeType === 'over' ? (100 - value) : value;
    setWinChance(parseFloat(newWinChance.toFixed(2)));
    setMultiplier(parseFloat((99 / newWinChance).toFixed(2)));
  };

  const handleRangeChange = (start: number, end: number) => {
    if (start >= end) return;
    if (start < 0) start = 0;
    if (end > 100) end = 100;
    setRangeStart(start);
    setRangeEnd(end);
    const range = end - start;
    const newWinChance = rangeType === 'inside' ? range : (100 - range);
    setWinChance(parseFloat(newWinChance.toFixed(2)));
    setMultiplier(parseFloat((99 / newWinChance).toFixed(2)));
  };

  const handleRangeTypeChange = (type: 'under' | 'over' | 'inside' | 'outside') => {
    setRangeType(type);
    if (type === 'under' || type === 'over') {
      setMode('classic');
      const newWinChance = type === 'over' ? (100 - target) : target;
      setWinChance(parseFloat(newWinChance.toFixed(2)));
      setMultiplier(parseFloat((99 / newWinChance).toFixed(2)));
    } else {
      setMode('ultimate');
      const range = rangeEnd - rangeStart;
      const newWinChance = type === 'inside' ? range : (100 - range);
      setWinChance(parseFloat(newWinChance.toFixed(2)));
      setMultiplier(parseFloat((99 / newWinChance).toFixed(2)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Range Type Selector (4 buttons like BC.game) */}
      <div>
        <label className="block text-sm text-gray-400 mb-3">Range Type</label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleRangeTypeChange('under')}
            disabled={disabled}
            className={`py-3 rounded-lg font-bold transition-all ${
              rangeType === 'under' ? 'bg-green-600 text-white ring-2 ring-green-400' : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title="Roll Under"
          >
            ←
          </button>
          <button
            onClick={() => handleRangeTypeChange('over')}
            disabled={disabled}
            className={`py-3 rounded-lg font-bold transition-all ${
              rangeType === 'over' ? 'bg-green-600 text-white ring-2 ring-green-400' : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title="Roll Over"
          >
            →
          </button>
          <button
            onClick={() => handleRangeTypeChange('inside')}
            disabled={disabled}
            className={`py-3 rounded-lg font-bold transition-all ${
              rangeType === 'inside' ? 'bg-green-600 text-white ring-2 ring-green-400' : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title="Roll Inside Range"
          >
            ↔
          </button>
          <button
            onClick={() => handleRangeTypeChange('outside')}
            disabled={disabled}
            className={`py-3 rounded-lg font-bold transition-all ${
              rangeType === 'outside' ? 'bg-green-600 text-white ring-2 ring-green-400' : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title="Roll Outside Range"
          >
            ⟷
          </button>
        </div>
      </div>

      {/* Visual Range Bar */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          {rangeType === 'under' && 'Roll Under (Green Zone Wins)'}
          {rangeType === 'over' && 'Roll Over (Green Zone Wins)'}
          {rangeType === 'inside' && 'Roll Inside Range (Green Zone Wins)'}
          {rangeType === 'outside' && 'Roll Outside Range (Green Zone Wins)'}
        </label>
        
        <div className="relative h-10 bg-gray-700 rounded-lg overflow-hidden mb-2">
          {/* Under: Green left, Orange right */}
          {rangeType === 'under' && (
            <>
              <div className="absolute h-full bg-green-500" style={{ left: 0, width: `${target}%` }} />
              <div className="absolute h-full bg-orange-500" style={{ left: `${target}%`, width: `${100 - target}%` }} />
              <div className="absolute top-0 w-1 h-full bg-white shadow-lg" style={{ left: `${target}%` }} />
            </>
          )}
          
          {/* Over: Orange left, Green right */}
          {rangeType === 'over' && (
            <>
              <div className="absolute h-full bg-orange-500" style={{ left: 0, width: `${target}%` }} />
              <div className="absolute h-full bg-green-500" style={{ left: `${target}%`, width: `${100 - target}%` }} />
              <div className="absolute top-0 w-1 h-full bg-white shadow-lg" style={{ left: `${target}%` }} />
            </>
          )}
          
          {/* Inside: Orange-Green-Orange */}
          {rangeType === 'inside' && (
            <>
              <div className="absolute h-full bg-orange-500" style={{ left: 0, width: `${rangeStart}%` }} />
              <div className="absolute h-full bg-green-500" style={{ left: `${rangeStart}%`, width: `${rangeEnd - rangeStart}%` }} />
              <div className="absolute h-full bg-orange-500" style={{ left: `${rangeEnd}%`, width: `${100 - rangeEnd}%` }} />
              <div className="absolute top-0 w-1 h-full bg-white shadow-lg" style={{ left: `${rangeStart}%` }} />
              <div className="absolute top-0 w-1 h-full bg-white shadow-lg" style={{ left: `${rangeEnd}%` }} />
            </>
          )}
          
          {/* Outside: Green-Orange-Green */}
          {rangeType === 'outside' && (
            <>
              <div className="absolute h-full bg-green-500" style={{ left: 0, width: `${rangeStart}%` }} />
              <div className="absolute h-full bg-orange-500" style={{ left: `${rangeStart}%`, width: `${rangeEnd - rangeStart}%` }} />
              <div className="absolute h-full bg-green-500" style={{ left: `${rangeEnd}%`, width: `${100 - rangeEnd}%` }} />
              <div className="absolute top-0 w-1 h-full bg-white shadow-lg" style={{ left: `${rangeStart}%` }} />
              <div className="absolute top-0 w-1 h-full bg-white shadow-lg" style={{ left: `${rangeEnd}%` }} />
            </>
          )}
          
          <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-white font-bold pointer-events-none">
            <span>0</span>
            {(rangeType === 'inside' || rangeType === 'outside') ? (
              <>
                <span>{rangeStart.toFixed(0)}</span>
                <span>{rangeEnd.toFixed(0)}</span>
              </>
            ) : (
              <span>{target.toFixed(2)}</span>
            )}
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Range Controls */}
      {(rangeType === 'under' || rangeType === 'over') ? (
        <div>
          <label className="text-xs text-gray-500">Target</label>
          <input
            type="number"
            value={target}
            onChange={(e) => handleTargetChange(parseFloat(e.target.value) || 0.01)}
            className="input w-full mb-2"
            min="0.01"
            max="99.99"
            step="0.01"
            disabled={disabled}
          />
          <input
            type="range"
            min="0.01"
            max="99.99"
            step="0.01"
            value={target}
            onChange={(e) => handleTargetChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={disabled}
          />
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <label className="text-xs text-gray-500">Range Start</label>
              <input
                type="number"
                value={rangeStart}
                onChange={(e) => handleRangeChange(parseFloat(e.target.value) || 0, rangeEnd)}
                className="input w-full"
                min="0"
                max={rangeEnd - 0.01}
                step="0.01"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Range End</label>
              <input
                type="number"
                value={rangeEnd}
                onChange={(e) => handleRangeChange(rangeStart, parseFloat(e.target.value) || 100)}
                className="input w-full"
                min={rangeStart + 0.01}
                max="100"
                step="0.01"
                disabled={disabled}
              />
            </div>
          </div>
          <div className="relative h-2">
            <input
              type="range"
              min="0"
              max="100"
              step="0.01"
              value={rangeStart}
              onChange={(e) => handleRangeChange(parseFloat(e.target.value), rangeEnd)}
              className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20"
              style={{
                pointerEvents: 'auto',
              }}
              disabled={disabled}
            />
            <input
              type="range"
              min="0"
              max="100"
              step="0.01"
              value={rangeEnd}
              onChange={(e) => handleRangeChange(rangeStart, parseFloat(e.target.value))}
              className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20"
              style={{
                pointerEvents: 'auto',
              }}
              disabled={disabled}
            />
            <div className="absolute w-full h-2 bg-gray-700 rounded-lg" />
          </div>
        </div>
      )}

      {/* Stats Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400">Payout</div>
          <div className="text-xl font-bold text-primary">{multiplier.toFixed(2)}x</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400">Win Chance</div>
          <div className="text-xl font-bold text-green-500">{winChance.toFixed(2)}%</div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">
            {rangeType === 'under' && `Win if roll < ${target.toFixed(2)}`}
            {rangeType === 'over' && `Win if roll > ${target.toFixed(2)}`}
            {rangeType === 'inside' && `Win if ${rangeStart.toFixed(2)} ≤ roll ≤ ${rangeEnd.toFixed(2)}`}
            {rangeType === 'outside' && `Win if roll < ${rangeStart.toFixed(2)} or roll > ${rangeEnd.toFixed(2)}`}
          </div>
        </div>
      </div>
    </div>
  );
}
