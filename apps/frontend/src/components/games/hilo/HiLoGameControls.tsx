'use client';

import PlayingCard from './PlayingCard';
import CardHistory from './CardHistory';
import { calculateProbabilities } from '@/lib/hiloUtils';

interface HiLoGameControlsProps {
  currentCard?: number;
  cardHistory?: number[];
  betAmount?: number;
  currentMultiplier?: number;
  onChoice: (choice: 'higher' | 'lower' | 'skip') => void;
  disabled?: boolean;
  gameActive?: boolean;
}

export default function HiLoGameControls({ 
  currentCard, 
  cardHistory = [],
  betAmount = 0,
  currentMultiplier = 1,
  onChoice, 
  disabled = false,
  gameActive = false
}: HiLoGameControlsProps) {
  const probabilities = currentCard ? calculateProbabilities(currentCard, cardHistory) : null;
  
  const higherProfit = betAmount * currentMultiplier * 1.3 * 0.99;
  const lowerProfit = betAmount * currentMultiplier * 1.3 * 0.99;
  const totalProfit = betAmount * currentMultiplier;

  return (
    <div className="space-y-6">
      {/* Game State Display */}
      <div className="text-center text-gray-400 text-sm">
        {!gameActive ? "Game result will be displayed" : "Make your prediction"}
      </div>

      {/* Main Game Area */}
      <div className="relative flex items-center justify-center min-h-[400px]">
        {/* Higher Section */}
        <div className="absolute left-0 top-0 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[60px] border-r-[60px] border-b-[100px] border-l-transparent border-r-transparent border-b-yellow-500 relative">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-white font-bold text-sm">HI</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-white font-bold text-sm">Higher Or Same</div>
            {probabilities && (
              <div className="text-yellow-400 font-bold text-lg">
                {(probabilities.higherPercent + probabilities.samePercent).toFixed(2)}%
              </div>
            )}
          </div>
        </div>

        {/* Card Display */}
        <div className="flex flex-col items-center space-y-4">
          {currentCard ? (
            <PlayingCard 
              value={currentCard} 
              className="w-32 h-48"
            />
          ) : (
            <div className="w-32 h-48 bg-red-400 rounded-lg shadow-xl flex items-center justify-center border-2 border-red-500">
              <div className="text-white text-4xl">♠</div>
            </div>
          )}
          
          {gameActive && (
            <button
              onClick={() => onChoice('skip')}
              disabled={disabled}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
            >
              Skip ▶
            </button>
          )}
        </div>

        {/* Lower Section */}
        <div className="absolute right-0 top-0 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[60px] border-r-[60px] border-t-[100px] border-l-transparent border-r-transparent border-t-blue-500 relative">
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-white font-bold text-sm">LO</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-white font-bold text-sm">Lower Or Same</div>
            {probabilities && (
              <div className="text-blue-400 font-bold text-lg">
                {(probabilities.lowerPercent + probabilities.samePercent).toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Betting Buttons */}
      {gameActive && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onChoice('higher')}
            disabled={disabled}
            className="bg-yellow-600 hover:bg-yellow-500 text-white py-4 text-lg font-bold rounded-lg disabled:opacity-50"
          >
            Higher Or Same<br/>
            <span className="text-sm">{probabilities ? (probabilities.higherPercent + probabilities.samePercent).toFixed(1) : '0'}%</span>
          </button>
          <button
            onClick={() => onChoice('lower')}
            disabled={disabled}
            className="bg-blue-600 hover:bg-blue-500 text-white py-4 text-lg font-bold rounded-lg disabled:opacity-50"
          >
            Lower Or Same<br/>
            <span className="text-sm">{probabilities ? (probabilities.lowerPercent + probabilities.samePercent).toFixed(1) : '0'}%</span>
          </button>
        </div>
      )}

      {/* Profit Display */}
      <div className="grid grid-cols-3 gap-4 bg-gray-800 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 text-sm">Profit Higher {higherProfit > 0 ? `(${(higherProfit/betAmount).toFixed(3)}x)` : '0x'}</div>
          <div className="text-yellow-400 font-bold flex items-center justify-center gap-1">
            <span className="text-green-500">🇧🇩</span> ${higherProfit.toFixed(2)}
            <span className="text-yellow-400">⬆</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-sm">Profit Lower {lowerProfit > 0 ? `(${(lowerProfit/betAmount).toFixed(3)}x)` : '0x'}</div>
          <div className="text-blue-400 font-bold flex items-center justify-center gap-1">
            <span className="text-green-500">🇧🇩</span> ${lowerProfit.toFixed(2)}
            <span className="text-blue-400">⬇</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-sm">Total Profit {totalProfit > 0 ? `(${(totalProfit/betAmount).toFixed(3)}x)` : '0x'}</div>
          <div className="text-white font-bold flex items-center justify-center gap-1">
            <span className="text-green-500">🇧🇩</span> ${totalProfit.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Card History */}
      {cardHistory.length > 0 && (
        <CardHistory 
          cardHistory={cardHistory}
          className="mt-6"
        />
      )}
    </div>
  );
}
