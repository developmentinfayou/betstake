'use client';

import { useState, useEffect } from 'react';
import { betAPI, walletAPI, minesAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAutoBetSocket } from '@/hooks/useAutoBetSocket';
import BetModeSelector from '@/components/betting/BetModeSelector';
import ManualBetControls from '@/components/betting/ManualBetControls';
import AutoBetControls, { AutoBetConfig } from '@/components/betting/AutoBetControls';
import MinesGameControls, { MinesGameParams } from '@/components/games/mines/MinesGameControls';
import FairnessModal from '@/components/games/FairnessModal';

type BetMode = 'manual' | 'auto';

export default function MinesPage() {
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [amount, setAmount] = useState(10);
  const [gameParams, setGameParams] = useState<MinesGameParams>({
    minesCount: 3,
    selectedTiles: [],
  });
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ profit: 0, wins: 0, losses: 0, wagered: 0 });
  const [autoBetActive, setAutoBetActive] = useState(false);
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>();

  // Manual mode state
  const [gameActive, setGameActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [mineTiles, setMineTiles] = useState<number[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    loadBalance();
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }
    
    // Clean up any active session on page load
    return () => {
      if (sessionId && gameActive) {
        // Attempt to clean up session on unmount
        minesAPI.cashout({ sessionId }).catch(() => {});
      }
    };
  }, []);

  useAutoBetSocket(userId, (data) => {
    // Enhanced feedback for Mines autobet
    if (data.bet.gameType === 'MINES') {
      const result = data.bet.result;
      const roundNum = data.stats?.currentBet || 'Unknown';
      
      if (result.hitMine) {
        toast.error(`Round ${roundNum}: Mine hit! -$${data.bet.amount}`);
      } else {
        toast.success(`Round ${roundNum}: All safe! +$${data.bet.profit.toFixed(2)}`);
      }
    }
    
    if (data.wallet) setBalance(data.wallet.balance);
    
    if (data.bet.won) {
      setStats(s => ({ 
        ...s, 
        wins: s.wins + 1, 
        profit: s.profit + data.bet.profit, 
        wagered: s.wagered + data.bet.amount 
      }));
    } else {
      setStats(s => ({ 
        ...s, 
        losses: s.losses + 1, 
        profit: s.profit + data.bet.profit, 
        wagered: s.wagered + data.bet.amount 
      }));
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

  const startManualGame = async () => {
    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const response = await minesAPI.start({
        minesCount: gameParams.minesCount,
        betAmount: amount,
        currency: 'USD',
        gridSize: 25,
      });

      setSessionId(response.data.sessionId);
      setCurrentMultiplier(response.data.currentMultiplier);
      setGameActive(true);
      setRevealedTiles([]);
      setMineTiles([]);
      setGameOver(false);
      toast.success('Game started!');
      await loadBalance();
    } catch (error: any) {
      if (error.response?.data?.error === 'Active game exists. Cash out first.') {
        // Try to cleanup and restart
        try {
          await minesAPI.cleanup();
          toast.info('Cleaned up previous session, starting new game...');
          // Retry starting the game
          const response = await minesAPI.start({
            minesCount: gameParams.minesCount,
            betAmount: amount,
            currency: 'USD',
            gridSize: 25,
          });
          
          setSessionId(response.data.sessionId);
          setCurrentMultiplier(response.data.currentMultiplier);
          setGameActive(true);
          setRevealedTiles([]);
          setMineTiles([]);
          setGameOver(false);
          toast.success('Game started!');
          await loadBalance();
        } catch (retryError: any) {
          toast.error(retryError.response?.data?.error || 'Failed to start game after cleanup');
        }
      } else {
        toast.error(error.response?.data?.error || 'Failed to start game');
      }
    } finally {
      setLoading(false);
    }
  };

  const revealTile = async (tileIndex: number) => {
    if (!sessionId || revealedTiles.includes(tileIndex) || gameOver) return;

    setLoading(true);
    try {
      const response = await minesAPI.reveal({
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
        setMineTiles([tileIndex]);
        toast.error('Hit a mine! Game over');
        setStats(s => ({ ...s, losses: s.losses + 1, profit: s.profit - amount, wagered: s.wagered + amount }));
        await loadBalance();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reveal tile');
    } finally {
      setLoading(false);
    }
  };

  const randomReveal = async () => {
    if (!sessionId || gameOver) return;

    setLoading(true);
    try {
      const response = await minesAPI.randomReveal({ sessionId });

      if (response.data.safe) {
        setRevealedTiles(response.data.revealedTiles);
        setCurrentMultiplier(response.data.currentMultiplier);
        toast.success(`Random pick safe! ${response.data.currentMultiplier.toFixed(2)}x`);
      } else {
        setGameOver(true);
        setGameActive(false);
        setMineTiles([response.data.tileIndex]);
        toast.error('Random pick hit a mine! Game over');
        setStats(s => ({ ...s, losses: s.losses + 1, profit: s.profit - amount, wagered: s.wagered + amount }));
        await loadBalance();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reveal random tile');
    } finally {
      setLoading(false);
    }
  };

  const cashOut = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await minesAPI.cashout({ sessionId });
      
      toast.success(`Cashed out! Won $${response.data.profit.toFixed(2)}`);
      setGameActive(false);
      setGameOver(true);
      
      const grid = response.data.grid;
      const mines = grid.map((isMine: boolean, idx: number) => isMine ? idx : -1).filter((idx: number) => idx !== -1);
      setMineTiles(mines);
      
      setStats(s => ({ ...s, wins: s.wins + 1, profit: s.profit + response.data.profit, wagered: s.wagered + amount }));
      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cash out');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAutoBet = async (config: AutoBetConfig) => {
    if (gameParams.selectedTiles.length === 0) {
      toast.error('Select tiles for autobet by clicking on the grid in Auto mode');
      return;
    }

    if (gameParams.selectedTiles.length > 20) {
      toast.error('Maximum 20 tiles allowed for autobet');
      return;
    }

    const safeTiles = 25 - gameParams.minesCount;
    if (gameParams.selectedTiles.length > safeTiles) {
      toast.error(`Cannot select more tiles than safe tiles available (${safeTiles})`);
      return;
    }

    try {
      await betAPI.startAutobet({
        gameType: 'MINES',
        currency: 'USD',
        amount,
        gameParams: { 
          minesCount: gameParams.minesCount, 
          selectedTiles: gameParams.selectedTiles,
          gridSize: 25
        },
        config,
      });
      setAutoBetActive(true);
      toast.success(`AutoBet started: ${gameParams.selectedTiles.length} tiles, ${config.numberOfBets || '∞'} rounds`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start autobet');
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
    setMineTiles([]);
    setSessionId(null);
    setCurrentMultiplier(1);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">← Mines</Link>
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
              <h2 className="text-2xl font-bold mb-6">Mines</h2>

              {gameActive && betMode === 'manual' && (
                <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-400">Current Multiplier</div>
                    <div className="text-2xl font-bold text-primary">{currentMultiplier.toFixed(2)}x</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Total Profit ({currentMultiplier.toFixed(2)}x)</div>
                    <div className="text-xl font-bold text-green-500">${(amount * currentMultiplier).toFixed(2)}</div>
                  </div>
                </div>
              )}

              <MinesGameControls
                onChange={setGameParams}
                disabled={loading}
                isAutoMode={betMode === 'auto'}
                revealedTiles={revealedTiles}
                mineTiles={mineTiles}
                onTileClick={betMode === 'manual' ? revealTile : undefined}
                gameActive={gameActive}
                gemsFound={revealedTiles.filter(t => !mineTiles.includes(t)).length}
                autoBetActive={autoBetActive}
              />

              {gameActive && betMode === 'manual' && !gameOver && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={cashOut}
                    disabled={loading || revealedTiles.length === 0}
                    className="btn-primary flex-1 py-3"
                  >
                    Cashout ${(amount * currentMultiplier).toFixed(2)}
                  </button>
                  <button
                    onClick={randomReveal}
                    disabled={loading}
                    className="btn-secondary px-6 py-3"
                  >
                    Random Pick
                  </button>
                </div>
              )}

              {gameOver && betMode === 'manual' && (
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
                onChange={(mode) => {
                  setBetMode(mode as BetMode);
                  resetGame();
                }}
                showStrategy={false}
              />

              {betMode === 'manual' && !gameActive && (
                <ManualBetControls
                  amount={amount}
                  balance={balance}
                  onAmountChange={setAmount}
                  onBet={startManualGame}
                  disabled={autoBetActive}
                  loading={loading}
                  buttonText="Bet"
                />
              )}

              {betMode === 'auto' && (
                <AutoBetControls
                  amount={amount}
                  balance={balance}
                  onAmountChange={setAmount}
                  onStart={handleStartAutoBet}
                  onStop={handleStopAutoBet}
                  isActive={autoBetActive}
                  disabled={loading || amount <= 0 || amount > balance}
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
