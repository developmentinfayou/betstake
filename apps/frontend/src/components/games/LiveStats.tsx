'use client';

interface LiveStatsProps {
  stats: {
    profit: number;
    wins: number;
    losses: number;
    wagered: number;
  };
  onReset: () => void;
}

export default function LiveStats({ stats, onReset }: LiveStatsProps) {
  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Live Stats</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Profit/Loss</span>
          <span className={stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
            ${stats.profit.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Wins</span>
          <span className="text-green-500">{stats.wins}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Losses</span>
          <span className="text-red-500">{stats.losses}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Wagered</span>
          <span>${stats.wagered.toFixed(2)}</span>
        </div>
        <button onClick={onReset} className="btn-secondary w-full mt-4">
          Reset Stats
        </button>
      </div>
    </div>
  );
}