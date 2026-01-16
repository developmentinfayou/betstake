'use client';

import { useState, useEffect, useRef } from 'react';
import { walletAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import BetModeSelector from '@/components/betting/BetModeSelector';
import ManualBetControls from '@/components/betting/ManualBetControls';

type BetMode = 'manual';

export default function CrashPage() {
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [amount, setAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState(2);
  const [balance, setBalance] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<'waiting' | 'betting' | 'playing' | 'crashed'>('waiting');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [myBet, setMyBet] = useState<any>(null);
  const [bets, setBets] = useState<any[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
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
      setGameState(data.state);
      setRoundNumber(data.roundNumber);
      setCurrentMultiplier(data.currentMultiplier);
      if (data.crashPoint) setCrashPoint(data.crashPoint);
      setBets(data.bets || []);
    });

    newSocket.on('round-starting', (data) => {
      setGameState('betting');
      setRoundNumber(data.roundNumber);
      setCurrentMultiplier(1.0);
      setCrashPoint(null);
      setMyBet(null);
      setBets([]);
    });

    newSocket.on('game-started', () => {
      setGameState('playing');
    });

    newSocket.on('multiplier-update', (data) => {
      setCurrentMultiplier(data.multiplier);
    });

    newSocket.on('bet-placed', (bet) => {
      setBets(prev => [...prev, bet]);
    });

    newSocket.on('player-cashed-out', (data) => {
      setBets(prev => prev.map(b => 
        b.userId === data.userId ? { ...b, cashedOut: true, cashoutAt: data.multiplier } : b
      ));
      if (data.userId === userId) {
        toast.success(`Cashed out at ${data.multiplier.toFixed(2)}x! +$${data.payout.toFixed(2)}`);
        loadBalance();
      }
    });

    newSocket.on('game-crashed', (data) => {
      setGameState('crashed');
      setCrashPoint(data.crashPoint);
      if (myBet && !myBet.cashedOut) {
        toast.error(`Crashed at ${data.crashPoint.toFixed(2)}x`);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    drawGraph();
  }, [currentMultiplier, gameState]);

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

    socket.emit('place-bet', {
      userId: payload.id,
      username: payload.username || 'Player',
      amount,
      currency: 'USD',
      autoCashout,
    });

    setMyBet({ amount, autoCashout, cashedOut: false });
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

    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (canvas.height / 10) * i);
      ctx.lineTo(canvas.width, (canvas.height / 10) * i);
      ctx.stroke();
    }

    // Draw multiplier line
    if (gameState === 'playing' || gameState === 'crashed') {
      ctx.strokeStyle = gameState === 'crashed' ? '#ef4444' : '#10b981';
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
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentMultiplier.toFixed(2)}x`, canvas.width / 2, canvas.height / 2);
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
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Round #{roundNumber}</h2>
                <div className="text-sm px-3 py-1 rounded bg-blue-900 text-blue-300">
                  {gameState === 'betting' && 'Betting...'}
                  {gameState === 'playing' && 'Flying!'}
                  {gameState === 'crashed' && `Crashed at ${crashPoint?.toFixed(2)}x`}
                </div>
              </div>

              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full rounded-lg"
              />

              <div className="mt-4 grid grid-cols-2 gap-4">
                {gameState === 'betting' && !myBet && (
                  <button onClick={placeBet} className="btn-primary py-3 col-span-2">
                    Place Bet ${amount}
                  </button>
                )}
                {gameState === 'playing' && myBet && !myBet.cashedOut && (
                  <button onClick={cashout} className="btn-primary py-3 col-span-2">
                    Cash Out ${(amount * currentMultiplier).toFixed(2)}
                  </button>
                )}
              </div>
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
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Active Bets ({bets.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bets.map((bet, i) => (
                  <div key={i} className="flex justify-between text-sm p-2 bg-gray-800 rounded">
                    <span>{bet.username}</span>
                    <span>${bet.amount}</span>
                    {bet.cashedOut && (
                      <span className="text-green-500">{bet.cashoutAt?.toFixed(2)}x</span>
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
