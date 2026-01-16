import { useEffect } from 'react';
import { useSocket } from './useSocket';

interface AutoBetResult {
  bet: {
    id: string;
    gameType: string;
    amount: number;
    multiplier: number;
    payout: number;
    profit: number;
    status: string;
    result: any;
    won: boolean;
  };
  wallet: {
    balance: number;
    currency: string;
  } | null;
  stats: {
    currentBet: number;
    totalProfit: number;
    totalBets: number;
  };
}

export function useAutoBetSocket(
  userId: string | undefined,
  onResult: (result: AutoBetResult) => void
) {
  const socket = useSocket(userId);

  useEffect(() => {
    if (!socket) return;

    socket.on('autobet:result', (data: AutoBetResult) => {
      console.log('📊 AutoBet result received:', data);
      onResult(data);
    });

    return () => {
      socket.off('autobet:result');
    };
  }, [socket, onResult]);

  return socket;
}
