'use client';

interface Card {
  rank: string;
  suit: string;
  value: number;
}

interface BlackjackGameControlsProps {
  playerHands: Card[][];
  dealerHand: Card[];
  playerTotals: number[];
  dealerTotal: number;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  canHit: boolean;
  canDouble: boolean;
  disabled: boolean;
  gameOver: boolean;
}

export default function BlackjackGameControls({
  playerHands,
  dealerHand,
  playerTotals,
  dealerTotal,
  onHit,
  onStand,
  onDouble,
  canHit,
  canDouble,
  disabled,
  gameOver,
}: BlackjackGameControlsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-2">Dealer ({dealerTotal})</h3>
        <div className="flex justify-center gap-2">
          {dealerHand.map((card, i) => (
            <div key={i} className="w-16 h-24 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center">
              <span className="text-2xl">{card.rank}</span>
              <span className="text-xl">{card.suit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-bold mb-2">Your Hand ({playerTotals[0]})</h3>
        <div className="flex justify-center gap-2">
          {playerHands[0]?.map((card, i) => (
            <div key={i} className="w-16 h-24 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center">
              <span className="text-2xl">{card.rank}</span>
              <span className="text-xl">{card.suit}</span>
            </div>
          ))}
        </div>
      </div>

      {!gameOver && (
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={onHit}
            disabled={disabled || !canHit}
            className="btn-primary py-3 disabled:opacity-50"
          >
            Hit
          </button>
          <button
            onClick={onStand}
            disabled={disabled}
            className="btn-secondary py-3 disabled:opacity-50"
          >
            Stand
          </button>
          <button
            onClick={onDouble}
            disabled={disabled || !canDouble}
            className="btn-primary py-3 disabled:opacity-50"
          >
            Double
          </button>
        </div>
      )}
    </div>
  );
}
