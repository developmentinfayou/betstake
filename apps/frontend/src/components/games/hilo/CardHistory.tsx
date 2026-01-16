'use client';

import PlayingCard from './PlayingCard';

interface CardHistoryProps {
  cardHistory: number[];
  multipliers?: number[];
  className?: string;
}

const cardNames = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export default function CardHistory({ cardHistory, multipliers = [], className = '' }: CardHistoryProps) {
  if (cardHistory.length === 0) return null;

  return (
    <div className={`${className}`}>
      <div className="flex gap-2 justify-center overflow-x-auto pb-2">
        {cardHistory.map((card, index) => (
          <div key={index} className="flex flex-col items-center gap-1 min-w-0">
            <PlayingCard 
              value={card} 
              className="w-12 h-16 text-xs"
            />
            <div className="text-xs text-center">
              <div className="text-gray-400">{cardNames[card]}</div>
              {multipliers[index] && (
                <div className="text-green-400 font-bold">
                  {multipliers[index].toFixed(2)}x
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}