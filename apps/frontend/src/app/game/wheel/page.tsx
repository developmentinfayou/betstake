import { useState, useEffect, useMemo } from "react";
import { betAPI, walletAPI } from "@/lib/api";
import { useActiveGameGuard } from "@/hooks/useActiveGameGuard";
import ActiveGameBlocker from "@/components/games/ActiveGameBlocker";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAutoBetSocket } from "@/hooks/useAutoBetSocket";
import BetModeSelector from "@/components/betting/BetModeSelector";
import ManualBetControls from "@/components/betting/ManualBetControls";
import AutoBetControls, {
  AutoBetConfig,
} from "@/components/betting/AutoBetControls";

import WheelGameControls, {
  WheelGameParams,
} from "@/components/games/wheel/WheelGameControls";
import FairnessModal from "@/components/games/FairnessModal";

type BetMode = "manual" | "auto";

// Color mapping by multiplier tier (matches game engine)
const COLORS: Record<string, string> = {
  ZERO: '#374151',
  BASE: '#3B82F6',
  LOW: '#10B981',
  MID_LOW: '#F59E0B',
  MID: '#F97316',
  HIGH: '#8B5CF6',
  HIGHER: '#EC4899',
  JACKPOT: '#EF4444',
};

function getMultiplierColor(multiplier: number): string {
  if (multiplier === 0) return COLORS.ZERO;
  if (multiplier <= 1.18) return COLORS.BASE;
  if (multiplier <= 1.48) return COLORS.LOW;
  if (multiplier <= 1.78) return COLORS.MID_LOW;
  if (multiplier <= 1.97) return COLORS.MID;
  if (multiplier <= 2.96) return COLORS.HIGH;
  if (multiplier <= 4.94) return COLORS.HIGHER;
  return COLORS.JACKPOT;
}

// Stake.com multiplier tables (mirrored from game engine for client-side display)
const MULTIPLIER_TABLES: Record<string, Record<number, number[]>> = {
  low: {
    10: [0, 1.18, 1.18, 1.48, 1.18, 1.18, 0, 1.18, 1.18, 1.18],
    20: [0, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 0, 1.18, 1.18, 1.18, 1.18, 1.48, 1.18, 0, 1.18, 1.18, 1.18, 0, 1.18],
    30: [0, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 0, 1.18, 1.18, 0, 1.18],
    40: [0, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18, 0, 1.18],
    50: [0, 1.18, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 0, 1.18, 0],
  },
  medium: {
    10: [0, 1.97, 0, 1.48, 0, 2.96, 0, 1.97, 0, 1.97],
    20: [0, 1.48, 0, 1.97, 0, 1.97, 0, 2.96, 0, 1.97, 0, 1.48, 0, 1.97, 0, 1.78, 0, 1.97, 0, 1.97],
    30: [0, 1.48, 0, 1.97, 0, 1.48, 0, 1.97, 0, 2.96, 0, 1.48, 0, 1.97, 0, 1.68, 0, 1.48, 0, 1.97, 0, 3.95, 0, 1.48, 0, 1.97, 0, 1.48, 0, 1.97],
    40: [0, 1.48, 0, 1.97, 0, 1.48, 0, 1.97, 0, 1.48, 0, 2.96, 0, 1.48, 0, 1.97, 0, 1.68, 0, 1.97, 0, 1.48, 0, 1.97, 0, 1.48, 0, 1.97, 0, 1.48, 0, 3.95, 0, 1.48, 0, 1.97, 0, 1.68, 0, 1.97],
    50: [0, 1.48, 0, 1.97, 0, 1.48, 0, 1.97, 0, 1.48, 0, 2.96, 0, 1.48, 0, 1.97, 0, 1.68, 0, 1.97, 0, 1.48, 0, 1.97, 0, 4.94, 0, 1.48, 0, 1.97, 0, 1.48, 0, 1.97, 0, 2.96, 0, 1.48, 0, 1.97, 0, 1.68, 0, 1.48, 0, 1.97, 0, 1.68, 0, 1.48],
  },
  high: {
    10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 9.80],
    20: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19.60],
    30: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29.40],
    40: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39.20],
    50: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 49.00],
  },
};

function getMultiplierBadges(risk: string, segments: number) {
  const multipliers = MULTIPLIER_TABLES[risk]?.[segments] || [];
  const map = new Map<number, number>();
  for (const m of multipliers) {
    map.set(m, (map.get(m) || 0) + 1);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([multiplier, count]) => ({
      multiplier,
      count,
      color: getMultiplierColor(multiplier),
    }));
}

export default function WheelPage() {
  const [betMode, setBetMode] = useState<BetMode>("manual");
  const [amount, setAmount] = useState(10);
  const [gameParams, setGameParams] = useState<WheelGameParams>({
    risk: "medium",
    segments: 20,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({
    profit: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
  });
  const [autoBetActive, setAutoBetActive] = useState(false);
  const { isBlocked, blockedByGame } = useActiveGameGuard({ currentGameType: 'WHEEL', autoBetActive });
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>();

  // Compute multiplier badges based on current config
  const badges = useMemo(
    () => getMultiplierBadges(gameParams.risk, gameParams.segments),
    [gameParams.risk, gameParams.segments]
  );

  useEffect(() => {
    loadBalance();
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);
    }
  }, []);

  useAutoBetSocket(userId, (data) => {
    setResult(data.bet.result);
    setAmount(data.bet.amount);
    if (data.wallet) setBalance(data.wallet.balance);
    if (data.bet.won) {
      setStats((s) => ({
        ...s,
        wins: s.wins + 1,
        profit: s.profit + data.bet.profit,
        wagered: s.wagered + data.bet.amount,
      }));
    } else {
      setStats((s) => ({
        ...s,
        losses: s.losses + 1,
        profit: s.profit + data.bet.profit,
        wagered: s.wagered + data.bet.amount,
      }));
    }
  }, () => {
    setAutoBetActive(false);
    loadBalance();
  });

  const loadBalance = async () => {
    try {
      const response = await walletAPI.getAll();
      const usdWallet = response.data.find((w: any) => w.currency === "USD");
      setBalance(usdWallet?.balance || 0);
    } catch (error) {
      console.error("Failed to load balance");
    }
  };

  const placeBet = async () => {
    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const response = await betAPI.place({
        gameType: "WHEEL",
        currency: "USD",
        amount,
        gameParams,
      });
      const { bet, result: gameResult } = response.data;
      setResult(gameResult.result || gameResult);

      if (gameResult.won) {
        toast.success(`Won $${gameResult.profit.toFixed(2)}!`);
        setStats((s) => ({
          ...s,
          wins: s.wins + 1,
          profit: s.profit + gameResult.profit,
          wagered: s.wagered + amount,
        }));
      } else {
        toast.error(`Lost $${amount}`);
        setStats((s) => ({
          ...s,
          losses: s.losses + 1,
          profit: s.profit - amount,
          wagered: s.wagered + amount,
        }));
      }

      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Bet failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAutoBet = async (config: AutoBetConfig) => {
    try {
      await betAPI.startAutobet({
        gameType: "WHEEL",
        currency: "USD",
        amount,
        gameParams,
        config,
      });
      setAutoBetActive(true);
      toast.success("Auto-bet started");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to start auto-bet");
    }
  };

  const handleStopAutoBet = async () => {
    try {
      await betAPI.stopAutobet();
      setAutoBetActive(false);
      toast.success("Auto-bet stopped");
      await loadBalance();
    } catch (error: any) {
      toast.error("Failed to stop auto-bet");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold gradient-text">
            {" "}
            Wheel
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFairnessModalOpen(true)}
              className="btn-secondary px-4 py-2"
            >
              🎲 Fairness
            </button>
            <div className="text-right">
              <div className="text-sm text-gray-400">Balance</div>
              <div className="text-xl font-bold text-primary">
                ${balance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isBlocked && blockedByGame && (
          <ActiveGameBlocker gameType={blockedByGame.gameType} betAmount={blockedByGame.betAmount} />
        )}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              {/* Result banner */}
              {result && (
                <div className="mb-4 p-4 rounded-lg" style={{
                  backgroundColor: result.multiplier > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${result.multiplier > 0 ? '#10B981' : '#EF4444'}`,
                }}>
                  <div className="text-center text-sm text-gray-400 mb-1">Game result will be displayed</div>
                  <div className="text-center">
                    <span className="text-2xl font-bold" style={{ color: result.color || getMultiplierColor(result.multiplier) }}>
                      {result.multiplier?.toFixed(2)}x
                    </span>
                    <span className="text-gray-400 ml-2">Segment {result.segment}</span>
                  </div>
                </div>
              )}

              {!result && (
                <div className="mb-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="text-center text-sm text-gray-400">Game result will be displayed</div>
                </div>
              )}

              {/* Wheel placeholder */}
              <div className="flex justify-center mb-6">
                <div className="relative w-72 h-72 rounded-full border-4 border-gray-700 flex items-center justify-center"
                  style={{
                    background: `conic-gradient(${
                      (MULTIPLIER_TABLES[gameParams.risk]?.[gameParams.segments] || [])
                        .map((m, i, arr) => {
                          const color = getMultiplierColor(m);
                          const start = (i / arr.length) * 360;
                          const end = ((i + 1) / arr.length) * 360;
                          return `${color} ${start}deg ${end}deg`;
                        })
                        .join(', ')
                    })`,
                  }}
                >
                  <div className="w-40 h-40 rounded-full bg-gray-900 flex items-center justify-center">
                    <div className="text-gray-500 text-sm text-center">
                      {gameParams.segments} segments
                    </div>
                  </div>
                </div>
              </div>

              {/* Multiplier badges */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {badges.map((badge, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 rounded-md text-sm font-bold text-white"
                    style={{
                      backgroundColor: 'rgba(31, 41, 55, 0.8)',
                      borderBottom: `2px solid ${badge.color}`,
                    }}
                  >
                    {badge.multiplier.toFixed(2)}x
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <BetModeSelector
                mode={betMode}
                onChange={(m) => setBetMode(m as BetMode)}
              />
              {betMode === "manual" && (
                <ManualBetControls
                  amount={amount}
                  balance={balance}
                  onAmountChange={setAmount}
                  onBet={placeBet}
                  disabled={autoBetActive}
                  loading={loading}
                  multiplier={result?.multiplier || 1.5}
                />
              )}
              {betMode === "auto" && (
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

              {/* Game controls (segments slider + risk) */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <WheelGameControls
                  onChange={setGameParams}
                  disabled={loading || autoBetActive}
                />
              </div>
            </div>

            {autoBetActive && (
              <div className="card bg-blue-900/20 border border-blue-500">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">
                    Auto-Bet Active
                  </div>
                  <div className="text-lg font-bold">Running...</div>
                </div>
              </div>
            )}

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Live Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit/Loss</span>
                  <span
                    className={
                      stats.profit >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
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
                <button
                  onClick={() =>
                    setStats({ profit: 0, wins: 0, losses: 0, wagered: 0 })
                  }
                  className="btn-secondary w-full mt-4"
                >
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
