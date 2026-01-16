'use client';

import { useState, useEffect } from 'react';
import { betAPI, walletAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAutoBetSocket } from '@/hooks/useAutoBetSocket';
import BetModeSelector from '@/components/betting/BetModeSelector';
import ManualBetControls from '@/components/betting/ManualBetControls';
import AutoBetControls, { AutoBetConfig } from '@/components/betting/AutoBetControls';
import RouletteGameControls, { RouletteGameParams } from '@/components/games/roulette/RouletteGameControls';
import FairnessModal from '@/components/games/FairnessModal';

type BetMode = 'manual' | 'auto' | 'strategy';

export default function RoulettePage() {
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [amount, setAmount] = useState(10);
  const [autoBetActive, setAutoBetActive] = useState(false);
  const [gameParams, setGameParams] = useState<RouletteGameParams>({ bets: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ profit: 0, wins: 0, losses: 0, wagered: 0 });
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>();

  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  useEffect(() => {
    loadBalance();
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }
  }, []);

  useAutoBetSocket(userId, (data) => {
    setResult(data.bet.result);
    if (data.wallet) setBalance(data.wallet.balance);
    if (data.bet.won) {
      setStats(s => ({ ...s, wins: s.wins + 1, profit: s.profit + data.bet.profit, wagered: s.wagered + data.bet.amount }));
    } else {
      setStats(s => ({ ...s, losses: s.losses + 1, profit: s.profit + data.bet.profit, wagered: s.wagered + data.bet.amount }));
    }
  });

  const loadBalance = async () => {
    try {
      const response = await walletAPI.getAll();
      const usdWallet = response.data.find((w: any) => w.currency === 'USD');
      setBalance(usdWallet?.balance || 0);
    } catch (error) {
      console.error('Failed to load balance');
    }
  };

  // Calculate average multiplier for roulette bets
  const getRouletteMultiplier = () => {
    if (gameParams.bets.length === 0) return 0;
    const totalAmount = gameParams.bets.reduce((sum, b) => sum + b.amount, 0);
    if (totalAmount === 0) return 0;
    // Calculate weighted average multiplier
    const weightedSum = gameParams.bets.reduce((sum, bet) => {
      const multipliers: Record<string, number> = {
        straight: 35, split: 17, street: 11, corner: 8,
        line: 5, dozen: 2, column: 2, red: 1, black: 1,
        even: 1, odd: 1, low: 1, high: 1
      };
      return sum + (bet.amount * (multipliers[bet.type] || 1));
    }, 0);
    return weightedSum / totalAmount;
  };

  const placeBet = async () => {
    if (gameParams.bets.length === 0) {
      toast.error('Place at least one bet');
      return;
    }

    const totalBet = gameParams.bets.reduce((sum, b) => sum + b.amount, 0);
    if (totalBet > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const response = await betAPI.place({ gameType: 'ROULETTE', currency: 'USD', amount: totalBet, gameParams });
      const { bet, result: gameResult } = response.data;
      setResult(gameResult.result || gameResult);

      if (gameResult.won) {
        toast.success(`Won $${gameResult.profit.toFixed(2)}!`);
        setStats(s => ({ ...s, wins: s.wins + 1, profit: s.profit + gameResult.profit, wagered: s.wagered + totalBet }));
      } else {
        toast.error(`Lost $${totalBet}`);
        setStats(s => ({ ...s, losses: s.losses + 1, profit: s.profit - totalBet, wagered: s.wagered + totalBet }));
      }

      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Bet failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAutoBet = async (config: AutoBetConfig) => {
    if (gameParams.bets.length === 0) {
      toast.error('Place at least one bet first');
      return;
    }
    try {
      await betAPI.startAutobet({
        gameType: 'ROULETTE',
        currency: 'USD',
        amount: gameParams.bets.reduce((sum, b) => sum + b.amount, 0),
        gameParams,
        config,
      });
      setAutoBetActive(true);
      toast.success('Auto-bet started');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start auto-bet');
    }
  };

  const handleStopAutoBet = async () => {
    try {
      await betAPI.stopAutobet();
      setAutoBetActive(false);
      toast.success('Auto-bet stopped');
      await loadBalance();
    } catch (error: any) {
      toast.error('Failed to stop auto-bet');
    }
  };

  const getNumberColor = (num: number) => {
    if (num === 0) return 'green';
    return redNumbers.includes(num) ? 'red' : 'black';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">← Roulette</Link>
          <div className="flex items-center gap-4">
            <button onClick={() => setFairnessModalOpen(true)} className="btn-secondary px-4 py-2">🎲 Fairness</button>
            <div className="text-right">
              <div className="text-sm text-gray-400">Balance</div>
              <div className="text-xl font-bold text-primary">${balance.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Roulette</h2>

              {result && (
                <div className={`mb-6 p-6 rounded-lg text-center ${result.totalPayout > 0 ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'}`}>
                  <div className={`text-6xl font-bold mb-2 w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                    getNumberColor(result.number) === 'green' ? 'bg-green-600' :
                    getNumberColor(result.number) === 'red' ? 'bg-red-600' : 'bg-gray-900'
                  } text-white`}>
                    {result.number}
                  </div>
                  <div className="text-2xl mb-2 capitalize">{getNumberColor(result.number)}</div>
                  <div className="text-xl">{result.totalPayout > 0 ? `Won $${result.totalPayout.toFixed(2)}` : 'Lost'}</div>
                  {result.winningBets.length > 0 && (
                    <div className="text-sm text-gray-400 mt-2">{result.winningBets.length} winning bet(s)</div>
                  )}
                </div>
              )}

              <RouletteGameControls onChange={setGameParams} disabled={loading || autoBetActive} amount={amount} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <BetModeSelector
                mode={betMode}
                onChange={setBetMode}
                showStrategy={false}
              />

              {betMode === 'manual' && (
                <ManualBetControls
                  amount={gameParams.bets.reduce((sum, b) => sum + b.amount, 0) || amount}
                  balance={balance}
                  onAmountChange={() => {}}
                  onBet={placeBet}
                  disabled={autoBetActive || gameParams.bets.length === 0}
                  loading={loading}
                  multiplier={getRouletteMultiplier()}
                />
              )}

              {betMode === 'auto' && (
                <AutoBetControls
                  amount={gameParams.bets.reduce((sum, b) => sum + b.amount, 0) || amount}
                  balance={balance}
                  onAmountChange={() => {}}
                  onStart={handleStartAutoBet}
                  onStop={handleStopAutoBet}
                  isActive={autoBetActive}
                  disabled={loading || gameParams.bets.length === 0}
                />
              )}
            </div>

            {autoBetActive && (
              <div className="card bg-blue-900/20 border border-blue-500">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Auto-Bet Active</div>
                  <div className="text-lg font-bold">Running...</div>
                </div>
              </div>
            )}

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Live Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-gray-400">Profit/Loss</span><span className={stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}>${stats.profit.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Wins</span><span className="text-green-500">{stats.wins}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Losses</span><span className="text-red-500">{stats.losses}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Wagered</span><span>${stats.wagered.toFixed(2)}</span></div>
                <button onClick={() => setStats({ profit: 0, wins: 0, losses: 0, wagered: 0 })} className="btn-secondary w-full mt-4">Reset Stats</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FairnessModal isOpen={fairnessModalOpen} onClose={() => setFairnessModalOpen(false)} />
    </div>
  );
}
