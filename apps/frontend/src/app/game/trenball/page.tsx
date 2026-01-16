'use client';

import { useState, useEffect } from 'react';
import { walletAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import BetModeSelector from '@/components/betting/BetModeSelector';
import ManualBetControls from '@/components/betting/ManualBetControls';

type BetMode = 'manual';

type BetType = 'crash' | 'red' | 'green' | 'moon';

export default function TrenballPage() {
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [amount, setAmount] = useState(10);
  const [balance, setBalance] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'ended'>('betting');
  const [result, setResult] = useState<{ type: BetType; multiplier: number } | null>(null);
  const [myBets, setMyBets] = useState<{ type: BetType; amount: number }[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [userId, setUserId] = useState<string>('');
  const [stats, setStats] = useState({ crash: 0, red: 0, green: 0, moon: 0 });

  useEffect(() => {
    loadBalance();
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }

    const newSocket = io('http://localhost:3001/trenball', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('game-state', (data) => {
      setGameState(data.state);
      setRoundNumber(data.roundNumber);
      if (data.result) setResult(data.result);
      setBets(data.bets || []);
    });

    newSocket.on('round-starting', (data) => {
      setGameState('betting');
      setRoundNumber(data.roundNumber);
      setResult(null);
      setMyBets([]);
      setBets([]);
    });

    newSocket.on('bet-placed', (bet) => {
      setBets(prev => [...prev, bet]);
    });

    newSocket.on('round-result', (data) => {
      setGameState('ended');
      setResult(data.result);
      
      setStats(prev => ({
        ...prev,
        [data.result.type]: prev[data.result.type as keyof typeof prev] + 1,
      }));

      const myWinningBets = myBets.filter(b => b.type === data.result.type);
      if (myWinningBets.length > 0) {
        const totalWin = myWinningBets.reduce((sum, b) => sum + b.amount * data.result.multiplier, 0);
        toast.success(`You won $${totalWin.toFixed(2)}!`);
        loadBalance();
      } else if (myBets.length > 0) {
        toast.error('Better luck next time!');
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const loadBalance = async () => {
    try {
      const response = await walletAPI.getAll();
      const usdWallet = response.data.find((w: any) => w.currency === 'USD');
      setBalance(usdWallet?.balance || 0);
    } catch (error) {
      console.error('Failed to load balance');
    }
  };

  const placeBet = (betType: BetType) => {
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
      betType,
    });

    setMyBets(prev => [...prev, { type: betType, amount }]);
    toast.success(`Bet placed on ${betType}!`);
  };

  const getBetColor = (type: BetType) => {
    switch (type) {
      case 'crash': return 'bg-purple-600 hover:bg-purple-700';
      case 'red': return 'bg-red-600 hover:bg-red-700';
      case 'green': return 'bg-green-600 hover:bg-green-700';
      case 'moon': return 'bg-yellow-600 hover:bg-yellow-700';
    }
  };

  const getMultiplier = (type: BetType) => {
    switch (type) {
      case 'crash': return '7x';
      case 'red': return '2x';
      case 'green': return '2x';
      case 'moon': return '100x';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">← Trenball</Link>
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
                  {gameState === 'betting' && 'Place Your Bets'}
                  {gameState === 'playing' && 'Rolling...'}
                  {gameState === 'ended' && result && `${result.type.toUpperCase()} - ${result.multiplier}x`}
                </div>
              </div>

              <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                {result && gameState === 'ended' ? (
                  <div className="text-center">
                    <div className="text-8xl mb-4">
                      {result.type === 'crash' && '💥'}
                      {result.type === 'red' && '🔴'}
                      {result.type === 'green' && '🟢'}
                      {result.type === 'moon' && '🌙'}
                    </div>
                    <div className="text-4xl font-bold">{result.type.toUpperCase()}</div>
                    <div className="text-2xl text-gray-400">{result.multiplier}x</div>
                  </div>
                ) : (
                  <div className="text-6xl">⚽</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => placeBet('crash')}
                  disabled={gameState !== 'betting'}
                  className={`${getBetColor('crash')} py-6 rounded-lg font-bold text-xl disabled:opacity-50`}
                >
                  💥 Crash {getMultiplier('crash')}
                </button>
                <button
                  onClick={() => placeBet('red')}
                  disabled={gameState !== 'betting'}
                  className={`${getBetColor('red')} py-6 rounded-lg font-bold text-xl disabled:opacity-50`}
                >
                  🔴 Red {getMultiplier('red')}
                </button>
                <button
                  onClick={() => placeBet('green')}
                  disabled={gameState !== 'betting'}
                  className={`${getBetColor('green')} py-6 rounded-lg font-bold text-xl disabled:opacity-50`}
                >
                  🟢 Green {getMultiplier('green')}
                </button>
                <button
                  onClick={() => placeBet('moon')}
                  disabled={gameState !== 'betting'}
                  className={`${getBetColor('moon')} py-6 rounded-lg font-bold text-xl disabled:opacity-50`}
                >
                  🌙 Moon {getMultiplier('moon')}
                </button>
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
                onBet={() => {}} // Trenball uses custom bet buttons
                disabled={gameState !== 'betting'}
                loading={false}
              />
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>💥 Crash</span>
                  <span>{stats.crash}</span>
                </div>
                <div className="flex justify-between">
                  <span>🔴 Red</span>
                  <span>{stats.red}</span>
                </div>
                <div className="flex justify-between">
                  <span>🟢 Green</span>
                  <span>{stats.green}</span>
                </div>
                <div className="flex justify-between">
                  <span>🌙 Moon</span>
                  <span>{stats.moon}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Active Bets ({bets.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bets.slice(-10).map((bet, i) => (
                  <div key={i} className="flex justify-between text-sm p-2 bg-gray-800 rounded">
                    <span>{bet.username}</span>
                    <span>{bet.betType}</span>
                    <span>${bet.amount}</span>
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
