'use client';

import { useState } from 'react';

interface TrajectoryHistoryProps {
  trajectories: Array<{
    path: number[];
    slot: number;
    multiplier: number;
    won: boolean;
  }>;
  jackpotCondition?: {
    type: 'same_trajectory' | 'next_bets' | 'percentage';
    value: number;
  };
  showHistory: boolean;
  onToggle: () => void;
}

export default function TrajectoryHistory({ 
  trajectories, 
  jackpotCondition, 
  showHistory, 
  onToggle 
}: TrajectoryHistoryProps) {
  const getSameTrajectoryCount = () => {
    if (!trajectories.length || !jackpotCondition || jackpotCondition.type !== 'same_trajectory') return 0;
    
    let count = 1;
    const lastPath = trajectories[trajectories.length - 1]?.path;
    
    for (let i = trajectories.length - 2; i >= 0; i--) {
      const currentPath = trajectories[i].path;
      if (JSON.stringify(currentPath) === JSON.stringify(lastPath)) {
        count++;
      } else {
        break;
      }
    }
    
    return count;
  };

  const pathToString = (path: number[]) => {
    return path.map(d => d === 0 ? '←' : '→').join('');
  };

  const sameCount = getSameTrajectoryCount();
  const isJackpotClose = jackpotCondition?.type === 'same_trajectory' && 
                        sameCount >= (jackpotCondition.value - 1);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Ball History</h3>
        <button
          onClick={onToggle}
          className="btn-secondary px-3 py-1 text-sm"
        >
          {showHistory ? 'Hide' : 'Show'} Paths
        </button>
      </div>

      {jackpotCondition?.type === 'same_trajectory' && (
        <div className={`mb-4 p-3 rounded-lg ${
          isJackpotClose ? 'bg-special/20 border border-special/50' : 'bg-gray-800'
        }`}>
          <div className="text-sm text-gray-400">Same Trajectory Progress</div>
          <div className={`text-lg font-bold ${isJackpotClose ? 'text-special' : ''}`}>
            {sameCount}/{jackpotCondition.value} 
            {sameCount >= jackpotCondition.value && ' 🎰 JACKPOT!'}
          </div>
          {trajectories.length > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              Current: {pathToString(trajectories[trajectories.length - 1].path)}
            </div>
          )}
        </div>
      )}

      {showHistory && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {trajectories.slice(-10).reverse().map((trajectory, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded text-sm ${
                trajectory.won ? 'bg-green-900/20' : 'bg-red-900/20'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs">
                  {pathToString(trajectory.path)}
                </span>
                <span className="text-gray-400">→</span>
                <span>Slot {trajectory.slot + 1}</span>
              </div>
              <div className={`font-bold ${trajectory.won ? 'text-green-400' : 'text-red-400'}`}>
                {trajectory.multiplier}x
              </div>
            </div>
          ))}
          
          {trajectories.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              No ball drops yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}