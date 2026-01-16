'use client';

import { useState, useEffect, useRef } from 'react';
import { walletAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { useParams, useRouter } from 'next/navigation';

const COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
const COLOR_MAP: Record<string, string> = {
  RED: '#ef4444',
  BLUE: '#3b82f6',
  GREEN: '#10b981',
  YELLOW: '#eab308',
};

export default function LudoGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  
  const [room, setRoom] = useState<any>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [validMoves, setValidMoves] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [shareableLink, setShareableLink] = useState('');

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

    // Join existing game
    newSocket.emit('join-game', {
      gameId,
      userId: payload.id,
      username: payload.username || 'Player',
    });

    newSocket.on('game-created', (data) => {
      console.log('[Ludo Frontend] Game created:', data);
      setRoom(data.room);
      setShareableLink(`${window.location.origin}/game/ludo/join/${data.gameId}`);
    });

    newSocket.on('game-joined', (data) => {
      console.log('[Ludo Frontend] Game joined:', data);
      setRoom(data.room);
      if (data.gameState) {
        setGameState(data.gameState);
      }
    });

    newSocket.on('player-joined', (data) => {
      setRoom(data.room);
      toast.success(`${data.player.username} joined!`);
    });

    newSocket.on('player-reconnected', (data) => {
      toast.info(`${data.player.username} reconnected`);
    });

    newSocket.on('game-started', (data) => {
      setGameState(data.gameState);
      toast.success('Game started!');
    });

    newSocket.on('dice-rolled', (data) => {
      setDiceResult(data.result);
      setValidMoves(data.validMoves);
      setHasRolled(true);
      
      if (data.playerId === payload.id) {
        if (data.validMoves.length === 0) {
          toast.info('No valid moves!');
        }
      }
    });

    newSocket.on('move-made', (data) => {
      setGameState(data.gameState);
      setDiceResult(null);
      setValidMoves([]);
      setSelectedToken(null);
      setHasRolled(false);
      
      if (data.captured) {
        toast.success('Token captured!');
      }
    });

    newSocket.on('turn-changed', (data) => {
      setIsMyTurn(data.currentPlayerId === payload.id);
      setDiceResult(null);
      setHasRolled(false);
    });

    newSocket.on('extra-turn', (data) => {
      if (data.playerId === payload.id) {
        toast.success('Rolled 6! Extra turn!');
        setHasRolled(false);
      }
    });

    newSocket.on('auto-move', (data) => {
      toast.info('Auto-move (timeout)');
    });

    newSocket.on('game-ended', (data) => {
      const isWinner = data.winners?.includes(payload.id);
      if (isWinner) {
        toast.success(`You won $${data.payout.toFixed(2)}!`);
      } else {
        toast.error('Game over!');
      }
      loadBalance();
      
      setTimeout(() => {
        router.push('/game/ludo');
      }, 5000);
    });

    newSocket.on('player-forfeited', (data) => {
      toast.warning('Player forfeited');
    });

    newSocket.on('error', (data) => {
      toast.error(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [gameId]);

  useEffect(() => {
    if (gameState) {
      setIsMyTurn(gameState.players[gameState.currentTurnIndex]?.userId === userId);
      drawBoard();
    }
  }, [gameState, selectedToken]);

  const loadBalance = async () => {
    try {
      const response = await walletAPI.getAll();
      const usdWallet = response.data.find((w: any) => w.currency === 'USD');
      setBalance(usdWallet?.balance || 0);
    } catch (error) {
      console.error('Failed to load balance');
    }
  };

  const rollDice = () => {
    if (!socket || !isMyTurn || hasRolled) return;
    socket.emit('roll-dice', { gameId, userId });
  };

  const makeMove = (tokenId: number) => {
    if (!socket || !isMyTurn || !hasRolled) return;
    
    const isValid = validMoves.some(m => m.tokenId === tokenId);
    if (!isValid) {
      toast.error('Invalid move');
      return;
    }

    socket.emit('make-move', { gameId, userId, tokenId });
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast.success('Link copied!');
  };

  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 600;
    canvas.width = size;
    canvas.height = size;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);

    // Draw board (simplified)
    const cellSize = size / 15;

    // Draw grid
    ctx.strokeStyle = '#2a2a3e';
    for (let i = 0; i <= 15; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size, i * cellSize);
      ctx.stroke();
    }

    // Draw home areas (corners)
    const homes = [
      { x: 0, y: 0, color: 'RED' },
      { x: 9, y: 0, color: 'BLUE' },
      { x: 0, y: 9, color: 'GREEN' },
      { x: 9, y: 9, color: 'YELLOW' },
    ];

    homes.forEach(home => {
      ctx.fillStyle = COLOR_MAP[home.color] + '40';
      ctx.fillRect(home.x * cellSize, home.y * cellSize, 6 * cellSize, 6 * cellSize);
    });

    // Draw center
    ctx.fillStyle = '#ffffff20';
    ctx.fillRect(6 * cellSize, 6 * cellSize, 3 * cellSize, 3 * cellSize);

    // Draw tokens
    gameState.players.forEach((player: any) => {
      player.tokens.forEach((token: any, idx: number) => {
        if (token.isFinished) return;

        let x, y;
        if (token.position === -1) {
          // Home position
          const homeIdx = COLORS.indexOf(player.color);
          const homePos = homes[homeIdx];
          x = (homePos.x + 1 + (idx % 2) * 2) * cellSize + cellSize / 2;
          y = (homePos.y + 1 + Math.floor(idx / 2) * 2) * cellSize + cellSize / 2;
        } else {
          // On board (simplified positioning)
          const pos = token.position % 52;
          const angle = (pos / 52) * Math.PI * 2;
          const radius = size * 0.35;
          x = size / 2 + Math.cos(angle) * radius;
          y = size / 2 + Math.sin(angle) * radius;
        }

        // Draw token
        ctx.fillStyle = COLOR_MAP[player.color];
        ctx.beginPath();
        ctx.arc(x, y, cellSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Highlight if selectable
        if (selectedToken === idx && player.userId === userId) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Draw token number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((idx + 1).toString(), x, y);
      });
    });
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <div className="text-xl">Loading game...</div>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState?.players[gameState?.currentTurnIndex];
  const myPlayer = gameState?.players.find((p: any) => p.userId === userId);

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/game/ludo" className="text-2xl font-bold gradient-text">← Ludo</Link>
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
                <h2 className="text-2xl font-bold">
                  {room.mode} - ${room.betAmount} {room.currency}
                </h2>
                {room.status === 'waiting' && shareableLink && (
                  <button onClick={copyShareLink} className="btn-secondary text-sm">
                    📋 Copy Link
                  </button>
                )}
              </div>

              {room.status === 'waiting' ? (
                <div className="text-center py-12">
                  <div className="text-xl font-bold mb-4">Waiting for players...</div>
                  <div className="text-gray-400 mb-4">
                    {room.players.length} / {room.mode === '1v1' ? 2 : 4} players
                  </div>
                  <div className="space-y-2 mb-6">
                    {room.players.map((p: any, i: number) => (
                      <div key={i} className="text-sm">
                        {p.username}
                      </div>
                    ))}
                  </div>
                  {room.players.length >= (room.mode === '1v1' ? 2 : 4) && room.players[0].userId === userId && (
                    <button 
                      onClick={() => socket?.emit('start-game', { gameId, userId })}
                      className="btn-primary px-8 py-3"
                    >
                      🚀 Start Game
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <canvas
                    ref={canvasRef}
                    className="w-full rounded-lg border-2 border-gray-800"
                    onClick={(e) => {
                      if (!isMyTurn || !hasRolled) return;
                      // Token selection logic would go here
                    }}
                  />

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {isMyTurn && !hasRolled && (
                      <button onClick={rollDice} className="btn-primary py-3 col-span-2">
                        🎲 Roll Dice
                      </button>
                    )}
                    {diceResult && (
                      <div className="col-span-2 text-center">
                        <div className="text-4xl font-bold mb-2">🎲 {diceResult}</div>
                        {validMoves.length > 0 && isMyTurn && (
                          <div className="text-sm text-gray-400">Select a token to move</div>
                        )}
                        {validMoves.length === 0 && isMyTurn && (
                          <div className="text-sm text-red-400">No valid moves - turn will skip automatically</div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Players</h3>
              <div className="space-y-3">
                {gameState?.players.map((player: any, i: number) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg ${
                      currentPlayer?.userId === player.userId
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLOR_MAP[player.color] }}
                      />
                      <div className="flex-1">
                        <div className="font-bold">{player.username}</div>
                        <div className="text-xs text-gray-400">
                          {player.tokens.filter((t: any) => t.isFinished).length}/4 finished
                        </div>
                      </div>
                      {currentPlayer?.userId === player.userId && (
                        <div className="text-xs text-primary">● Turn</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {myPlayer && (
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Your Tokens</h3>
                <div className="grid grid-cols-2 gap-2">
                  {myPlayer.tokens.map((token: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => makeMove(i)}
                      disabled={!isMyTurn || !hasRolled || !validMoves.some(m => m.tokenId === i)}
                      className={`p-3 rounded-lg border-2 transition ${
                        validMoves.some(m => m.tokenId === i) && isMyTurn && hasRolled
                          ? 'border-primary bg-primary/10 hover:bg-primary/20 cursor-pointer'
                          : 'border-gray-700 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="text-xs">Token {i + 1}</div>
                      <div className="text-xs text-gray-400">
                        {token.isFinished ? '✓ Home' : token.position === -1 ? 'Start' : `Pos ${token.position}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Game Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mode:</span>
                  <span className="font-bold">{room.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bet:</span>
                  <span className="font-bold">${room.betAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Pot:</span>
                  <span className="font-bold text-primary">
                    ${(room.betAmount * room.players.length).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Winner Gets:</span>
                  <span className="font-bold text-green-500">
                    ${(room.betAmount * room.players.length * (room.mode === '1v1v1v1' ? 0.97 : 0.98)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
