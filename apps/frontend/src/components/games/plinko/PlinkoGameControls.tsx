'use client';

import { useState, useEffect } from 'react';

export type PlinkoRisk = 'low' | 'medium' | 'high' | 'lightning-low' | 'lightning-medium' | 'lightning-high';

export interface PlinkoGameParams {
  risk: PlinkoRisk;
  rows: 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
  superMode: boolean;
  jackpotMode?: boolean;
  jackpotCondition?: {
    type: 'same_trajectory' | 'next_bets' | 'percentage';
    value: number;
    trajectoryRows?: number;
  };
}

interface PlinkoGameControlsProps {
  onChange: (params: PlinkoGameParams) => void;
  disabled?: boolean;
}

export default function PlinkoGameControls({ onChange, disabled = false }: PlinkoGameControlsProps) {
  const [risk, setRisk] = useState<PlinkoRisk>('medium');
  const [rows, setRows] = useState<8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16>(12);
  const [superMode, setSuperMode] = useState(false);
  const [isLightningMode, setIsLightningMode] = useState(false);
  const [jackpotMode, setJackpotMode] = useState(false);
  const [jackpotCondition, setJackpotCondition] = useState({
    type: 'same_trajectory' as const,
    value: 3,
    trajectoryRows: 12
  });

  useEffect(() => {
    // Determine actual risk value
    let actualRisk: PlinkoRisk = risk;
    if (isLightningMode) {
      actualRisk = `lightning-${risk}` as PlinkoRisk;
    }
    
    onChange({ risk: actualRisk, rows, superMode: isLightningMode || superMode, jackpotMode, jackpotCondition: jackpotMode ? jackpotCondition : undefined });
  }, [risk, rows, superMode, isLightningMode, jackpotMode, jackpotCondition, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-3">Risk Level</label>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as Array<'low' | 'medium' | 'high'>).map(r => {
            const riskColors = {
              low: risk === r ? 'bg-green-600 text-white' : 'bg-gray-800 hover:bg-green-700',
              medium: risk === r ? 'bg-yellow-600 text-white' : 'bg-gray-800 hover:bg-yellow-700', 
              high: risk === r ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-red-700'
            };
            return (
              <button
                key={r}
                onClick={() => setRisk(r)}
                disabled={disabled}
                className={`py-3 rounded-lg font-bold capitalize transition-all ${riskColors[r]} disabled:opacity-50`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`flex items-center justify-between rounded-lg p-4 transition-all ${
        isLightningMode ? 'bg-yellow-900/20 border border-yellow-500' : 'bg-gray-800'
      }`}>
        <div>
          <div className={`font-bold ${isLightningMode ? 'text-yellow-500' : ''}`}>
            ⚡ Lightning Mode {isLightningMode ? '(ACTIVE)' : ''}
          </div>
          <div className="text-xs text-gray-400">Golden pegs & dead zones</div>
        </div>
        <button
          onClick={() => setIsLightningMode(!isLightningMode)}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isLightningMode ? 'bg-yellow-500' : 'bg-gray-700'
          } disabled:opacity-50`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
              isLightningMode ? 'translate-x-6 bg-white' : 'translate-x-1 bg-gray-300'
            }`}
          />
        </button>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Rows: {rows}</label>
        <input
          type="range"
          min="8"
          max="16"
          value={rows}
          onChange={(e) => setRows(Number(e.target.value) as any)}
          className="w-full"
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>8</span>
          <span>16</span>
        </div>
      </div>

      <div className={`flex items-center justify-between rounded-lg p-4 transition-all ${
        superMode ? 'bg-purple-900/20 border border-purple-500' : 'bg-gray-800'
      }`}>
        <div>
          <div className={`font-bold ${superMode ? 'text-purple-500' : ''}`}>
            🎲 Super Mode {superMode ? '(ACTIVE)' : ''}
          </div>
          <div className="text-xs text-gray-400">Shuffled multipliers (non-lightning)</div>
        </div>
        <button
          onClick={() => setSuperMode(!superMode)}
          disabled={disabled || isLightningMode}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            superMode ? 'bg-purple-500' : 'bg-gray-700'
          } disabled:opacity-50`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
              superMode ? 'translate-x-6 bg-white' : 'translate-x-1 bg-gray-300'
            }`}
          />
        </button>
      </div>

      <div className={`rounded-lg p-4 transition-all ${
        jackpotMode ? 'bg-special/20 border border-special/50' : 'bg-gray-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className={`font-bold ${jackpotMode ? 'text-special' : ''}`}>
              🎰 Jackpot Mode {jackpotMode ? '(ACTIVE)' : ''}
            </div>
            <div className="text-xs text-gray-400">Special jackpot conditions</div>
          </div>
          <button
            onClick={() => setJackpotMode(!jackpotMode)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              jackpotMode ? 'bg-special' : 'bg-gray-700'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                jackpotMode ? 'translate-x-6 bg-white' : 'translate-x-1 bg-gray-300'
              }`}
            />
          </button>
        </div>

        {jackpotMode && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Jackpot Condition</label>
              <select
                value={jackpotCondition.type}
                onChange={(e) => setJackpotCondition({...jackpotCondition, type: e.target.value as any})}
                className="input w-full"
                disabled={disabled}
              >
                <option value="same_trajectory">Same Ball Trajectory</option>
                <option value="next_bets">Next X Bets Win</option>
                <option value="percentage">Percentage Chance</option>
              </select>
            </div>

            {jackpotCondition.type === 'same_trajectory' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Times in Row</label>
                  <input
                    type="number"
                    value={jackpotCondition.value}
                    onChange={(e) => setJackpotCondition({...jackpotCondition, value: Number(e.target.value)})}
                    className="input w-full text-sm"
                    min="2"
                    max="5"
                    disabled={disabled}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Rows</label>
                  <input
                    type="number"
                    value={jackpotCondition.trajectoryRows || rows}
                    onChange={(e) => setJackpotCondition({...jackpotCondition, trajectoryRows: Number(e.target.value)})}
                    className="input w-full text-sm"
                    min="8"
                    max="16"
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
                  max="10"
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
                  max="5"
                  step="0.1"
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
