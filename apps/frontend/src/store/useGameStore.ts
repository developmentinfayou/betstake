import { create } from 'zustand';
import { betAPI } from '@/lib/api';

interface GameState {
  currentGame: string | null;
  betAmount: number;
  currency: string;
  isAutoBet: boolean;
  autoBetConfig: any;
  liveStats: {
    profit: number;
    wins: number;
    losses: number;
    wagered: number;
  };
  setCurrentGame: (game: string) => void;
  setBetAmount: (amount: number) => void;
  setCurrency: (currency: string) => void;
  placeBet: (gameParams: any) => Promise<any>;
  resetStats: () => void;
  updateStats: (won: boolean, amount: number, profit: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentGame: null,
  betAmount: 10,
  currency: 'USD',
  isAutoBet: false,
  autoBetConfig: null,
  liveStats: {
    profit: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
  },

  setCurrentGame: (game) => set({ currentGame: game }),
  
  setBetAmount: (amount) => set({ betAmount: amount }),
  
  setCurrency: (currency) => set({ currency }),

  placeBet: async (gameParams) => {
    const { currentGame, betAmount, currency } = get();
    
    const response = await betAPI.place({
      gameType: currentGame,
      amount: betAmount,
      currency,
      gameParams,
    });

    const { bet, result } = response.data;
    
    // Update stats
    get().updateStats(result.won, betAmount, result.profit);

    return { bet, result };
  },

  resetStats: () => set({
    liveStats: {
      profit: 0,
      wins: 0,
      losses: 0,
      wagered: 0,
    },
  }),

  updateStats: (won, amount, profit) => set((state) => ({
    liveStats: {
      profit: state.liveStats.profit + profit,
      wins: state.liveStats.wins + (won ? 1 : 0),
      losses: state.liveStats.losses + (won ? 0 : 1),
      wagered: state.liveStats.wagered + amount,
    },
  })),
}));
