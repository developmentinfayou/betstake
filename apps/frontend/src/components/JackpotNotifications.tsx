'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface JackpotWinner {
  userId: string;
  username?: string;
  amount: number;
  currency: string;
  gameType: string;
  timestamp: Date;
}

export default function JackpotNotifications() {
  const [winners, setWinners] = useState<JackpotWinner[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('jackpot-won', (data: JackpotWinner) => {
      setWinners(prev => [data, ...prev].slice(0, 5));
      setShowNotification(true);
      
      // Play sound (optional)
      try {
        const audio = new Audio('/sounds/jackpot-win.mp3');
        audio.play().catch(() => {});
      } catch (error) {}
      
      // Hide after 10 seconds
      setTimeout(() => setShowNotification(false), 10000);
    });

    return () => {
      socket.off('jackpot-won');
    };
  }, [socket]);

  if (!showNotification || winners.length === 0) return null;

  const latestWinner = winners[0];

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-[3px] shadow-2xl">
        <div className="bg-gray-900 rounded-lg p-6 min-w-[320px]">
          {/* Confetti Animation */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2 animate-bounce">🎰💰🎉</div>
              <div className="text-2xl font-bold text-yellow-400 animate-pulse">
                JACKPOT WON!
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-lg font-bold text-white">
                {latestWinner.username || 'Anonymous'}
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                ${latestWinner.amount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">
                on {latestWinner.gameType}
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-xs text-gray-500">
                Congratulations! 🎊
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowNotification(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Recent Winners Ticker */}
      {winners.length > 1 && (
        <div className="mt-2 bg-gray-900 rounded-lg p-2 text-xs">
          <div className="text-gray-400 mb-1">Recent Jackpot Winners:</div>
          {winners.slice(1, 4).map((winner, idx) => (
            <div key={idx} className="flex justify-between text-gray-300 py-1">
              <span>{winner.username || 'Anonymous'}</span>
              <span className="text-yellow-500">${winner.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}