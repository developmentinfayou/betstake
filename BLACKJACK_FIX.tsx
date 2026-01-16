// FIXED Blackjack page with proper shared component usage

'use client';

import { useState, useEffect } from 'react';
import { walletAPI, blackjackAPI, betAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAutoBetSocket } from '@/hooks/useAutoBetSocket';
import BetModeSelector from '@/components/betting/BetModeSelector';
import ManualBetControls from '@/components/betting/ManualBetControls';
import AutoBetControls, { AutoBetConfig } from '@/components/betting/AutoBetControls';
import BlackjackGameControls from '@/components/games/blackjack/BlackjackGameControls';
import FairnessModal from '@/components/games/FairnessModal';

interface Card {
  rank: string;
  suit: string;
  value: number;
}

type BetMode = 'manual' | 'auto';

export default function BlackjackPage() {
  // ✅ ADDED: Bet mode state
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ profit: 0, wins: 0, losses: 0, wagered: 0 });
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);
  
  // ✅ ADDED: AutoBet state
  const [autoBetActive, setAutoBetActive] = useState(false);
  const [userId, setUserId] = useState<string>();

  const [gameActive, setGameActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playerHands, setPlayerHands] = useState<Card[][]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerTotals, setPlayerTotals] = useState<number[]>([]);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [canHit, setCanHit] = useState(true);
  const [canDouble, setCanDouble] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    loadBalance();
    // ✅ ADDED: Get userId for AutoBet socket
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }
  }, []);

  // ✅ ADDED: AutoBet socket support
  useAutoBetSocket(userId, (data) => {
    console.log('Blackjack AutoBet result:', data);
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

  const startGame = async () => {
    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const response = await blackjackAPI.start({
        betAmount: amount,
        currency: 'USD',
      });

      setSessionId(response.data.sessionId);
      setPlayerHands(response.data.playerHands);
      setDealerHand(response.data.dealerHand);
      setPlayerTotals(response.data.playerTotals);
      setDealerTotal(response.data.dealerTotal);
      setCanHit(response.data.canHit);
      setCanDouble(response.data.canDouble);
      setGameActive(true);
      setGameOver(false);
      toast.success('Game started!');
      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADDED: AutoBet handlers
  const handleStartAutoBet = async (config: AutoBetConfig) => {
    try {
      await betAPI.startAutobet({
        gameType: 'BLACKJACK',
        currency: 'USD',
        amount,
        gameParams: {}, // Blackjack has no game params
        config,
      });
      setAutoBetActive(true);
      toast.success('Auto-bet started - Real-time updates enabled');
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

  const handleHit = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await blackjackAPI.hit({ sessionId });

      setPlayerHands(response.data.playerHands);
      setDealerHand(response.data.dealerHand);
      setPlayerTotals(response.data.playerTotals);
      setDealerTotal(response.data.dealerTotal);
      setCanHit(response.data.canHit);
      setCanDouble(false);

      if (response.data.bust) {
        toast.error('Bust! You lose');
        setGameOver(true);
        setGameActive(false);
        setStats(s => ({ ...s, losses: s.losses + 1, profit: s.profit - amount, wagered: s.wagered + amount }));
        await loadBalance();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to hit');
    } finally {
      setLoading(false);
    }
  };

  const handleStand = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await blackjackAPI.stand({ sessionId });

      setPlayerHands(response.data.playerHands);
      setDealerHand(response.data.dealerHand);
      setPlayerTotals(response.data.playerTotals);
      setDealerTotal(response.data.dealerTotal);
      setGameOver(true);
      setGameActive(false);

      if (response.data.won) {
        toast.success(`You win! +$${response.data.profit.toFixed(2)}`);
        setStats(s => ({ ...s, wins: s.wins + 1, profit: s.profit + response.data.profit, wagered: s.wagered + amount }));
      } else if (response.data.multiplier === 1) {
        toast.info('Push! Bet returned');
        setStats(s => ({ ...s, wagered: s.wagered + amount }));
      } else {
        toast.error('Dealer wins');
        setStats(s => ({ ...s, losses: s.losses + 1, profit: s.profit - amount, wagered: s.wagered + amount }));
      }

      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to stand');
    } finally {
      setLoading(false);
    }
  };

  const handleDouble = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await blackjackAPI.double({ sessionId });

      setPlayerHands(response.data.playerHands);
      setDealerHand(response.data.dealerHand);
      setPlayerTotals(response.data.playerTotals);
      setDealerTotal(response.data.dealerTotal);
      setGameOver(true);
      setGameActive(false);

      if (response.data.won) {
        toast.success(`You win! +$${response.data.profit.toFixed(2)}`);
        setStats(s => ({ ...s, wins: s.wins + 1, profit: s.profit + response.data.profit, wagered: s.wagered + amount * 2 }));
      } else {
        toast.error('You lose');
        setStats(s => ({ ...s, losses: s.losses + 1, profit: s.profit - amount * 2, wagered: s.wagered + amount * 2 }));
      }

      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to double');
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setGameActive(false);
    setGameOver(false);
    setPlayerHands([]);
    setDealerHand([]);
    setSessionId(null);
    setCanHit(true);
    setCanDouble(true);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">← Blackjack</Link>
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
              <h2 className="text-2xl font-bold mb-6">Blackjack</h2>

              {gameActive && (
                <BlackjackGameControls
                  playerHands={playerHands}
                  dealerHand={dealerHand}
                  playerTotals={playerTotals}
                  dealerTotal={dealerTotal}
                  onHit={handleHit}
                  onStand={handleStand}
                  onDouble={handleDouble}
                  canHit={canHit}
                  canDouble={canDouble}
                  disabled={loading}
                  gameOver={gameOver}
                />
              )}

              {!gameActive && !gameOver && (
                <div className="text-center py-12 text-gray-400">
                  Place a bet to start playing
                </div>
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
            {/* ✅ FIXED: Now using shared components properly */}
            <div className="card">
              <BetModeSelector
                mode={betMode}
                onChange={setBetMode}
                showStrategy={false}
              />

              {/* Manual Bet */}
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

              {/* Auto Bet */}
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

            {/* ✅ ADDED: AutoBet Status */}
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

// ✅ CHANGES MADE:
// 1. Added BetModeSelector component
// 2. Added AutoBetControls component  
// 3. Added AutoBet state and handlers
// 4. Added AutoBet socket support
// 5. Added AutoBet status display
// 6. Now consistent with other games