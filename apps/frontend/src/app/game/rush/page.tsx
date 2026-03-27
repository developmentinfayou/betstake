import { useState, useEffect } from "react";
import { walletAPI, betAPI, rushAPI } from "@/lib/api";
import { useActiveGameGuard } from "@/hooks/useActiveGameGuard";
import ActiveGameBlocker from "@/components/games/ActiveGameBlocker";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import BetModeSelector from "@/components/betting/BetModeSelector";
import ManualBetControls from "@/components/betting/ManualBetControls";
import RushGameControls from "@/components/games/rush/RushGameControls";
import FairnessModal from "@/components/games/FairnessModal";
import { RushDifficulty } from "@casino/game-engine/games/rush/constants";

export default function RushPage() {
  const [betMode, setBetMode] = useState<"manual" | "auto" | "strategy">("manual");
  const [amount, setAmount] = useState(10);
  const [difficulty, setDifficulty] = useState<RushDifficulty>("medium");
  
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ profit: 0, wins: 0, losses: 0, wagered: 0 });
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);

  // Active session states
  const [gameActive, setGameActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [bustedAtStep, setBustedAtStep] = useState<number | undefined>();
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  
  const { isBlocked, blockedByGame } = useActiveGameGuard({ currentGameType: 'RUSH', autoBetActive: false });

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
      const response = await rushAPI.getActiveSession();
      if (response.data.hasActiveSession) {
        setSessionId(response.data.sessionId);
        setCurrentStepIndex(response.data.stepsPassed);
        setCurrentMultiplier(response.data.currentMultiplier || 1);
        setDifficulty(response.data.difficulty);
        setAmount(response.data.betAmount);
        setGameActive(true);
        setBustedAtStep(undefined);
        setCrashPoint(null);
        toast.success("Resumed your active game");
      }
    } catch (error) {
      // No active session — continue normally
    }
  };

  const startGame = async () => {
    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const response = await rushAPI.start({
        difficulty,
        betAmount: amount,
        currency: "USD",
      });

      setSessionId(response.data.sessionId);
      setCurrentMultiplier(1.00);
      setCurrentStepIndex(0);
      setGameActive(true);
      setBustedAtStep(undefined);
      setCrashPoint(null);
      toast.success("Game started!");
      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (!sessionId || !gameActive) return;

    setLoading(true);
    try {
      const response = await rushAPI.next({ sessionId });

      if (response.data.safe) {
        setCurrentStepIndex(response.data.stepsPassed);
        setCurrentMultiplier(response.data.currentMultiplier);
        toast.success(`Survived! ${response.data.currentMultiplier.toFixed(2)}x`);
      } else {
        // Crashed
        setGameActive(false);
        setBustedAtStep(response.data.bet.result.crashedAtStep);
        setCrashPoint(response.data.crashPoint);
        setCurrentStepIndex(response.data.bet.result.crashedAtStep); // Show the busted step
        toast.error(`Crashed at ${response.data.crashPoint.toFixed(2)}x!`);
        
        setStats((s) => ({
          ...s,
          losses: s.losses + 1,
          profit: s.profit - amount,
          wagered: s.wagered + amount,
        }));
        await loadBalance();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to go to next step");
    } finally {
      setLoading(false);
    }
  };

  const cashOut = async () => {
    if (!sessionId || !gameActive) return;
    
    // In Rush, user must climb at least 1 step to cash out (Step 0 is 1.00x)
    if (currentStepIndex === 0) {
      toast.error("You must clear at least one step to cash out!");
      return;
    }

    setLoading(true);
    try {
      const response = await rushAPI.cashout({ sessionId });

      toast.success(`Cashed out! Won $${response.data.profit.toFixed(2)}`);
      setGameActive(false);
      setCrashPoint(response.data.crashPoint);

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
    setBustedAtStep(undefined);
    setCrashPoint(null);
    setSessionId(null);
    setCurrentStepIndex(0);
    setCurrentMultiplier(1);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold gradient-text">
            Stellar Rush
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
              <h2 className="text-2xl font-bold mb-6">Stellar Rush</h2>

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
              
              {!gameActive && crashPoint !== null && (
                <div className={`mb-6 p-6 rounded-lg text-center border ${bustedAtStep ? 'bg-red-900/20 border-red-500' : 'bg-green-900/20 border-green-500'}`}>
                  <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                    {bustedAtStep ? 'Crashed At' : 'Would Have Crashed At'}
                  </div>
                  <div className={`text-5xl font-bold mb-2 ${bustedAtStep ? 'text-red-500' : 'text-gray-300 opacity-70'}`}>
                    {crashPoint.toFixed(2)}x
                  </div>
                  <div className="text-xl font-bold mt-4">
                    {bustedAtStep 
                      ? <span className="text-red-500">💥 YOU BUSTED!</span> 
                      : <span className="text-green-400">🎉 SUCCESSFULLY CASHED OUT AT {currentMultiplier.toFixed(2)}x</span>
                    }
                  </div>
                </div>
              )}

              <RushGameControls
                difficulty={difficulty}
                onChangeDifficulty={setDifficulty}
                disabled={loading}
                gameActive={gameActive}
                currentStepIndex={currentStepIndex}
                bustedAtStep={bustedAtStep}
                onNextStep={nextStep}
              />

              {gameActive && currentStepIndex > 0 && (
                <button
                  onClick={cashOut}
                  disabled={loading}
                  className="btn-secondary w-full py-4 mt-6 text-lg font-bold shadow-lg"
                >
                  Cash Out ${(amount * currentMultiplier).toFixed(2)}
                </button>
              )}

              {!gameActive && (sessionId !== null || crashPoint !== null) && (
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
                onChange={setBetMode}
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

              {betMode !== "manual" && (
                <div className="text-center py-8 text-gray-400 border border-gray-800 rounded-lg bg-gray-900/50">
                  <div className="text-lg mb-2">⚠️ AutoBet Disabled</div>
                  <div className="text-sm px-4">
                    Stellar Rush requires manual step-by-step gameplay. AutoBet is disabled for this game.
                  </div>
                </div>
              )}
            </div>

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
