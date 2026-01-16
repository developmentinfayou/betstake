'use client';

import { useState, useEffect } from 'react';
import { betAPI, walletAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAutoBetSocket } from '@/hooks/useAutoBetSocket';
import BetModeSelector from '@/components/betting/BetModeSelector';
import ManualBetControls from '@/components/betting/ManualBetControls';
import AutoBetControls, { AutoBetConfig } from '@/components/betting/AutoBetControls';
import SoloCrashGameControls, { SoloCrashGameParams } from '@/components/games/solocrash/SoloCrashGameControls';
import FairnessModal from '@/components/games/FairnessModal';

type BetMode = 'manual' | 'auto' | 'strategy';

export default function SoloCrashPage() {
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [amount, setAmount] = useState(10);
  const [gameParams, setGameParams] = useState<SoloCrashGameParams>({ mode: 'quick', targetMultiplier: 2.0 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ profit: 0, wins: 0, losses: 0, wagered: 0 });
  const [autoBetActive, setAutoBetActive] = useState(false);
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>();

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

  const placeBet = async () => {
    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const response = await betAPI.place({ gameType: 'SOLOCRASH', currency: 'USD', amount, gameParams });
      const { bet, result: gameResult } = response.data;
      setResult(gameResult.result || gameResult);

      if (gameResult.won) {
        toast.success(`Won $${gameResult.profit.toFixed(2)}!`);
        setStats(s => ({ ...s, wins: s.wins + 1, profit: s.profit + gameResult.profit, wagered: s.wagered + amount }));
      } else {
        toast.error(`Crashed at ${gameResult.result.crashPoint}x`);
        setStats(s => ({ ...s, losses: s.losses + 1, profit: s.profit - amount, wagered: s.wagered + amount }));
      }

      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Bet failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAutoBet = async (config: AutoBetConfig) => {
    try {
      await betAPI.startAutobet({ gameType: 'SOLOCRASH', currency: 'USD', amount, gameParams, config });
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

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">← Solo Crash</Link>
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
              <h2 className="text-2xl font-bold mb-6">Solo Crash</h2>

              {result && (
                <div className={`mb-6 p-6 rounded-lg text-center ${result.won ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'}`}>
                  <div className="text-6xl font-bold mb-2">{result.crashPoint.toFixed(2)}x</div>
                  <div className="text-2xl mb-2">{result.won ? '🎉 WIN!' : '💥 CRASHED'}</div>
                  {result.targetMultiplier && (
                    <div className="text-sm text-gray-400">Target: {result.targetMultiplier.toFixed(2)}x</div>
                  )}
                </div>
              )}

              <SoloCrashGameControls onChange={setGameParams} disabled={loading || autoBetActive} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <BetModeSelector mode={betMode} onChange={setBetMode} showStrategy={true} />
              {betMode === 'manual' && (
                <ManualBetControls amount={amount} balance={balance} onAmountChange={setAmount} onBet={placeBet} disabled={autoBetActive} loading={loading} multiplier={gameParams.targetMultiplier} />
              )}
              {betMode === 'auto' && (
                <AutoBetControls amount={amount} balance={balance} onAmountChange={setAmount} onStart={handleStartAutoBet} onStop={handleStopAutoBet} isActive={autoBetActive} disabled={loading || amount <= 0 || amount > balance} />
              )}
              {betMode === 'strategy' && (<div className="text-center py-8 text-gray-400">Strategy mode coming soon...</div>)}
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
