import { useState, useEffect, useRef, useCallback } from "react";
import { walletAPI, towerAPI } from "@/lib/api";
import { useActiveGameGuard } from "@/hooks/useActiveGameGuard";
import ActiveGameBlocker from "@/components/games/ActiveGameBlocker";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import BetModeSelector from "@/components/betting/BetModeSelector";
import ManualBetControls from "@/components/betting/ManualBetControls";
import AutoBetControls, { AutoBetConfig } from "@/components/betting/AutoBetControls";
import TowerGameControls, {
  TowerDifficulty,
  TowerGameParams,
} from "@/components/games/tower/TowerGameControls";
import FairnessModal from "@/components/games/FairnessModal";

// Difficulty configs (mirrors backend TOWER_CONFIG)
const DIFFICULTY_CONFIG: Record<TowerDifficulty, { tilesPerFloor: number; dangersPerFloor: number; floors: number }> = {
  easy: { tilesPerFloor: 4, dangersPerFloor: 1, floors: 9 },
  medium: { tilesPerFloor: 3, dangersPerFloor: 1, floors: 9 },
  hard: { tilesPerFloor: 2, dangersPerFloor: 1, floors: 9 },
  extreme: { tilesPerFloor: 3, dangersPerFloor: 2, floors: 9 },
  nightmare: { tilesPerFloor: 4, dangersPerFloor: 3, floors: 9 },
};

const DIFFICULTY_PROB: Record<TowerDifficulty, number> = {
  easy: 3 / 4,
  medium: 2 / 3,
  hard: 1 / 2,
  extreme: 1 / 3,
  nightmare: 1 / 4,
};

function getMultiplierTable(difficulty: TowerDifficulty, houseEdge: number = 1): number[] {
  const prob = DIFFICULTY_PROB[difficulty];
  const config = DIFFICULTY_CONFIG[difficulty];
  const table: number[] = [];
  for (let i = 1; i <= config.floors; i++) {
    const raw = Math.pow(1 / prob, i);
    table.push(parseFloat((raw * (1 - houseEdge / 100)).toFixed(4)));
  }
  return table;
}

type BetMode = "manual" | "auto" | "strategy";

export default function TowerPage() {
  const [betMode, setBetMode] = useState<BetMode>("manual");
  const [amount, setAmount] = useState(10);
  const [difficulty, setDifficulty] = useState<TowerDifficulty>("easy");
  const [gameParams, setGameParams] = useState<TowerGameParams>({ difficulty: "easy", selectedTiles: [] });
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ profit: 0, wins: 0, losses: 0, wagered: 0 });
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);
  const [autoBetActive, setAutoBetActive] = useState(false);
  const { isBlocked, blockedByGame } = useActiveGameGuard({ currentGameType: 'TOWER', autoBetActive });

  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [dangerTiles, setDangerTiles] = useState<number[]>([]);
  const [allDangerTiles, setAllDangerTiles] = useState<number[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [multiplierTable, setMultiplierTable] = useState<number[]>([]);

  // Autobet refs
  const autoBetActiveRef = useRef(false);
  const autoBetConfigRef = useRef<AutoBetConfig | null>(null);

  const config = DIFFICULTY_CONFIG[difficulty];

  useEffect(() => {
    loadBalance();
    checkActiveSession();
  }, []);

  useEffect(() => {
    setMultiplierTable(getMultiplierTable(difficulty));
  }, [difficulty]);

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
      const response = await towerAPI.getActiveSession();
      if (response.data.hasActiveSession) {
        setSessionId(response.data.sessionId);
        setRevealedTiles(response.data.revealedTiles || []);
        setCurrentMultiplier(response.data.currentMultiplier || 1);
        setCurrentFloor(response.data.currentFloor || 0);
        setGameActive(true);
        setGameOver(false);
        setDangerTiles([]);
        setAllDangerTiles([]);
        setAmount(response.data.betAmount);
        if (response.data.difficulty) {
          setDifficulty(response.data.difficulty);
          setGameParams({ difficulty: response.data.difficulty, selectedTiles: [] });
          setMultiplierTable(getMultiplierTable(response.data.difficulty));
        }
        toast.success("Resumed your active game");
      }
    } catch (error) {
      // No active session — continue normally
    }
  };

  const resetGame = useCallback(() => {
    setGameActive(false);
    setGameOver(false);
    setRevealedTiles([]);
    setDangerTiles([]);
    setAllDangerTiles([]);
    setSessionId(null);
    setCurrentMultiplier(1);
    setCurrentFloor(0);
  }, []);


  const startGame = async () => {
    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const response = await towerAPI.start({
        difficulty,
        betAmount: amount,
        currency: "USD",
      });

      setSessionId(response.data.sessionId);
      setCurrentMultiplier(1);
      setCurrentFloor(0);
      setGameActive(true);
      setRevealedTiles([]);
      setDangerTiles([]);
      setAllDangerTiles([]);
      setGameOver(false);
      if (response.data.multiplierTable) {
        setMultiplierTable(response.data.multiplierTable);
      }
      toast.success("Game started! Pick a tile on floor 1");
      await loadBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  const revealTile = async (tileIndex: number) => {
    if (!sessionId || revealedTiles.includes(tileIndex) || gameOver) return;

    setLoading(true);
    try {
      const response = await towerAPI.reveal({
        sessionId,
        tileIndex,
      });

      if (response.data.safe) {
        setRevealedTiles(response.data.revealedTiles);
        setCurrentMultiplier(response.data.currentMultiplier);
        setCurrentFloor(response.data.currentFloor);

        if (response.data.gameOver && response.data.reachedTop) {
          // Reached the top - auto cashout
          setGameOver(true);
          setGameActive(false);
          const grid = response.data.grid;
          const dangers = grid
            .map((isDanger: boolean, idx: number) => (isDanger ? idx : -1))
            .filter((idx: number) => idx !== -1);
          setAllDangerTiles(dangers);
          toast.success(`🏆 Reached the top! Won $${response.data.profit?.toFixed(2)} at ${response.data.currentMultiplier.toFixed(2)}x`);
          setStats(s => ({
            ...s,
            wins: s.wins + 1,
            profit: s.profit + (response.data.profit || 0),
            wagered: s.wagered + amount,
          }));
          await loadBalance();
          // Auto-reset after a delay
          setTimeout(resetGame, 2000);
        } else {
          toast.success(`Safe! Floor ${response.data.currentFloor} cleared — ${response.data.currentMultiplier.toFixed(2)}x`);
        }
      } else {
        setGameOver(true);
        setGameActive(false);
        setDangerTiles([tileIndex]);
        // Show all danger positions from grid
        const grid = response.data.grid;
        if (grid) {
          const dangers = grid
            .map((isDanger: boolean, idx: number) => (isDanger ? idx : -1))
            .filter((idx: number) => idx !== -1);
          setAllDangerTiles(dangers);
        }
        toast.error(`💣 Hit a trap on floor ${(response.data.floorReached || currentFloor) + 1}! Game over`);
        setStats(s => ({
          ...s,
          losses: s.losses + 1,
          profit: s.profit - amount,
          wagered: s.wagered + amount,
        }));
        await loadBalance();
        // Auto-reset after a delay
        setTimeout(resetGame, 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to reveal tile");
    } finally {
      setLoading(false);
    }
  };

  const cashOut = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await towerAPI.cashout({ sessionId });

      toast.success(`💰 Cashed out! Won $${response.data.profit.toFixed(2)} at ${response.data.multiplier.toFixed(2)}x`);
      setGameActive(false);
      setGameOver(true);

      const grid = response.data.grid;
      const dangers = grid
        .map((isDanger: boolean, idx: number) => (isDanger ? idx : -1))
        .filter((idx: number) => idx !== -1);
      setAllDangerTiles(dangers);

      setStats(s => ({
        ...s,
        wins: s.wins + 1,
        profit: s.profit + response.data.profit,
        wagered: s.wagered + amount,
      }));
      await loadBalance();
      // Auto-reset after a delay
      setTimeout(resetGame, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to cash out");
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // Frontend-driven Autobet loop for Tower
  // ──────────────────────────────────────────────────────────

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runAutoBetRound = async (selectedTiles: number[]): Promise<{ won: boolean; profit: number } | null> => {
    // 1. Start a new game
    let sid: string;
    try {
      const response = await towerAPI.start({
        difficulty,
        betAmount: amount,
        currency: "USD",
      });
      sid = response.data.sessionId;
      setSessionId(sid);
      setCurrentMultiplier(1);
      setCurrentFloor(0);
      setGameActive(true);
      setRevealedTiles([]);
      setDangerTiles([]);
      setAllDangerTiles([]);
      setGameOver(false);
      if (response.data.multiplierTable) {
        setMultiplierTable(response.data.multiplierTable);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "AutoBet: Failed to start game");
      return null;
    }

    // 2. Reveal tiles one by one
    for (let i = 0; i < selectedTiles.length; i++) {
      if (!autoBetActiveRef.current) {
        // Stop requested — try to cashout if we have progress
        if (i > 0) {
          try {
            const cashoutResp = await towerAPI.cashout({ sessionId: sid });
            const profit = cashoutResp.data.profit;
            setGameActive(false);
            setGameOver(true);
            const grid = cashoutResp.data.grid;
            if (grid) {
              const dangers = grid.map((isDanger: boolean, idx: number) => (isDanger ? idx : -1)).filter((idx: number) => idx !== -1);
              setAllDangerTiles(dangers);
            }
            await loadBalance();
            setTimeout(resetGame, 1500);
            return { won: true, profit };
          } catch {
            // If cashout fails, just reset
          }
        }
        resetGame();
        return null;
      }

      await delay(400);

      try {
        const response = await towerAPI.reveal({
          sessionId: sid,
          tileIndex: selectedTiles[i],
        });

        if (response.data.safe) {
          setRevealedTiles(response.data.revealedTiles);
          setCurrentMultiplier(response.data.currentMultiplier);
          setCurrentFloor(response.data.currentFloor);

          if (response.data.gameOver && response.data.reachedTop) {
            // Reached the top — auto win
            setGameOver(true);
            setGameActive(false);
            const grid = response.data.grid;
            const dangers = grid.map((isDanger: boolean, idx: number) => (isDanger ? idx : -1)).filter((idx: number) => idx !== -1);
            setAllDangerTiles(dangers);
            await loadBalance();
            const profit = response.data.profit || 0;
            await delay(1000);
            resetGame();
            return { won: true, profit };
          }
        } else {
          // Hit a trap
          setGameOver(true);
          setGameActive(false);
          setDangerTiles([selectedTiles[i]]);
          const grid = response.data.grid;
          if (grid) {
            const dangers = grid.map((isDanger: boolean, idx: number) => (isDanger ? idx : -1)).filter((idx: number) => idx !== -1);
            setAllDangerTiles(dangers);
          }
          await loadBalance();
          await delay(1000);
          resetGame();
          return { won: false, profit: -amount };
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || "AutoBet: Failed to reveal tile");
        resetGame();
        return null;
      }
    }

    // 3. All selected tiles revealed safely — cashout
    try {
      const response = await towerAPI.cashout({ sessionId: sid });
      const profit = response.data.profit;
      setGameActive(false);
      setGameOver(true);
      const grid = response.data.grid;
      if (grid) {
        const dangers = grid.map((isDanger: boolean, idx: number) => (isDanger ? idx : -1)).filter((idx: number) => idx !== -1);
        setAllDangerTiles(dangers);
      }
      await loadBalance();
      await delay(1000);
      resetGame();
      return { won: true, profit };
    } catch (error: any) {
      toast.error(error.response?.data?.error || "AutoBet: Failed to cash out");
      resetGame();
      return null;
    }
  };

  const handleStartAutoBet = async (autoBetConfig: AutoBetConfig) => {
    if (gameParams.selectedTiles.length === 0) {
      toast.error("Select tiles on the grid first — one per floor from bottom up");
      return;
    }

    const selectedTiles = [...gameParams.selectedTiles];
    autoBetActiveRef.current = true;
    autoBetConfigRef.current = autoBetConfig;
    setAutoBetActive(true);

    let currentBet = 0;
    let totalProfit = 0;

    const maxBets = autoBetConfig.numberOfBets || 0; // 0 = infinite

    while (autoBetActiveRef.current) {
      currentBet++;

      const result = await runAutoBetRound(selectedTiles);

      if (!result) {
        // Error or stop requested mid-round
        break;
      }

      if (result.won) {
        toast.success(`AutoBet #${currentBet}: Won $${result.profit.toFixed(2)}`);
        setStats(s => ({
          ...s,
          wins: s.wins + 1,
          profit: s.profit + result.profit,
          wagered: s.wagered + amount,
        }));
      } else {
        toast.error(`AutoBet #${currentBet}: Lost $${amount.toFixed(2)}`);
        setStats(s => ({
          ...s,
          losses: s.losses + 1,
          profit: s.profit + result.profit,
          wagered: s.wagered + amount,
        }));
      }

      totalProfit += result.profit;

      // Check stop conditions
      if (maxBets > 0 && currentBet >= maxBets) {
        toast.success(`AutoBet completed: ${currentBet} rounds`);
        break;
      }

      if (autoBetConfig.stopOnProfit && autoBetConfig.stopOnProfit > 0 && totalProfit >= autoBetConfig.stopOnProfit) {
        toast.success(`AutoBet stopped: Reached profit target $${autoBetConfig.stopOnProfit}`);
        break;
      }

      if (autoBetConfig.stopOnLoss && autoBetConfig.stopOnLoss > 0 && totalProfit <= -autoBetConfig.stopOnLoss) {
        toast.success(`AutoBet stopped: Reached loss limit $${autoBetConfig.stopOnLoss}`);
        break;
      }

      if (!autoBetActiveRef.current) break;

      // Brief delay before next round
      await delay(500);
      await loadBalance();
    }

    autoBetActiveRef.current = false;
    setAutoBetActive(false);
  };

  const handleStopAutoBet = () => {
    autoBetActiveRef.current = false;
    setAutoBetActive(false);
    toast.success("AutoBet stopping...");
  };

  const nextMultiplier = multiplierTable[currentFloor] || 0;
  const potentialPayout = amount * currentMultiplier;

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold gradient-text">
            Tower Legend
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
          {/* Left Panel - Controls */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="card">
              <BetModeSelector
                mode={betMode}
                onChange={(m) => {
                  setBetMode(m as BetMode);
                  if (!autoBetActive) resetGame();
                }}
                showStrategy={false}
              />

              {betMode === "manual" && !gameActive && !gameOver && (
                <ManualBetControls
                  amount={amount}
                  balance={balance}
                  onAmountChange={setAmount}
                  onBet={startGame}
                  disabled={loading}
                  loading={loading}
                  buttonText="Bet"
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
            </div>

            {/* Game Actions — manual mode cashout */}
            {gameActive && !gameOver && currentFloor > 0 && betMode === "manual" && (
              <button
                onClick={cashOut}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                💰 Cash Out ${potentialPayout.toFixed(2)}
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                  {currentMultiplier.toFixed(2)}x multiplier
                </div>
              </button>
            )}

            {/* AutoBet active indicator */}
            {autoBetActive && (
              <div className="card bg-blue-900/20 border border-blue-500">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Auto-Bet Active</div>
                  <div className="text-lg font-bold">Running...</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {gameParams.selectedTiles.length} floor(s) per round
                  </div>
                </div>
              </div>
            )}

            {/* Game Info Panel */}
            {gameActive && (
              <div className="card" style={{ background: '#111827', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>Current Multiplier</span>
                  <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '18px' }}>
                    {currentMultiplier.toFixed(2)}x
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>Floor</span>
                  <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                    {currentFloor} / {config.floors}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>Next Floor</span>
                  <span style={{ color: '#eab308', fontWeight: 'bold' }}>
                    {nextMultiplier.toFixed(2)}x
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>Potential Win</span>
                  <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                    ${potentialPayout.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Live Stats */}
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

          {/* Right Panel - Tower Grid */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="card" style={{ background: '#111827', border: '1px solid #1e293b' }}>
              <TowerGameControls
                onChange={setGameParams}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                disabled={loading}
                tilesPerFloor={config.tilesPerFloor}
                dangersPerFloor={config.dangersPerFloor}
                floors={config.floors}
                currentFloor={currentFloor}
                revealedTiles={revealedTiles}
                dangerTiles={dangerTiles}
                allDangerTiles={allDangerTiles}
                onTileClick={gameActive && betMode === "manual" ? revealTile : undefined}
                gameActive={gameActive}
                gameOver={gameOver}
                multiplierTable={multiplierTable}
                isAutoMode={betMode === "auto"}
                autoBetActive={autoBetActive}
              />
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
