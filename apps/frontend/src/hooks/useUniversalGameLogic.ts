'use client';

import { useState, useEffect, useCallback } from 'react';
import { betAPI, walletAPI } from '@/lib/api';
import { useAutoBetSocket } from '@/hooks/useAutoBetSocket';
import toast from 'react-hot-toast';
import { GameType } from '@casino/shared';

export interface GameStats {
  profit: number;
  wins: number;
  losses: number;
  wagered: number;
}

export interface UseUniversalGameLogicProps {
  gameType: GameType;
  currency?: string;
  initialAmount?: number;
}

export function useUniversalGameLogic({ 
  gameType, 
  currency = 'USD',
  initialAmount = 10 
}: UseUniversalGameLogicProps) {
  // Common state across all games
  const [amount, setAmount] = useState(initialAmount);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState<GameStats>({ profit: 0, wins: 0, losses: 0, wagered: 0 });
  const [autoBetActive, setAutoBetActive] = useState(false);
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>();

  // Initialize user and balance
  useEffect(() => {
    loadBalance();
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }
  }, []);

  // Socket.IO for AutoBet - unified across all games
  useAutoBetSocket(userId, (data) => {
    console.log(`${gameType} AutoBet result:`, data);
    setResult(data.bet.result);
    if (data.wallet) setBalance(data.wallet.balance);
    
    updateStats(data.bet.amount, data.bet.profit, data.bet.won);
  });

  // Unified balance loading
  const loadBalance = useCallback(async () => {
    try {
      const response = await walletAPI.getAll();
      const wallet = response.data.find((w: any) => w.currency === currency);
      setBalance(wallet?.balance || 0);
    } catch (error) {
      console.error('Failed to load balance');
    }
  }, [currency]);

  // Unified stats update
  const updateStats = useCallback((betAmount: number, profit: number, won: boolean) => {
    setStats(s => ({
      ...s,
      wins: won ? s.wins + 1 : s.wins,
      losses: won ? s.losses : s.losses + 1,
      profit: s.profit + profit,
      wagered: s.wagered + betAmount
    }));
  }, []);

  // Unified bet placement
  const placeBet = useCallback(async (gameParams: any) => {
    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const response = await betAPI.place({
        gameType,
        currency,
        amount,
        gameParams,
      });

      const { bet, result: gameResult } = response.data;
      setResult(gameResult.result || gameResult);

      if (gameResult.won) {
        toast.success(`Won $${gameResult.profit.toFixed(2)}!`);
      } else {
        toast.error(`Lost $${amount}`);
      }

      updateStats(amount, gameResult.profit, gameResult.won);
      await loadBalance();
      
      return gameResult;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Bet failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [gameType, currency, amount, balance, updateStats, loadBalance]);

  // Unified autobet start
  const startAutoBet = useCallback(async (gameParams: any, config: any) => {
    try {
      await betAPI.startAutobet({
        gameType,
        currency,
        amount,
        gameParams,
        config,
      });
      setAutoBetActive(true);
      toast.success('Auto-bet started - Real-time updates enabled');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start auto-bet');
      throw error;
    }
  }, [gameType, currency, amount]);

  // Unified autobet stop
  const stopAutoBet = useCallback(async () => {
    try {
      await betAPI.stopAutobet();
      setAutoBetActive(false);
      toast.success('Auto-bet stopped');
      await loadBalance();
    } catch (error: any) {
      toast.error('Failed to stop auto-bet');
      throw error;
    }
  }, [loadBalance]);

  // Unified stats reset
  const resetStats = useCallback(() => {
    setStats({ profit: 0, wins: 0, losses: 0, wagered: 0 });
  }, []);

  return {
    // State
    amount,
    loading,
    result,
    balance,
    stats,
    autoBetActive,
    fairnessModalOpen,
    userId,
    
    // Actions
    setAmount,
    setResult,
    placeBet,
    startAutoBet,
    stopAutoBet,
    resetStats,
    setFairnessModalOpen,
    loadBalance,
    
    // Computed
    canBet: amount > 0 && amount <= balance && !loading && !autoBetActive,
  };
}