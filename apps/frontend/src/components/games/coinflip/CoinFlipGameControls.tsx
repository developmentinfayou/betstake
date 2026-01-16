'use client';

import { useState, useEffect } from 'react';

export type CoinSide = 'heads' | 'tails';
export type CoinFlipMode = 'normal' | 'series' | 'jackpot';

export interface CoinFlipGameParams {
  choice: CoinSide;
  mode: CoinFlipMode;
  seriesCount: number;
  jackpotCondition?: {
    type: 'streak' | 'next_bets' | 'percentage';
    value: number;
    streakType?: 'win' | 'lose';
    side?: CoinSide;
  };
}

interface CoinFlipGameControlsProps {
  onChange: (params: CoinFlipGameParams) => void;
  disabled?: boolean;
}

export default function CoinFlipGameControls({ onChange, disabled = false }: CoinFlipGameControlsProps) {
  const [choice, setChoice] = useState<CoinSide>('heads');
  const [mode, setMode] = useState<CoinFlipMode>('normal');
  const [seriesCount, setSeriesCount] = useState(3);
  const [jackpotCondition, setJackpotCondition] = useState({
    type: 'streak' as const,
    value: 5,
    streakType: 'win' as const,
    side: 'heads' as CoinSide
  });

  useEffect(() => {
    onChange({ choice, mode, seriesCount, jackpotCondition: mode === 'jackpot' ? jackpotCondition : undefined });
  }, [choice, mode, seriesCount, jackpotCondition, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-3">Choose Side</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setChoice('heads')}
            disabled={disabled}
            className={`py-8 rounded-lg font-bold text-2xl transition-all ${
              choice === 'heads' ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            🪙 HEADS
          </button>
          <button
            onClick={() => setChoice('tails')}
            disabled={disabled}
            className={`py-8 rounded-lg font-bold text-2xl transition-all ${
              choice === 'tails' ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            🪙 TAILS
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-3">Mode</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMode('normal')}
            disabled={disabled}
            className={`py-3 rounded-lg font-bold transition-all ${
              mode === 'normal' ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            Normal
          </button>
          <button
            onClick={() => setMode('series')}
            disabled={disabled}
            className={`py-3 rounded-lg font-bold transition-all ${
              mode === 'series' ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            Series
          </button>
          <button
            onClick={() => setMode('jackpot')}
            disabled={disabled}
            className={`py-3 rounded-lg font-bold transition-all ${
              mode === 'jackpot' ? 'bg-special text-white' : 'bg-gray-800 hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            🎰 Jackpot
          </button>
        </div>
      </div>

      {mode === 'series' && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Number of Flips</label>
          <input
            type="number"
            value={seriesCount}
            onChange={(e) => setSeriesCount(Math.max(2, Math.min(10, Number(e.target.value))))}
            className="input w-full"
            min="2"
            max="10"
            disabled={disabled}
          />
        </div>
      )}

      {mode === 'jackpot' && (
        <div className="space-y-4 bg-special/10 border border-special/30 rounded-lg p-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Jackpot Condition</label>
            <select
              value={jackpotCondition.type}
              onChange={(e) => setJackpotCondition({...jackpotCondition, type: e.target.value as any})}
              className="input w-full"
              disabled={disabled}
            >
              <option value="streak">Win/Lose Streak</option>
              <option value="next_bets">Next X Bets</option>
              <option value="percentage">Percentage Chance</option>
            </select>
          </div>

          {jackpotCondition.type === 'streak' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <select
                  value={jackpotCondition.streakType}
                  onChange={(e) => setJackpotCondition({...jackpotCondition, streakType: e.target.value as any})}
                  className="input w-full text-sm"
                  disabled={disabled}
                >
                  <option value="win">Win</option>
                  <option value="lose">Lose</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Times</label>
                <input
                  type="number"
                  value={jackpotCondition.value}
                  onChange={(e) => setJackpotCondition({...jackpotCondition, value: Number(e.target.value)})}
                  className="input w-full text-sm"
                  min="2"
                  max="10"
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {jackpotCondition.type === 'next_bets' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Next X Bets</label>
              <input
                type="number"
                value={jackpotCondition.value}
                onChange={(e) => setJackpotCondition({...jackpotCondition, value: Number(e.target.value)})}
                className="input w-full"
                min="1"
                max="20"
                disabled={disabled}
              />
            </div>
          )}

          {jackpotCondition.type === 'percentage' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Chance (%)</label>
              <input
                type="number"
                value={jackpotCondition.value}
                onChange={(e) => setJackpotCondition({...jackpotCondition, value: Number(e.target.value)})}
                className="input w-full"
                min="0.1"
                max="10"
                step="0.1"
                disabled={disabled}
              />
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm text-gray-400">Win Chance</div>
          <div className="text-2xl font-bold text-primary">
            {mode === 'normal' ? '49.5%' : 
             mode === 'series' ? `${((0.5 ** seriesCount) * 100).toFixed(2)}%` :
             mode === 'jackpot' ? '🎰 Jackpot Mode' : '49.5%'}
          </div>
        </div>
      </div>
    </div>
  );
}
