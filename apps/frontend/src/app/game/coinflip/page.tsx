import { useState, useEffect, useCallback } from "react";
import { coinflipAPI, walletAPI } from "@/lib/api";
import { useActiveGameGuard } from "@/hooks/useActiveGameGuard";
import ActiveGameBlocker from "@/components/games/ActiveGameBlocker";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ManualBetControls from "@/components/betting/ManualBetControls";
import CoinAnimation from "@/components/games/coinflip/CoinAnimation";
import FairnessModal from "@/components/games/FairnessModal";

type CoinSide = "heads" | "tails";

interface RoundResult {
  pick: CoinSide;
  result: CoinSide;
  won: boolean;
  multiplier: number;
}

type GamePhase = "betting" | "picking" | "flipping" | "result" | "gameover" | "cashout";

export default function CoinFlipPage() {
  // Bet controls
  const [amount, setAmount] = useState(10);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>("betting");
  const [currentRound, setCurrentRound] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [nextMultiplier, setNextMultiplier] = useState(1.98);
  const [potentialPayout, setPotentialPayout] = useState(0);
  const [roundHistory, setRoundHistory] = useState<RoundResult[]>([]);
  const [lastResult, setLastResult] = useState<CoinSide | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // Stats tracking
  const [stats, setStats] = useState({
    profit: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
  });

  const { isBlocked, blockedByGame } = useActiveGameGuard({ currentGameType: "COINFLIP" });
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);

  const isInGame = gamePhase !== "betting" && gamePhase !== "gameover" && gamePhase !== "cashout";

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
      const response = await coinflipAPI.getActiveSession();
      const data = response.data;
      if (data.hasActiveSession) {
        // Resume session
        setSessionId(data.sessionId);
        setCurrentRound(data.currentRound);
        setCurrentMultiplier(data.currentMultiplier);
        setPotentialPayout(data.potentialPayout);
        setAmount(data.betAmount);
        setGamePhase(data.currentRound > 0 ? "picking" : "picking");

        // Rebuild round history from picks + results
        const history: RoundResult[] = [];
        for (let i = 0; i < data.picks.length; i++) {
          history.push({
            pick: data.picks[i],
            result: data.results[i],
            won: data.picks[i] === data.results[i],
            multiplier: parseFloat(Math.pow(1.98, i + 1).toFixed(4)),
          });
        }
        setRoundHistory(history);

        // Calculate next multiplier
        const nextMult = parseFloat(Math.pow(1.98, data.currentRound + 1).toFixed(4));
        setNextMultiplier(nextMult);

        toast.success(`Resumed game — Round ${data.currentRound}, ${data.currentMultiplier}x`);
      }
    } catch (error) {
      console.error("Failed to check active session");
    }
  };

  // Start a new game
  const startGame = async () => {
    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    if (amount <= 0) {
      toast.error("Bet amount must be positive");
      return;
    }

    setLoading(true);
    try {
      const response = await coinflipAPI.start({
        betAmount: amount,
        currency: "USD",
      });

      const data = response.data;
      setSessionId(data.sessionId);
      setCurrentRound(0);
      setCurrentMultiplier(1);
      setNextMultiplier(1.98);
      setPotentialPayout(0);
      setRoundHistory([]);
      setLastResult(null);
      setGamePhase("picking");

      setStats((s) => ({ ...s, wagered: s.wagered + amount }));
      await loadBalance();

      toast.success("Game started! Pick Heads or Tails");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  // Pick heads or tails
  const makePick = useCallback(async (choice: CoinSide) => {
    if (!sessionId || gamePhase !== "picking") return;

    setIsFlipping(true);
    setGamePhase("flipping");
    setLastResult(null);

    try {
      const response = await coinflipAPI.pick({
        sessionId,
        choice,
      });

      const data = response.data;

      // Show flip animation for 1.5s before revealing
      setTimeout(() => {
        setIsFlipping(false);
        setLastResult(data.result);

        const round: RoundResult = {
          pick: choice,
          result: data.result,
          won: data.won,
          multiplier: data.won ? data.currentMultiplier : 0,
        };
        setRoundHistory((prev) => [...prev, round]);
        setCurrentRound(data.round);

        if (data.won) {
          setCurrentMultiplier(data.currentMultiplier);
          setPotentialPayout(data.potentialPayout || data.betAmount * data.currentMultiplier);

          if (data.gameOver && data.autoCashout) {
            // Max rounds reached — auto cashout
            setGamePhase("cashout");
            setStats((s) => ({
              ...s,
              wins: s.wins + 1,
              profit: s.profit + data.profit,
            }));
            toast.success(`🎉 Max rounds! Won $${data.payout.toFixed(2)} at ${data.currentMultiplier}x!`);
            loadBalance();
          } else {
            setNextMultiplier(data.nextMultiplier);
            setGamePhase("result");

            // Auto-transition to picking after brief pause
            setTimeout(() => {
              setGamePhase("picking");
            }, 800);
          }
        } else {
          // Lost
          setGamePhase("gameover");
          setCurrentMultiplier(0);
          setPotentialPayout(0);
          setStats((s) => ({
            ...s,
            losses: s.losses + 1,
            profit: s.profit - amount,
          }));
          toast.error(`Lost! The coin was ${data.result}`);
        }
      }, 1500);
    } catch (error: any) {
      setIsFlipping(false);
      setGamePhase("picking");
      toast.error(error.response?.data?.error || "Pick failed");
    }
  }, [sessionId, gamePhase, amount]);

  // Cash out at current multiplier
  const cashOut = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await coinflipAPI.cashout({ sessionId });
      const data = response.data;

      setGamePhase("cashout");
      setStats((s) => ({
        ...s,
        wins: s.wins + 1,
        profit: s.profit + data.profit,
      }));

      toast.success(`💰 Cashed out $${data.payout.toFixed(2)} at ${data.multiplier}x!`);
      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Cashout failed");
    } finally {
      setLoading(false);
    }
  };

  // Reset game to start new one
  const resetGame = () => {
    setSessionId(null);
    setGamePhase("betting");
    setCurrentRound(0);
    setCurrentMultiplier(1);
    setNextMultiplier(1.98);
    setPotentialPayout(0);
    setRoundHistory([]);
    setLastResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold gradient-text">
            Coin Flip
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
          {/* Main game area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              {/* Multiplier & payout display */}
              {isInGame && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-400">Round</div>
                    <div className="text-2xl font-bold text-white">
                      {currentRound} / 20
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-400">Multiplier</div>
                    <div className="text-2xl font-bold text-primary">
                      {currentMultiplier > 1 ? `${currentMultiplier}x` : "—"}
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-400">Potential Win</div>
                    <div className="text-2xl font-bold text-green-500">
                      {potentialPayout > 0 ? `$${potentialPayout.toFixed(2)}` : "—"}
                    </div>
                  </div>
                </div>
              )}

              {/* Coin animation area */}
              <div className="mb-6">
                <CoinAnimation
                  result={lastResult}
                  isFlipping={isFlipping}
                />
              </div>

              {/* Game phase displays */}
              {gamePhase === "betting" && (
                <div className="text-center text-gray-400 text-lg py-8">
                  Place your bet and start flipping! 🪙
                </div>
              )}

              {/* Pick buttons — HEADS / TAILS */}
              {gamePhase === "picking" && (
                <div className="space-y-4">
                  <div className="text-center text-gray-300 text-lg font-semibold mb-2">
                    {currentRound === 0
                      ? "Pick Heads or Tails to start!"
                      : `Round ${currentRound + 1} — Next win: ${nextMultiplier}x`}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => makePick("heads")}
                      className="py-10 rounded-xl font-bold text-3xl transition-all bg-gradient-to-br from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 text-white shadow-lg hover:shadow-yellow-500/30 hover:scale-[1.02] active:scale-95"
                    >
                      🪙 HEADS
                    </button>
                    <button
                      onClick={() => makePick("tails")}
                      className="py-10 rounded-xl font-bold text-3xl transition-all bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95"
                    >
                      🔵 TAILS
                    </button>
                  </div>
                </div>
              )}

              {gamePhase === "flipping" && (
                <div className="text-center text-gray-400 text-lg py-4 animate-pulse">
                  Flipping...
                </div>
              )}

              {/* Game over — lost */}
              {gamePhase === "gameover" && (
                <div className="text-center py-6">
                  <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 mb-4">
                    <div className="text-4xl mb-2">😢</div>
                    <div className="text-2xl font-bold text-red-400 mb-2">GAME OVER</div>
                    <div className="text-gray-400">
                      You lost after {currentRound} round{currentRound !== 1 ? "s" : ""} — Lost ${amount.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={resetGame}
                    className="btn-primary px-8 py-3 text-lg"
                  >
                    Play Again
                  </button>
                </div>
              )}

              {/* Cashed out — won */}
              {gamePhase === "cashout" && (
                <div className="text-center py-6">
                  <div className="bg-green-900/20 border border-green-500 rounded-xl p-6 mb-4">
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="text-2xl font-bold text-green-400 mb-2">CASHED OUT!</div>
                    <div className="text-gray-400">
                      {currentRound} round{currentRound !== 1 ? "s" : ""} — Won ${potentialPayout.toFixed(2)} at {currentMultiplier}x
                    </div>
                  </div>
                  <button
                    onClick={resetGame}
                    className="btn-primary px-8 py-3 text-lg"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>

            {/* Round History */}
            {roundHistory.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-bold mb-3">Round History</h3>
                <div className="flex flex-wrap gap-2">
                  {roundHistory.map((round, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${round.won
                          ? "bg-green-900/20 border-green-500/40 text-green-400"
                          : "bg-red-900/20 border-red-500/40 text-red-400"
                        }`}
                    >
                      <span>{round.result === "heads" ? "🪙" : "🔵"}</span>
                      <span>R{i + 1}</span>
                      <span className="text-xs opacity-70">
                        {round.won ? `${round.multiplier}x` : "✗"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar controls */}
          <div className="space-y-6">
            {/* Bet controls — visible before game starts */}
            {gamePhase === "betting" && (
              <ManualBetControls
                amount={amount}
                balance={balance}
                onAmountChange={setAmount}
                onBet={startGame}
                disabled={false}
                loading={loading}
                multiplier={1.98}
                buttonText="Start Game"
              />
            )}

            {/* Cash Out button — visible during game after at least 1 win */}
            {isInGame && currentRound > 0 && currentMultiplier > 1 && (
              <div className="card">
                <button
                  onClick={cashOut}
                  disabled={loading || gamePhase === "flipping"}
                  className="w-full py-5 rounded-xl font-bold text-2xl transition-all bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  💰 Cash Out ${potentialPayout.toFixed(2)}
                </button>
                <div className="text-center text-sm text-gray-400 mt-2">
                  Current: {currentMultiplier}x — Next: {nextMultiplier}x
                </div>
              </div>
            )}

            {/* Bet info during game */}
            {isInGame && (
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Current Bet</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bet Amount</span>
                    <span className="font-bold">${amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Round</span>
                    <span className="font-bold">{currentRound} / 20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Multiplier</span>
                    <span className="font-bold text-primary">{currentMultiplier}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next Win</span>
                    <span className="font-bold text-yellow-400">{nextMultiplier}x</span>
                  </div>
                </div>
              </div>
            )}

            {/* Multiplier table */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Multipliers</h3>
              <div className="space-y-1 text-sm max-h-48 overflow-y-auto">
                {Array.from({ length: 10 }, (_, i) => {
                  const round = i + 1;
                  const mult = parseFloat(Math.pow(1.98, round).toFixed(4));
                  const isCurrentRound = round === currentRound + 1 && isInGame;
                  return (
                    <div
                      key={round}
                      className={`flex justify-between py-1 px-2 rounded ${round <= currentRound
                          ? "bg-green-900/20 text-green-400"
                          : isCurrentRound
                            ? "bg-primary/20 text-primary font-bold"
                            : "text-gray-400"
                        }`}
                    >
                      <span>Round {round}</span>
                      <span>{mult}x</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live stats */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Session Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit/Loss</span>
                  <span className={stats.profit >= 0 ? "text-green-500" : "text-red-500"}>
                    ${stats.profit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Games Won</span>
                  <span className="text-green-500">{stats.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Games Lost</span>
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
