'use client';

interface GameResultProps {
  result: any;
  amount: number;
  gameType: string;
  multiplier?: number;
  customDisplay?: (result: any) => React.ReactNode;
}

export default function GameResult({ 
  result, 
  amount, 
  gameType, 
  multiplier,
  customDisplay 
}: GameResultProps) {
  if (!result) return null;

  const isWin = result.won || result.win;
  const profit = result.profit || (isWin ? (amount * (multiplier || result.multiplier || 2) - amount) : -amount);

  return (
    <div className={`mb-6 p-6 rounded-lg text-center ${
      isWin ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'
    }`}>
      {customDisplay ? (
        customDisplay(result)
      ) : (
        <>
          <div className="text-6xl font-bold mb-2">
            {gameType === 'DICE' && result.roll}
            {gameType === 'LIMBO' && `${(result.result || result.multiplier || 0).toFixed(2)}x`}
            {gameType === 'MINES' && (isWin ? '💎' : '💣')}
            {gameType === 'PLINKO' && `${(result.multiplier || 1).toFixed(2)}x`}
            {!['DICE', 'LIMBO', 'MINES', 'PLINKO'].includes(gameType) && (isWin ? '🎉' : '😢')}
          </div>
          <div className="text-2xl mb-2">
            {isWin ? '🎉 WIN!' : '😢 LOST'}
          </div>
          <div className="text-xl">
            {isWin ? `+$${profit.toFixed(2)}` : `-$${amount.toFixed(2)}`}
          </div>
          {result.target && (
            <div className="text-sm text-gray-400 mt-2">
              Target: {result.target.toFixed(2)}
            </div>
          )}
        </>
      )}
    </div>
  );
}