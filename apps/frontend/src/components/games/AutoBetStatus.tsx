'use client';

interface AutoBetStatusProps {
  active: boolean;
}

export default function AutoBetStatus({ active }: AutoBetStatusProps) {
  if (!active) return null;

  return (
    <div className="card bg-blue-900/20 border border-blue-500">
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-1">Auto-Bet Active</div>
        <div className="text-lg font-bold">Running...</div>
      </div>
    </div>
  );
}