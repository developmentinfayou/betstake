'use client';

import { useState, useEffect } from 'react';
import { walletAPI, hiloAPI, betAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAutoBetSocket } from '@/hooks/useAutoBetSocket';
import BetModeSelector from '@/components/betting/BetModeSelector';
import ManualBetControls from '@/components/betting/ManualBetControls';
import AutoBetControls, { AutoBetConfig } from '@/components/betting/AutoBetControls';
import HiLoGameControls from '@/components/games/hilo/HiLoGameControls';
import FairnessModal from '@/components/games/FairnessModal';

type BetMode = 'manual' | 'auto';

export default function HiLoPage() {
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ profit: 0, wins: 0, losses: 0, wagered: 0 });
  const [autoBetActive, setAutoBetActive] = useState(false);
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>();

  const [gameActive, setGameActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState<number | undefined>();
  const [cardHistory, setCardHistory] = useState<number[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    loadBalance();
    clearActiveSessions(); // Clear any existing sessions
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }
  }, []);

  useAutoBetSocket(userId, (data) => {
    if (data.wallet) setBalance(data.wallet.balance);
    if (data.bet.won) {
      setStats(s => ({ ...s, wins: s.wins + 1, profit: s.profit + data.bet.profit, wagered: s.wagered + data.bet.amount }));
    } else {
      setStats(s => ({ ...s, losses: s.losses + 1, profit: s.profit + data.bet.profit, wagered: s.wagered + data.bet.amount }));
    }
  });

  const clearActiveSessions = async () => {
    try {
      await hiloAPI.clearSession();
    } catch (error) {
      // Ignore errors - session might not exist
    }
  };

  const loadBalance = async () => {
    try {
      const response = await walletAPI.getAll();
      const usdWallet = response.data.find((w: any) => w.currency === 'USD');
      setBalance(usdWallet?.balance || 0);
    } catch (error) {
      console.error('Failed to load balance');
    }
  };

  const startGame = async () => {
    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      // Clear any existing sessions first
      await clearActiveSessions();
      
      const response = await hiloAPI.start({
        betAmount: amount,
        currency: 'USD',
      });

      setSessionId(response.data.sessionId);
      setCurrentCard(response.data.currentCard);
      setCurrentMultiplier(response.data.currentMultiplier);
      setGameActive(true);
      setCardHistory([]);
      setGameOver(false);
      toast.success('Game started!');
      await loadBalance();
    } catch (error: any) {
      console.error('Start game error:', error);
      toast.error(error.response?.data?.error || 'Failed to start game');
      // Try to clear sessions and reset state on error
      await clearActiveSessions();
      resetGame();
    } finally {
      setLoading(false);
    }
  };

  const makeChoice = async (choice: 'higher' | 'lower' | 'skip') => {
    if (!sessionId || gameOver) return;

    setLoading(true);
    try {
      const response = await hiloAPI.predict({
        sessionId,
        choice,
      });

      if (response.data.won) {
        setCurrentCard(response.data.currentCard);
        setCurrentMultiplier(response.data.currentMultiplier);
        setCardHistory(response.data.cardHistory);
        toast.success(`Correct! ${response.data.currentMultiplier.toFixed(2)}x`);
      } else {
        setGameOver(true);
        setGameActive(false);
        toast.error('Wrong prediction! Game over');
        setStats(s => ({ ...s, losses: s.losses + 1, profit: s.profit - amount, wagered: s.wagered + amount }));
        await loadBalance();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to make prediction');
    } finally {
      setLoading(false);
    }
  };

  const cashOut = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await hiloAPI.cashout({ sessionId });
      
      toast.success(`Cashed out! Won $${response.data.profit.toFixed(2)}`);
      setGameActive(false);
      setGameOver(true);
      
      setStats(s => ({ ...s, wins: s.wins + 1, profit: s.profit + response.data.profit, wagered: s.wagered + amount }));
      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cash out');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAutoBet = async (config: AutoBetConfig) => {
    try {
      await betAPI.startAutobet({
        gameType: 'HILO',
        currency: 'USD',
        amount,
        gameParams: {},
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

  const resetGame = async () => {
    try {
      await hiloAPI.clearSession();
    } catch (error) {
      // Ignore errors
    }
    setGameActive(false);
    setGameOver(false);
    setCurrentCard(undefined);
    setCardHistory([]);
    setSessionId(null);
    setCurrentMultiplier(1);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">← HiLo</Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFairnessModalOpen(true)}
              className="btn-secondary px-4 py-2"
            >
              🎲 Fairness
            </button>
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
              <h2 className="text-2xl font-bold mb-6">HiLo</h2>

              {gameActive && (
                <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500 rounded-lg text-center">
                  <div className="text-sm text-gray-400">Current Multiplier</div>
                  <div className="text-3xl font-bold text-primary">{currentMultiplier.toFixed(2)}x</div>
                  <div className="text-sm text-gray-400 mt-1">Potential Win: ${(amount * currentMultiplier).toFixed(2)}</div>
                  <div className="text-sm text-gray-400 mt-1">Cards Played: {cardHistory.length}</div>
                </div>
              )}

              <HiLoGameControls
                currentCard={currentCard}
                cardHistory={cardHistory}
                betAmount={amount}
                currentMultiplier={currentMultiplier}
                onChoice={makeChoice}
                disabled={loading || gameOver}
                gameActive={gameActive}
              />

              {gameActive && !gameOver && cardHistory.length > 0 && (
                <button
                  onClick={cashOut}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-400 text-white w-full py-3 mt-4 rounded-lg font-bold"
                >
                  Cash out → ${(amount * currentMultiplier).toFixed(2)}
                </button>
              )}

              {gameOver && (
                <button
                  onClick={resetGame}
                  className="btn-primary w-full py-3 mt-4"
                >
                  New Game
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <BetModeSelector
                mode={betMode}
                onChange={setBetMode}
                showStrategy={false}
              />

              {betMode === 'manual' && !gameActive && (
                <ManualBetControls
                  amount={amount}
                  balance={balance}
                  onAmountChange={setAmount}
                  onBet={startGame}
                  disabled={autoBetActive}
                  loading={loading}
                />
              )}

              {betMode === 'auto' && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-lg mb-2">⚠️ AutoBet Not Available</div>
                  <div className="text-sm">This game requires manual play due to its interactive nature.</div>
                </div>
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
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit/Loss</span>
                  <span className={stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                    ${stats.profit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wins</span>
                  <span className="text-green-500">{stats.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Losses</span>
                  <span className="text-red-500">{stats.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wagered</span>
                  <span>${stats.wagered.toFixed(2)}</span>
                </div>
                <button onClick={() => setStats({ profit: 0, wins: 0, losses: 0, wagered: 0 })} className="btn-secondary w-full mt-4">
                  Reset Stats
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FairnessModal
        isOpen={fairnessModalOpen}
        onClose={() => setFairnessModalOpen(false)}
      />
    </div>
  );
}
