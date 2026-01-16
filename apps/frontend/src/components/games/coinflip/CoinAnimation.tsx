'use client';

import { useState, useEffect } from 'react';

interface CoinAnimationProps {
  result?: 'heads' | 'tails' | null;
  isFlipping: boolean;
  seriesResults?: Array<{ result: 'heads' | 'tails'; won: boolean }>;
}

export default function CoinAnimation({ result, isFlipping, seriesResults }: CoinAnimationProps) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isFlipping) {
      setAnimationKey(prev => prev + 1);
    }
  }, [isFlipping]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main Coin */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div
          key={animationKey}
          className={`coin ${isFlipping ? 'flipping' : ''} ${result ? `result-${result}` : ''}`}
        >
          <div className="coin-face heads">🪙</div>
          <div className="coin-face tails">🔵</div>
        </div>
      </div>

      {/* Result Display */}
      {result && !isFlipping && (
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {result === 'heads' ? '🪙 HEADS' : '🔵 TAILS'}
          </div>
        </div>
      )}

      {/* Series Results */}
      {seriesResults && seriesResults.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 max-w-md">
          {seriesResults.map((flip, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${
                flip.won 
                  ? 'bg-green-900/20 border-green-500 text-green-400' 
                  : 'bg-red-900/20 border-red-500 text-red-400'
              }`}
            >
              {flip.result === 'heads' ? '🪙' : '🔵'}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .coin {
          width: 120px;
          height: 120px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.1s;
        }

        .coin-face {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          border-radius: 50%;
          backface-visibility: hidden;
          border: 4px solid #FFC100;
        }

        .heads {
          background: linear-gradient(45deg, #FFC100, #FFD700);
        }

        .tails {
          background: linear-gradient(45deg, #4A90E2, #357ABD);
          transform: rotateY(180deg);
        }

        .flipping {
          animation: coinFlip 2s ease-in-out;
        }

        .result-heads {
          transform: rotateY(0deg);
        }

        .result-tails {
          transform: rotateY(180deg);
        }

        @keyframes coinFlip {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          25% { transform: rotateY(450deg) rotateX(180deg) scale(1.1); }
          50% { transform: rotateY(900deg) rotateX(360deg) scale(1.2); }
          75% { transform: rotateY(1350deg) rotateX(540deg) scale(1.1); }
          100% { 
            transform: rotateY(1800deg) rotateX(720deg) scale(1);
          }
        }

        .coin.result-heads {
          animation: coinFlip 2s ease-in-out forwards;
        }

        .coin.result-tails {
          animation: coinFlipTails 2s ease-in-out forwards;
        }

        @keyframes coinFlipTails {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          25% { transform: rotateY(450deg) rotateX(180deg) scale(1.1); }
          50% { transform: rotateY(900deg) rotateX(360deg) scale(1.2); }
          75% { transform: rotateY(1350deg) rotateX(540deg) scale(1.1); }
          100% { 
            transform: rotateY(1980deg) rotateX(720deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
}