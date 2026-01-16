'use client';

import { useState, useEffect } from 'react';
import { betAPI, walletAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAutoBetSocket } from '@/hooks/useAutoBetSocket';
import BetModeSelector from '@/components/betting/BetModeSelector';
import ManualBetControls from '@/components/betting/ManualBetControls';
import AutoBetControls, { AutoBetConfig } from '@/components/betting/AutoBetControls';
import StrategySelector from '@/components/betting/StrategySelector';
import PlinkoGameControls, { PlinkoGameParams } from '@/components/games/plinko/PlinkoGameControls';
import PlinkoBoard from '@/components/games/plinko/PlinkoBoard';
import TrajectoryHistory from '@/components/games/plinko/TrajectoryHistory';
import FairnessModal from '@/components/games/FairnessModal';

type BetMode = 'manual' | 'auto' | 'strategy';

export default function PlinkoPage() {
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [amount, setAmount] = useState(10);
  const [gameParams, setGameParams] = useState<PlinkoGameParams>({ risk: 'medium', rows: 12, superMode: false });
  const [payoutSeed, setPayoutSeed] = useState<string>('');
  const [isDropping, setIsDropping] = useState(false);
  const [trajectoryHistory, setTrajectoryHistory] = useState<Array<{path: number[], slot: number, multiplier: number, won: boolean}>>([]);
  const [showTrajectoryHistory, setShowTrajectoryHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ profit: 0, wins: 0, losses: 0, wagered: 0 });
  const [autoBetActive, setAutoBetActive] = useState(false);
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [goldenPegs, setGoldenPegs] = useState<Array<{ row: number; position: number; multiplier: number }>>([]);
  const [deadZones, setDeadZones] = useState<number[]>([]);

  useEffect(() => {
    loadBalance();
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }
    // Generate initial payout seed
    generateNewPayoutSeed();
  }, []);

  useEffect(() => {
    // Regenerate preview when game params change (lightning mode or rows)
    if (gameParams.risk.startsWith('lightning-') && payoutSeed) {
      generateLightningPreview(payoutSeed);
    } else {
      setGoldenPegs([]);
      setDeadZones([]);
    }
  }, [gameParams.risk, gameParams.rows]);

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

  const generateNewPayoutSeed = () => {
    const seed = Math.random().toString(36).substring(2, 8);
    setPayoutSeed(seed);
    
    // Generate golden pegs and dead zones for preview (if lightning mode)
    if (gameParams.risk.startsWith('lightning-')) {
      generateLightningPreview(seed);
    }
  };

  const generateLightningPreview = async (seed: string) => {
    // Client-side preview generation using Web Crypto API
    const encoder = new TextEncoder();
    
    // Generate golden pegs hash
    const goldenData = encoder.encode(seed + 'golden');
    const goldenHashBuffer = await crypto.subtle.digest('SHA-256', goldenData);
    const goldenHash = new Uint8Array(goldenHashBuffer);
    
    // Generate dead zones hash
    const deadData = encoder.encode(seed + 'dead');
    const deadHashBuffer = await crypto.subtle.digest('SHA-256', deadData);
    const deadHash = new Uint8Array(deadHashBuffer);
    
    // Golden peg count based on rows
    const goldenPegCount: Record<number, number> = {
      8: 3, 9: 3, 10: 4, 11: 4, 12: 5, 13: 5, 14: 6, 15: 7, 16: 8
    };
    
    // Multiplier pools
    const multiplierPools: Record<string, number[]> = {
      'lightning-low': [2, 3, 4, 5, 6, 8, 10],
      'lightning-medium': [5, 8, 10, 12, 15, 20, 25, 30],
      'lightning-high': [10, 15, 20, 30, 40, 50, 80, 100]
    };
    
    const count = goldenPegCount[gameParams.rows] || 5;
    const multiplierPool = multiplierPools[gameParams.risk] || multiplierPools['lightning-medium'];
    
    const newGoldenPegs: Array<{ row: number; position: number; multiplier: number }> = [];
    for (let i = 0; i < count; i++) {
      const row = 2 + (goldenHash[i * 3] % Math.max(1, gameParams.rows - 4));
      const position = goldenHash[i * 3 + 1] % (row + 2);
      const multiplier = multiplierPool[goldenHash[i * 3 + 2] % multiplierPool.length];
      newGoldenPegs.push({ row, position, multiplier });
    }
    
    // Dead zones
    const deadZoneCount: Record<string, number> = {
      'lightning-low': 2,
      'lightning-medium': 3,
      'lightning-high': 4
    };
    
    const deadCount = deadZoneCount[gameParams.risk] || 3;
    const totalSlots = gameParams.rows + 1;
    const newDeadZones: number[] = [];
    
    for (let i = 0; i < deadCount && i < deadHash.length; i++) {
      const slot = deadHash[i] % totalSlots;
      if (!newDeadZones.includes(slot)) {
        newDeadZones.push(slot);
      }
    }
    
    setGoldenPegs(newGoldenPegs);
    setDeadZones(newDeadZones.sort((a, b) => a - b));
  };

  const placeBet = async () => {
    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    setIsDropping(true);
    setResult(null);
    
    // Simulate ball drop duration
    setTimeout(() => setIsDropping(false), 2500);
    
    try {
      const params = gameParams.superMode ? { ...gameParams, payoutSeed } : gameParams;
      const response = await betAPI.place({ gameType: 'PLINKO', currency: 'USD', amount, gameParams: params });
      const { bet, result: gameResult } = response.data;
      const resultData = gameResult.result || gameResult;
      setResult(resultData);

      // Update golden pegs and dead zones from result if lightning mode
      if (resultData.goldenPegs) {
        setGoldenPegs(resultData.goldenPegs);
      }
      if (resultData.deadZones) {
        setDeadZones(resultData.deadZones);
      }

      // Add to trajectory history
      if (resultData.path && resultData.finalSlot !== undefined) {
        setTrajectoryHistory(prev => [...prev, {
          path: resultData.path,
          slot: resultData.finalSlot,
          multiplier: resultData.multiplier,
          won: bet.won
        }].slice(-20)); // Keep last 20
      }

      if (bet.won) {
        toast.success(`Won $${bet.profit.toFixed(2)}!`);
        setStats(s => ({ ...s, wins: s.wins + 1, profit: s.profit + bet.profit, wagered: s.wagered + amount }));
      } else {
        toast.error(`Lost $${amount}`);
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
      await betAPI.startAutobet({ gameType: 'PLINKO', currency: 'USD', amount, gameParams, config });
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
          <Link href="/" className="text-2xl font-bold gradient-text">← Plinko</Link>
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
              <h2 className="text-2xl font-bold mb-6">Plinko</h2>

              <div className="mb-6">
                {(gameParams.superMode || gameParams.risk.startsWith('lightning-')) && (
                  <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">
                      {gameParams.risk.startsWith('lightning-') 
                        ? 'Change payout seed to update golden pegs & dead zones' 
                        : 'Change payout seed to update the position'}
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 bg-gray-900 px-3 py-2 rounded font-mono text-sm">{payoutSeed}</div>
                      <button onClick={generateNewPayoutSeed} className="p-2 hover:bg-gray-700 rounded" title="Regenerate">
                        🔄
                      </button>
                      <button onClick={generateNewPayoutSeed} className="btn-secondary px-4 py-2">
                        Change
                      </button>
                    </div>
                  </div>
                )}
                
                <PlinkoBoard 
                  rows={gameParams.rows}
                  risk={gameParams.risk}
                  result={result}
                  isDropping={isDropping}
                  superMode={gameParams.superMode}
                  goldenPegs={goldenPegs}
                  deadZones={deadZones}
                />
                
                {result && !isDropping && (
                  <div className={`mt-4 p-4 rounded-lg text-center ${result.multiplier >= 1 ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'}`}>
                    <div className="text-2xl mb-2">{result.multiplier >= 1 ? '🎉 WIN!' : '😢 LOST'}</div>
                    <div className="text-lg">
                      {result.multiplier >= 1000 ? `${(result.multiplier/1000).toFixed(0)}k` : 
                       result.multiplier >= 100 ? result.multiplier.toFixed(0) : 
                       result.multiplier.toFixed(1)}x Multiplier
                    </div>
                    {result.goldenPegHits && result.goldenPegHits.length > 0 && (
                      <div className="mt-2 text-sm text-yellow-400">
                        ⚡ Hit {result.goldenPegHits.length} golden peg{result.goldenPegHits.length > 1 ? 's' : ''}!
                      </div>
                    )}
                    {result.deadZones && result.deadZones.includes(result.finalSlot) && (
                      <div className="mt-2 text-sm text-red-400">
                        💀 Landed in DEAD ZONE!
                      </div>
                    )}
                  </div>
                )}
              </div>

              <PlinkoGameControls onChange={setGameParams} disabled={loading || autoBetActive} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <BetModeSelector mode={betMode} onChange={setBetMode} showStrategy={true} />
              {betMode === 'manual' && (
                <ManualBetControls amount={amount} balance={balance} onAmountChange={setAmount} onBet={placeBet} disabled={autoBetActive} loading={loading} multiplier={result?.multiplier || 1.2} />
              )}
              {betMode === 'auto' && (
                <AutoBetControls amount={amount} balance={balance} onAmountChange={setAmount} onStart={handleStartAutoBet} onStop={handleStopAutoBet} isActive={autoBetActive} disabled={loading || amount <= 0 || amount > balance} />
              )}
              {betMode === 'strategy' && (
                <StrategySelector
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

            {gameParams.jackpotMode && (
              <TrajectoryHistory 
                trajectories={trajectoryHistory}
                jackpotCondition={gameParams.jackpotCondition}
                showHistory={showTrajectoryHistory}
                onToggle={() => setShowTrajectoryHistory(!showTrajectoryHistory)}
              />
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
