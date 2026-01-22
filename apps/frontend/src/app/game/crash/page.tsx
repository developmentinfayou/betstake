'use client';

import { useState, useEffect, useRef } from 'react';
import { walletAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import BetModeSelector from '@/components/betting/BetModeSelector';
import ManualBetControls from '@/components/betting/ManualBetControls';

type BetMode = 'manual';
type GameMode = 'classic' | 'trenball';
type TrenballBetType = 'crash' | 'red' | 'green' | 'moon';
type GameState = 'waiting' | 'betting' | 'playing' | 'crashed';

interface TrenballResult {
  type: TrenballBetType;
  multiplier: number;
}

interface RoundHistory {
  roundNumber: number;
  crashPoint: number;
  trenballResult?: TrenballResult;
}

export default function CrashPage() {
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [amount, setAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState(2);
  const [trenballBetType, setTrenballBetType] = useState<TrenballBetType>('green');
  const [balance, setBalance] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [trenballResult, setTrenballResult] = useState<TrenballResult | null>(null);
  const [myBet, setMyBet] = useState<any>(null);
  const [bets, setBets] = useState<any[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [userId, setUserId] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadBalance();
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }

    const newSocket = io('http://localhost:3001/crash', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('game-state', (data) => {
      if (data.mode === gameMode) {
        setGameState(data.state);
        setRoundNumber(data.roundNumber);
        setCurrentMultiplier(data.currentMultiplier);
        if (data.crashPoint) setCrashPoint(data.crashPoint);
        if (data.trenballResult) setTrenballResult(data.trenballResult);
        setBets(data.bets || []);
        if (data.history) setHistory(data.history);
      }
    });

    newSocket.on('round-starting', (data) => {
      if (data.mode === gameMode) {
        setGameState('betting');
        setRoundNumber(data.roundNumber);
        setCurrentMultiplier(1.0);
        setCrashPoint(null);
        setTrenballResult(null);
        setMyBet(null);
        setBets([]);
      }
    });

    newSocket.on('game-started', (data) => {
      if (data.mode === gameMode) {
        setGameState('playing');
      }
    });

    newSocket.on('multiplier-update', (data) => {
      if (data.mode === gameMode) {
        setCurrentMultiplier(data.multiplier);
      }
    });

    newSocket.on('bet-placed', (data) => {
      if (data.mode === gameMode) {
        setBets(prev => [...prev, data.bet]);
      }
    });

    newSocket.on('player-cashed-out', (data) => {
      if (data.mode === gameMode) {
        setBets(prev => prev.map(b =>
          b.odId === data.userId ? { ...b, cashedOut: true, cashoutAt: data.multiplier } : b
        ));
        if (data.userId === userId) {
          toast.success(`Cashed out at ${data.multiplier.toFixed(2)}x! +$${data.payout.toFixed(2)}`);
          loadBalance();
        }
      }
    });

    newSocket.on('game-crashed', (data) => {
      if (data.mode === gameMode) {
        setGameState('crashed');
        setCrashPoint(data.crashPoint);
        if (data.trenballResult) {
          setTrenballResult(data.trenballResult);
        }
        if (gameMode === 'classic' && myBet && !myBet.cashedOut) {
          toast.error(`Crashed at ${data.crashPoint.toFixed(2)}x`);
        }
        if (gameMode === 'trenball' && myBet) {
          const myBetType = myBet.betType;
          if (data.trenballResult?.type === myBetType) {
            toast.success(`${myBetType.toUpperCase()} wins! +$${(myBet.amount * data.trenballResult.multiplier).toFixed(2)}`);
            loadBalance();
          } else {
            toast.error(`${data.trenballResult?.type.toUpperCase()} won. Better luck next time!`);
          }
        }
      }
    });

    newSocket.on('jackpot-triggered', (data) => {
      if (data.userId === userId) {
        toast.success(`🎉 JACKPOT! ${data.conditionName} - Won $${data.prizeAmount}!`, { duration: 5000 });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Switch mode
  useEffect(() => {
    if (socket) {
      socket.emit('switch-mode', gameMode);
    }
  }, [gameMode, socket]);

  useEffect(() => {
    drawGraph();
  }, [currentMultiplier, gameState, gameMode]);

  const loadBalance = async () => {
    try {
      const response = await walletAPI.getAll();
      const usdWallet = response.data.find((w: any) => w.currency === 'USD');
      setBalance(usdWallet?.balance || 0);
    } catch (error) {
      console.error('Failed to load balance');
    }
  };

  const placeBet = async () => {
    if (!socket || gameState !== 'betting') {
      toast.error('Betting is closed');
      return;
    }

    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));

    if (gameMode === 'classic') {
      socket.emit('place-bet', {
        userId: payload.id,
        username: payload.username || 'Player',
        amount,
        currency: 'USD',
        autoCashout,
        mode: 'classic',
      });
      setMyBet({ amount, autoCashout, cashedOut: false });
    } else {
      socket.emit('place-trenball-bet', {
        userId: payload.id,
        username: payload.username || 'Player',
        amount,
        currency: 'USD',
        betType: trenballBetType,
      });
      setMyBet({ amount, betType: trenballBetType });
    }
    toast.success('Bet placed!');
  };

  const cashout = () => {
    if (!socket || gameState !== 'playing' || !myBet || myBet.cashedOut) {
      return;
    }

    socket.emit('cashout', { userId });
    setMyBet({ ...myBet, cashedOut: true });
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#21262d';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (canvas.height / 10) * i);
      ctx.lineTo(canvas.width, (canvas.height / 10) * i);
      ctx.stroke();
    }

    // Draw multiplier line
    if (gameState === 'playing' || gameState === 'crashed') {
      const gradient = ctx.createLinearGradient(0, canvas.height, canvas.width, 0);
      if (gameState === 'crashed') {
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(1, '#dc2626');
      } else {
        gradient.addColorStop(0, '#22c55e');
        gradient.addColorStop(1, '#16a34a');
      }
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);

      const maxMult = Math.max(currentMultiplier, 2);
      const x = (canvas.width / maxMult) * currentMultiplier;
      const y = canvas.height - (canvas.height / maxMult) * (currentMultiplier - 1);

      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Draw multiplier text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentMultiplier.toFixed(2)}x`, canvas.width / 2, canvas.height / 2 + 20);

    // Draw state text
    ctx.font = '16px Inter, Arial, sans-serif';
    ctx.fillStyle = '#6b7280';
    if (gameState === 'betting') {
      ctx.fillText('Starts in 5s', canvas.width / 2, canvas.height / 2 + 60);
    }
  };

  const getTrenballButtonColor = (type: TrenballBetType) => {
    switch (type) {
      case 'crash': return 'bg-purple-600 hover:bg-purple-700';
      case 'red': return 'bg-red-600 hover:bg-red-700';
      case 'green': return 'bg-green-600 hover:bg-green-700';
      case 'moon': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
    }
  };

  const getTrenballMultiplier = (type: TrenballBetType) => {
    switch (type) {
      case 'crash': return '49.99x';
      case 'red': return '1.96x';
      case 'green': return '2.00x';
      case 'moon': return '10.00x';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">← Crash</Link>
          <div className="text-right">
            <div className="text-sm text-gray-400">Balance</div>
            <div className="text-xl font-bold text-primary">${balance.toFixed(2)}</div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Mode Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setGameMode('classic')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${gameMode === 'classic'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            Classic
          </button>
          <button
            onClick={() => setGameMode('trenball')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${gameMode === 'trenball'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            Trenball
          </button>
        </div>

        {/* Round History */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {history.map((h) => (
            <div
              key={h.roundNumber}
              className={`px-3 py-1 rounded text-sm font-medium ${h.crashPoint >= 2 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                }`}
            >
              {h.crashPoint.toFixed(2)}x
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Round #{roundNumber}</h2>
                <div className="text-sm px-3 py-1 rounded bg-blue-900 text-blue-300">
                  {gameState === 'betting' && 'Betting...'}
                  {gameState === 'playing' && 'Flying!'}
                  {gameState === 'crashed' && gameMode === 'classic' && `Crashed at ${crashPoint?.toFixed(2)}x`}
                  {gameState === 'crashed' && gameMode === 'trenball' && trenballResult && (
                    <span className={`font-bold ${trenballResult.type === 'green' ? 'text-green-400' :
                      trenballResult.type === 'red' ? 'text-red-400' :
                        trenballResult.type === 'moon' ? 'text-yellow-400' : 'text-purple-400'
                      }`}>
                      {trenballResult.type.toUpperCase()} - {trenballResult.multiplier}x
                    </span>
                  )}
                </div>
              </div>

              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full rounded-lg"
              />

              {/* Classic Mode: Bet/Cashout Button */}
              {gameMode === 'classic' && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {gameState === 'betting' && !myBet && (
                    <button onClick={placeBet} className="btn-primary py-3 col-span-2">
                      Place Bet ${amount}
                    </button>
                  )}
                  {gameState === 'playing' && myBet && !myBet.cashedOut && (
                    <button onClick={cashout} className="btn-primary py-3 col-span-2 bg-yellow-500 hover:bg-yellow-600">
                      Cash Out ${(amount * currentMultiplier).toFixed(2)}
                    </button>
                  )}
                </div>
              )}

              {/* Trenball Mode: Bet Type Buttons */}
              {gameMode === 'trenball' && gameState === 'betting' && !myBet && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['crash', 'red', 'green', 'moon'] as TrenballBetType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setTrenballBetType(type);
                        placeBet();
                      }}
                      className={`${getTrenballButtonColor(type)} py-4 rounded-lg font-bold text-center`}
                    >
                      <div className="text-lg capitalize">{type}</div>
                      <div className="text-sm opacity-80">{getTrenballMultiplier(type)}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Trenball Result Display */}
              {gameMode === 'trenball' && gameState === 'crashed' && trenballResult && (
                <div className="mt-4 p-6 rounded-lg bg-gray-800 text-center">
                  <div className="text-6xl mb-2">
                    {trenballResult.type === 'crash' && '💥'}
                    {trenballResult.type === 'red' && '🐻'}
                    {trenballResult.type === 'green' && '🐂'}
                    {trenballResult.type === 'moon' && '🌙'}
                  </div>
                  <div className={`text-3xl font-bold ${trenballResult.type === 'green' ? 'text-green-400' :
                    trenballResult.type === 'red' ? 'text-red-400' :
                      trenballResult.type === 'moon' ? 'text-yellow-400' : 'text-purple-400'
                    }`}>
                    {trenballResult.type.toUpperCase()} WINS!
                  </div>
                  <div className="text-xl text-gray-400">{trenballResult.multiplier}x payout</div>
                </div>
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

              <ManualBetControls
                amount={amount}
                balance={balance}
                onAmountChange={setAmount}
                onBet={placeBet}
                disabled={gameState !== 'betting' || myBet}
                loading={false}
              />

              {/* Classic Mode: Auto Cashout */}
              {gameMode === 'classic' && (
                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-2">Auto Cashout</label>
                  <input
                    type="number"
                    step="0.1"
                    value={autoCashout}
                    onChange={(e) => setAutoCashout(Number(e.target.value))}
                    className="input w-full"
                    disabled={gameState !== 'betting' || myBet}
                  />
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Active Bets ({bets.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bets.map((bet, i) => (
                  <div key={i} className="flex justify-between text-sm p-2 bg-gray-800 rounded">
                    <span>{bet.username}</span>
                    <span>${bet.amount}</span>
                    {gameMode === 'classic' && bet.cashedOut && (
                      <span className="text-green-500">{bet.cashoutAt?.toFixed(2)}x</span>
                    )}
                    {gameMode === 'trenball' && bet.betType && (
                      <span className={`capitalize ${bet.betType === 'green' ? 'text-green-400' :
                        bet.betType === 'red' ? 'text-red-400' :
                          bet.betType === 'moon' ? 'text-yellow-400' : 'text-purple-400'
                        }`}>
                        {bet.betType}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
