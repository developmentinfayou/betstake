'use client';

import { useState, useEffect } from 'react';
import { walletAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

type LudoMode = '1v1' | '2v2' | '1v1v1v1';

export default function LudoLobbyPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [balance, setBalance] = useState(0);
  const [selectedMode, setSelectedMode] = useState<LudoMode>('1v1');
  const [betAmount, setBetAmount] = useState(10);
  const [currency] = useState('USD');
  const [isCreating, setIsCreating] = useState(false);
  const [inQueue, setInQueue] = useState(false);
  const [queueStats, setQueueStats] = useState({ playersWaiting: 0, averageWaitTime: 0 });
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    loadBalance();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    setUserId(payload.id);
    setUsername(payload.username || 'Player');

    const newSocket = io('http://localhost:3001/ludo', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('game-created', (data) => {
      toast.success('Game created!');
      router.push(`/game/ludo/${data.gameId}`);
    });

    newSocket.on('queue-joined', (data) => {
      setInQueue(true);
      setQueueStats(data.stats);
      toast.success('Searching for players...');
    });

    newSocket.on('match-found', (data) => {
      toast.success('Match found!');
      router.push(`/game/ludo/${data.gameId}`);
    });

    newSocket.on('queue-left', () => {
      setInQueue(false);
      toast.info('Left queue');
    });

    newSocket.on('error', (data) => {
      toast.error(data.message);
      setIsCreating(false);
      setInQueue(false);
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

  const createPrivateGame = () => {
    if (!socket || !userId) return;

    if (betAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsCreating(true);
    socket.emit('create-game', {
      userId,
      username,
      mode: selectedMode,
      betAmount,
      currency,
    });
  };

  const joinRandomMatch = () => {
    if (!socket || !userId) return;

    if (betAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    socket.emit('join-random', {
      userId,
      username,
      mode: selectedMode,
      betAmount,
      currency,
    });
  };

  const leaveQueue = () => {
    if (!socket || !userId) return;
    socket.emit('leave-queue', { userId });
    setInQueue(false);
  };

  const getModeInfo = (mode: LudoMode) => {
    switch (mode) {
      case '1v1':
        return { players: 2, description: 'Head to head battle' };
      case '2v2':
        return { players: 4, description: 'Team up with a partner' };
      case '1v1v1v1':
        return { players: 4, description: 'Free for all' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">← Ludo</Link>
          <div className="text-right">
            <div className="text-sm text-gray-400">Balance</div>
            <div className="text-xl font-bold text-primary">${balance.toFixed(2)}</div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🎲 Ludo</h1>
          <p className="text-gray-400">Provably fair multiplayer board game</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Select Game Mode</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {(['1v1', '2v2', '1v1v1v1'] as LudoMode[]).map((mode) => {
              const info = getModeInfo(mode);
              return (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedMode === mode
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl font-bold mb-2">{mode}</div>
                  <div className="text-sm text-gray-400">{info.players} Players</div>
                  <div className="text-xs text-gray-500 mt-1">{info.description}</div>
                </button>
              );
            })}
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Bet Amount (USD)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="input flex-1"
                min="1"
                disabled={inQueue || isCreating}
              />
              <button
                onClick={() => setBetAmount(10)}
                className="btn-secondary px-4"
                disabled={inQueue || isCreating}
              >
                $10
              </button>
              <button
                onClick={() => setBetAmount(50)}
                className="btn-secondary px-4"
                disabled={inQueue || isCreating}
              >
                $50
              </button>
              <button
                onClick={() => setBetAmount(100)}
                className="btn-secondary px-4"
                disabled={inQueue || isCreating}
              >
                $100
              </button>
            </div>
          </div>

          {!inQueue ? (
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={joinRandomMatch}
                className="btn-primary py-4 text-lg"
                disabled={isCreating || betAmount > balance}
              >
                🎮 Quick Match
              </button>
              <button
                onClick={createPrivateGame}
                className="btn-secondary py-4 text-lg"
                disabled={isCreating || betAmount > balance}
              >
                🔗 Create Private Game
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <div className="text-xl font-bold mb-2">Searching for players...</div>
              <div className="text-sm text-gray-400 mb-4">
                {queueStats.playersWaiting} players in queue
              </div>
              <button onClick={leaveQueue} className="btn-secondary">
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4">How to Play</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex gap-3">
              <span className="text-primary font-bold">1.</span>
              <span>Select game mode and bet amount</span>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">2.</span>
              <span>Join quick match or create private game to invite friends</span>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">3.</span>
              <span>Roll dice (provably fair) and move your tokens</span>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">4.</span>
              <span>First to get all 4 tokens home wins the pot!</span>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">💰</span>
              <span>Winner takes {selectedMode === '1v1v1v1' ? '97%' : '98%'} of total pot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
