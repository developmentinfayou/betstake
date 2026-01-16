'use client';

import { useState, useEffect } from 'react';
import { walletAPI, stairsAPI, betAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAutoBetSocket } from '@/hooks/useAutoBetSocket';
import BetModeSelector from '@/components/betting/BetModeSelector';
import ManualBetControls from '@/components/betting/ManualBetControls';
import AutoBetControls, { AutoBetConfig } from '@/components/betting/AutoBetControls';
import StairsGameControls, { StairsGameParams } from '@/components/games/stairs/StairsGameControls';
import FairnessModal from '@/components/games/FairnessModal';

type BetMode = 'manual' | 'auto';

export default function StairsPage() {
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [amount, setAmount] = useState(10);
  const [gameParams, setGameParams] = useState<StairsGameParams>({ steps: 10 });
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ profit: 0, wins: 0, losses: 0, wagered: 0 });
  const [autoBetActive, setAutoBetActive] = useState(false);
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>();

  const [gameActive, setGameActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [dangerTiles, setDangerTiles] = useState<number[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    loadBalance();
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
      const response = await stairsAPI.start({
        steps: gameParams.steps,
        betAmount: amount,
        currency: 'USD',
      });

      setSessionId(response.data.sessionId);
      setCurrentMultiplier(response.data.currentMultiplier);
      setGameActive(true);
      setRevealedTiles([]);
      setDangerTiles([]);
      setGameOver(false);
      toast.success('Game started!');
      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const revealTile = async (tileIndex: number) => {
    if (!sessionId || revealedTiles.includes(tileIndex) || gameOver) return;

    setLoading(true);
    try {
      const response = await stairsAPI.reveal({
        sessionId,
        tileIndex,
      });

      if (response.data.safe) {
        setRevealedTiles(response.data.revealedTiles);
        setCurrentMultiplier(response.data.currentMultiplier);
        toast.success(`Safe! ${response.data.currentMultiplier.toFixed(2)}x`);
      } else {
        setGameOver(true);
        setGameActive(false);
        setDangerTiles([tileIndex]);
        toast.error('Hit danger! Game over');
        setStats(s => ({ ...s, losses: s.losses + 1, profit: s.profit - amount, wagered: s.wagered + amount }));
        await loadBalance();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reveal tile');
    } finally {
      setLoading(false);
    }
  };

  const cashOut = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await stairsAPI.cashout({ sessionId });
      
      toast.success(`Cashed out! Won $${response.data.profit.toFixed(2)}`);
      setGameActive(false);
      setGameOver(true);
      
      const grid = response.data.grid;
      const dangers = grid.map((isDanger: boolean, idx: number) => isDanger ? idx : -1).filter((idx: number) => idx !== -1);
      setDangerTiles(dangers);
      
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
        gameType: 'STAIRS',
        currency: 'USD',
        amount,
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

  const resetGame = () => {
    setGameActive(false);
    setGameOver(false);
    setRevealedTiles([]);
    setDangerTiles([]);
    setSessionId(null);
    setCurrentMultiplier(1);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">← Stairs</Link>
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
              <h2 className="text-2xl font-bold mb-6">Stairs</h2>

              {gameActive && (
                <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500 rounded-lg text-center">
                  <div className="text-sm text-gray-400">Current Multiplier</div>
                  <div className="text-3xl font-bold text-primary">{currentMultiplier.toFixed(2)}x</div>
                  <div className="text-sm text-gray-400 mt-1">Potential Win: ${(amount * currentMultiplier).toFixed(2)}</div>
                </div>
              )}

              <StairsGameControls
                onChange={setGameParams}
                disabled={loading || gameActive}
                revealedTiles={revealedTiles}
                dangerTiles={dangerTiles}
                onTileClick={gameActive ? revealTile : undefined}
              />

              {gameActive && !gameOver && revealedTiles.length > 0 && (
                <button
                  onClick={cashOut}
                  disabled={loading}
                  className="btn-primary w-full py-3 mt-4"
                >
                  Cash Out ${(amount * currentMultiplier).toFixed(2)}
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
