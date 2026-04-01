import { useState, useEffect } from "react";
import { walletAPI, balloonAPI } from "@/lib/api";
import { useActiveGameGuard } from "@/hooks/useActiveGameGuard";
import ActiveGameBlocker from "@/components/games/ActiveGameBlocker";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import BetModeSelector from "@/components/betting/BetModeSelector";
import ManualBetControls from "@/components/betting/ManualBetControls";
import AutoBetControls, { AutoBetConfig } from "@/components/betting/AutoBetControls";
import BalloonGameControls from "@/components/games/balloon/BalloonGameControls";
import FairnessModal from "@/components/games/FairnessModal";
import { PumpDifficulty, PUMP_STEPS, MAX_PUMPS } from "@casino/game-engine/games/balloon/constants";

type BetMode = "manual" | "auto";

export default function BalloonPage() {
  const [betMode, setBetMode] = useState<BetMode>("manual");
  const [amount, setAmount] = useState(10);
  const [difficulty, setDifficulty] = useState<PumpDifficulty>("easy");

  // Auto mode settings
  const [targetPumps, setTargetPumps] = useState(5);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoBetsLeft, setAutoBetsLeft] = useState(0);

  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ profit: 0, wins: 0, losses: 0, wagered: 0 });
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);

  // Session state (manual mode)
  const [gameActive, setGameActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPumpIndex, setCurrentPumpIndex] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [burstAtPump, setBurstAtPump] = useState<number | undefined>();
  const [burstPoint, setBurstPoint] = useState<number | null>(null);

  // Auto mode result
  const [autoResult, setAutoResult] = useState<any>(null);

  const { isBlocked, blockedByGame } = useActiveGameGuard({ currentGameType: 'BALLOON', autoBetActive: autoRunning });

  useEffect(() => {
    loadBalance();
    checkActiveSession();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await walletAPI.getAll();
      const usdWallet = response.data.find((w: any) => w.currency === "USD");
      setBalance(usdWallet?.balance || 0);
    } catch (error) {
      console.error("Failed to load balance");
    }
  };

  const checkActiveSession = async () => {
    try {
      const response = await balloonAPI.getActiveSession();
      if (response.data.hasActiveSession) {
        setSessionId(response.data.sessionId);
        setCurrentPumpIndex(response.data.pumpsPassed);
        setCurrentMultiplier(response.data.currentMultiplier || 1);
        setDifficulty(response.data.difficulty);
        setAmount(response.data.betAmount);
        setGameActive(true);
        setBurstAtPump(undefined);
        setBurstPoint(null);
        setBetMode("manual");
        toast.success("Resumed your active game");
      }
    } catch (error) {
      // No active session
    }
  };

  // ── Manual Mode ─────────────────────────────────────────────────────

  const startGame = async () => {
    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const response = await balloonAPI.start({
        difficulty,
        betAmount: amount,
        currency: "USD",
      });

      setSessionId(response.data.sessionId);
      setCurrentMultiplier(1.00);
      setCurrentPumpIndex(0);
      setGameActive(true);
      setBurstAtPump(undefined);
      setBurstPoint(null);
      setAutoResult(null);
      toast.success("Game started! Pump the balloon!");
      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  const pumpBalloon = async () => {
    if (!sessionId || !gameActive) return;

    setLoading(true);
    try {
      const response = await balloonAPI.pump({ sessionId });

      if (response.data.safe) {
        setCurrentPumpIndex(response.data.pumpsPassed);
        setCurrentMultiplier(response.data.currentMultiplier);
        toast.success(`${response.data.currentMultiplier.toFixed(2)}x 🎈`);
      } else {
        // Burst!
        setGameActive(false);
        setBurstAtPump(response.data.bet.result.burstAtPump);
        setBurstPoint(response.data.burstPoint);
        setCurrentPumpIndex(response.data.bet.result.burstAtPump);
        toast.error(`💥 Balloon burst at ${response.data.burstPoint.toFixed(2)}x!`);

        setStats((s) => ({
          ...s,
          losses: s.losses + 1,
          profit: s.profit - amount,
          wagered: s.wagered + amount,
        }));
        await loadBalance();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to pump");
    } finally {
      setLoading(false);
    }
  };

  const cashOut = async () => {
    if (!sessionId || !gameActive) return;

    if (currentPumpIndex === 0) {
      toast.error("Pump at least once before cashing out!");
      return;
    }

    setLoading(true);
    try {
      const response = await balloonAPI.cashout({ sessionId });

      toast.success(`Cashed out! Won $${response.data.profit.toFixed(2)}`);
      setGameActive(false);
      setBurstPoint(response.data.burstPoint);

      setStats((s) => ({
        ...s,
        wins: s.wins + 1,
        profit: s.profit + response.data.profit,
        wagered: s.wagered + amount,
      }));
      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to cash out");
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setGameActive(false);
    setBurstAtPump(undefined);
    setBurstPoint(null);
    setSessionId(null);
    setCurrentPumpIndex(0);
    setCurrentMultiplier(1);
    setAutoResult(null);
  };

  // ── Auto Mode ───────────────────────────────────────────────────────

  const runAutoBet = async (config?: AutoBetConfig) => {
    const betsToRun = config?.numberOfBets || 1;
    setAutoRunning(true);
    setAutoBetsLeft(betsToRun);

    let currentAmount = amount;

    for (let i = 0; i < betsToRun; i++) {
      if (currentAmount > balance) {
        toast.error("Insufficient balance for next bet");
        break;
      }

      try {
        const response = await balloonAPI.auto({
          difficulty,
          betAmount: currentAmount,
          currency: "USD",
          targetPumps,
        });

        const result = response.data;
        setAutoResult(result);
        setBalance(result.wallet.balance);

        if (result.won) {
          setStats((s) => ({
            ...s,
            wins: s.wins + 1,
            profit: s.profit + result.profit,
            wagered: s.wagered + currentAmount,
          }));
          toast.success(`Won ${result.multiplier.toFixed(2)}x! +$${result.profit.toFixed(2)}`);

          // On win: reset or increase
          if (config?.onWin?.action === 'increase' && config.onWin.value) {
            currentAmount = currentAmount * (1 + config.onWin.value / 100);
          } else {
            currentAmount = amount; // Reset to base
          }
        } else {
          setStats((s) => ({
            ...s,
            losses: s.losses + 1,
            profit: s.profit - currentAmount,
            wagered: s.wagered + currentAmount,
          }));
          toast.error(`💥 Burst at pump ${result.burstAtPump}!`);

          // On loss: reset or increase
          if (config?.onLoss?.action === 'increase' && config.onLoss.value) {
            currentAmount = currentAmount * (1 + config.onLoss.value / 100);
          } else {
            currentAmount = amount; // Reset to base
          }
        }

        setAutoBetsLeft(betsToRun - i - 1);

        // Stop if stop conditions met
        if (config?.stopOnProfit && stats.profit >= config.stopOnProfit) break;
        if (config?.stopOnLoss && stats.profit <= -config.stopOnLoss) break;

        // Small delay between auto bets
        if (i < betsToRun - 1) {
          await new Promise((r) => setTimeout(r, 800));
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Auto bet failed");
        break;
      }
    }

    setAutoRunning(false);
    setAutoBetsLeft(0);
    await loadBalance();
  };

  const stopAutoBet = () => {
    setAutoRunning(false);
    setAutoBetsLeft(0);
  };

  const steps = PUMP_STEPS[difficulty];
  const maxPumps = MAX_PUMPS[difficulty];

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold gradient-text">
            🎈 Pump
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
              <h2 className="text-2xl font-bold mb-6">🎈 Pump</h2>

              {/* Active game display */}
              {gameActive && (
                <div className="mb-6 p-6 bg-blue-900/20 border border-blue-500 rounded-lg text-center flex flex-col items-center justify-center">
                  <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                    Current Multiplier
                  </div>
                  <div className="text-5xl font-bold text-primary mb-2">
                    {currentMultiplier.toFixed(2)}x
                  </div>
                  <div className="text-sm text-green-400 font-semibold bg-green-900/40 px-3 py-1 rounded-full">
                    Potential Win: ${(amount * currentMultiplier).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Game over display */}
              {!gameActive && burstPoint !== null && (
                <div className={`mb-6 p-6 rounded-lg text-center border ${burstAtPump ? 'bg-red-900/20 border-red-500' : 'bg-green-900/20 border-green-500'}`}>
                  <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                    {burstAtPump ? 'Burst Point' : 'Would Have Burst At'}
                  </div>
                  <div className={`text-5xl font-bold mb-2 ${burstAtPump ? 'text-red-500' : 'text-gray-300 opacity-70'}`}>
                    {burstPoint.toFixed(2)}x
                  </div>
                  <div className="text-xl font-bold mt-4">
                    {burstAtPump
                      ? <span className="text-red-500">💥 BALLOON BURST!</span>
                      : <span className="text-green-400">🎉 CASHED OUT AT {currentMultiplier.toFixed(2)}x</span>
                    }
                  </div>
                </div>
              )}

              {/* Auto mode result display */}
              {!gameActive && autoResult && (
                <div className={`mb-6 p-6 rounded-lg text-center border ${autoResult.won ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                  <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                    Auto Result
                  </div>
                  <div className={`text-5xl font-bold mb-2 ${autoResult.won ? 'text-green-400' : 'text-red-500'}`}>
                    {autoResult.won ? `${autoResult.multiplier.toFixed(2)}x` : '💥'}
                  </div>
                  <div className="text-lg mt-2">
                    {autoResult.won
                      ? <span className="text-green-400">Won ${autoResult.profit.toFixed(2)}</span>
                      : <span className="text-red-500">Burst at pump {autoResult.burstAtPump} (burst point: {autoResult.burstPoint.toFixed(2)}x)</span>
                    }
                  </div>
                </div>
              )}

              {/* Manual mode: Interactive pump controls */}
              {betMode === "manual" && (
                <BalloonGameControls
                  difficulty={difficulty}
                  onChangeDifficulty={setDifficulty}
                  disabled={loading}
                  gameActive={gameActive}
                  currentPumpIndex={currentPumpIndex}
                  onPump={pumpBalloon}
                  burstAtPump={burstAtPump}
                />
              )}

              {/* Auto mode: Show multiplier table preview */}
              {betMode === "auto" && !gameActive && (
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <label className="block text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                      Select Difficulty
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['easy', 'medium', 'hard', 'expert'] as PumpDifficulty[]).map(d => (
                        <button
                          key={d}
                          onClick={() => { setDifficulty(d); setTargetPumps(Math.min(targetPumps, MAX_PUMPS[d])); }}
                          disabled={autoRunning}
                          className={`py-3 rounded-lg font-bold capitalize transition-all border ${
                            difficulty === d
                              ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]'
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                          } disabled:opacity-50`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                      Number of Pumps
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={1}
                        max={maxPumps}
                        value={targetPumps}
                        onChange={(e) => setTargetPumps(Number(e.target.value))}
                        className="flex-1"
                        disabled={autoRunning}
                      />
                      <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 min-w-[80px] text-center font-bold text-primary">
                        {targetPumps}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      Target Multiplier: <span className="text-primary font-bold">{steps[targetPumps]?.toFixed(2)}x</span>
                    </div>
                  </div>

                  {/* Step preview */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-x-auto">
                    <div className="flex gap-2 pb-2">
                      {steps.slice(0, Math.min(targetPumps + 2, steps.length)).map((mult, i) => (
                        <div
                          key={i}
                          className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-bold border ${
                            i === targetPumps
                              ? 'bg-primary/20 border-primary text-primary'
                              : i < targetPumps
                              ? 'bg-green-900/20 border-green-900/50 text-green-600'
                              : 'bg-gray-800 border-gray-700 text-gray-500'
                          }`}
                        >
                          {mult.toFixed(2)}x
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Cash out button */}
              {gameActive && currentPumpIndex > 0 && (
                <button
                  onClick={cashOut}
                  disabled={loading}
                  className="btn-secondary w-full py-4 mt-6 text-lg font-bold shadow-lg"
                >
                  💰 Cash Out ${(amount * currentMultiplier).toFixed(2)}
                </button>
              )}

              {/* Play again button */}
              {!gameActive && (sessionId !== null || burstPoint !== null || autoResult) && (
                <button
                  onClick={resetGame}
                  className="btn-primary w-full py-4 mt-6 text-lg font-bold"
                >
                  Play Again
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <BetModeSelector
                mode={betMode}
                onChange={(m) => setBetMode(m as BetMode)}
                showStrategy={false}
              />

              {betMode === "manual" && !gameActive && (
                <ManualBetControls
                  amount={amount}
                  balance={balance}
                  onAmountChange={setAmount}
                  onBet={startGame}
                  disabled={loading}
                  loading={loading}
                />
              )}

              {betMode === "auto" && (
                <AutoBetControls
                  amount={amount}
                  balance={balance}
                  onAmountChange={setAmount}
                  onStart={runAutoBet}
                  onStop={stopAutoBet}
                  isActive={autoRunning}
                  disabled={loading || amount <= 0 || amount > balance}
                />
              )}
            </div>

            {autoRunning && (
              <div className="card bg-blue-900/20 border border-blue-500">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">
                    Auto-Bet Active
                  </div>
                  <div className="text-lg font-bold">
                    {autoBetsLeft > 0 ? `${autoBetsLeft} bets remaining` : 'Running...'}
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Live Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit/Loss</span>
                  <span className={stats.profit >= 0 ? "text-green-500" : "text-red-500"}>
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
                  onClick={() => setStats({ profit: 0, wins: 0, losses: 0, wagered: 0 })}
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
