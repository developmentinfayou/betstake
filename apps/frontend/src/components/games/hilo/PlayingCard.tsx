'use client';

interface PlayingCardProps {
  value: number;
  suit?: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  className?: string;
}

const cardNames = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const suitColors = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-black',
  spades: 'text-black'
};

export default function PlayingCard({ value, suit = 'spades', className = '' }: PlayingCardProps) {
  const cardName = cardNames[value];
  const suitSymbol = suitSymbols[suit];
  const suitColor = suitColors[suit];

  return (
    <div className={`bg-white rounded-lg shadow-xl border-2 border-gray-200 flex flex-col justify-between p-2 ${className}`}>
      {/* Top left corner */}
      <div className={`text-left ${suitColor}`}>
        <div className="text-sm font-bold leading-none">{cardName}</div>
        <div className="text-lg leading-none">{suitSymbol}</div>
      </div>
      
      {/* Center symbol */}
      <div className={`flex-1 flex items-center justify-center ${suitColor}`}>
        <div className="text-6xl font-bold">{suitSymbol}</div>
      </div>
      
      {/* Bottom right corner (rotated) */}
      <div className={`text-right transform rotate-180 ${suitColor}`}>
        <div className="text-sm font-bold leading-none">{cardName}</div>
        <div className="text-lg leading-none">{suitSymbol}</div>
      </div>
    </div>
  );
}