'use client';

import Link from 'next/link';

interface GameHeaderProps {
  gameTitle: string;
  balance: number;
  currency?: string;
  onFairnessClick: () => void;
}

export default function GameHeader({ 
  gameTitle, 
  balance, 
  currency = 'USD',
  onFairnessClick 
}: GameHeaderProps) {
  return (
    <header className="border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold gradient-text">
          ← {gameTitle}
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={onFairnessClick}
            className="btn-secondary px-4 py-2"
          >
            🎲 Fairness
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-400">Balance</div>
            <div className="text-xl font-bold text-primary">
              {currency === 'USD' ? '$' : ''}{balance.toFixed(2)} {currency !== 'USD' ? currency : ''}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}