import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface LudoToken {
  id: number;
  position: number; // -1 = home, 0-56 = path, 57 = finished
  isFinished: boolean;
}

interface LudoPlayer {
  userId: string;
  username: string;
  color: string;
  tokens: LudoToken[];
}

interface LudoGameState {
  players: LudoPlayer[];
  currentTurnIndex: number;
  diceResult: number | null;
  serverSeedHash: string;
  winner?: string;
}

const COLOR_MAP: Record<string, string> = {
  RED: '#ef4444',
  BLUE: '#3b82f6',
  GREEN: '#10b981',
  YELLOW: '#eab308',
};

interface LudoGameProps {
  gameId: string;
  userId: string;
  username: string;
  onGameEnd: () => void;
}

export default function LudoGame({ gameId, userId, username, onGameEnd }: LudoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const gameStateRef = useRef<LudoGameState | null>(null);

  const [gameState, setGameState] = useState<LudoGameState | null>(null);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [validMoves, setValidMoves] = useState<any[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [players, setPlayers] = useState<any[]>([]);
  const [gameResult, setGameResult] = useState<any>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Helper to update gameState in both ref and state
  const updateGameState = useCallback((newState: LudoGameState) => {
    gameStateRef.current = newState;
    setGameState(newState);
    setIsMyTurn(newState.players[newState.currentTurnIndex]?.userId === userId);
  }, [userId]);

  // Reset turn state
  const resetTurnState = useCallback(() => {
    setDiceResult(null);
    setValidMoves([]);
    setHasRolled(false);
  }, []);

  useEffect(() => {
    // Prevent duplicate connections
    if (socketRef.current) return;

    const newSocket = io('http://localhost:3001/ludo', {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = newSocket;

    // Join the game room
    newSocket.emit('join-game', { gameId, userId, username });

    // --- Event Handlers ---

    newSocket.on('game-joined', (data) => {
      if (data.room) {
        setPlayers(data.room.players);
        if (data.room.status === 'playing' && data.gameState) {
          updateGameState(data.gameState);
          setGameStatus('playing');
          resetTurnState();
        }
      }
    });

    newSocket.on('player-joined', (data) => {
      if (data.room) {
        setPlayers(data.room.players);
      }
      toast.success(`${data.player.username} joined!`);
    });

    newSocket.on('game-started', (data) => {
      if (data.gameState) {
        updateGameState(data.gameState);
      }
      setGameStatus('playing');
      resetTurnState();
      toast.success('Game started!');
    });

    newSocket.on('dice-rolled', (data) => {
      setDiceResult(data.result);
      setValidMoves(data.validMoves || []);
      setHasRolled(true);

      // Update current gameState's dice result
      const current = gameStateRef.current;
      if (current) {
        const updated = { ...current, diceResult: data.result };
        gameStateRef.current = updated;
        setGameState(updated);
      }

      if (data.playerId === userId && (!data.validMoves || data.validMoves.length === 0)) {
        toast('No valid moves! Turn will pass automatically.');
      }
    });

    newSocket.on('move-made', (data) => {
      if (data.gameState) {
        updateGameState(data.gameState);
      }
      resetTurnState();

      if (data.captured) {
        toast(`Token captured!`, { icon: '💥' });
      }
    });

    newSocket.on('turn-changed', (data) => {
      resetTurnState();
      setIsMyTurn(data.currentPlayerId === userId);
    });

    newSocket.on('extra-turn', (data) => {
      resetTurnState();
      if (data.playerId === userId) {
        setIsMyTurn(true);
        toast.success('Rolled 6! Extra turn!');
      } else {
        setIsMyTurn(false);
      }
    });

    newSocket.on('auto-move', (data) => {
      if (data.gameState) {
        updateGameState(data.gameState);
      }
      resetTurnState();
      toast(`${data.playerId === userId ? 'Your' : "Opponent's"} turn timed out — auto move played.`);
    });

    newSocket.on('game-ended', (data) => {
      setGameStatus('finished');
      if (data.gameState) {
        updateGameState(data.gameState);
      }
      setGameResult(data);

      const isWinner = data.winners?.includes(userId);
      if (data.forfeitedBy) {
        toast.success(data.forfeitedBy === userId ? 'You forfeited!' : 'Opponent forfeited — you win!');
      } else {
        toast.success(isWinner ? `You won $${data.payout?.toFixed(2)}!` : 'Game over!');
      }

      setTimeout(() => onGameEnd(), 5000);
    });

    newSocket.on('player-forfeited', (data) => {
      toast(`A player left the game.`, { icon: '🚪' });
    });

    newSocket.on('error', (data) => {
      toast.error(data.message);
    });

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [gameId, userId, username]); // No `players` — prevents reconnection loop

  // Redraw board when state changes
  useEffect(() => {
    if (gameState) {
      drawBoard();
    }
  }, [gameState, validMoves]);

  const rollDice = () => {
    if (!socketRef.current || !isMyTurn || hasRolled || !gameStateRef.current) return;
    socketRef.current.emit('roll-dice', { gameId, userId });
  };

  const makeMove = (tokenId: number) => {
    if (!socketRef.current || !isMyTurn || !hasRolled || !gameStateRef.current) return;

    const isValid = validMoves.some(m => m.tokenId === tokenId);
    if (!isValid) {
      toast.error('Invalid move');
      return;
    }

    socketRef.current.emit('make-move', { gameId, userId, tokenId });
  };

  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 600;
    canvas.width = size;
    canvas.height = size;

    // Clear background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);

    const cellSize = size / 15;

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
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

    // Draw home areas
    const homes = [
      { x: 0, y: 0, color: 'RED' },
      { x: 9, y: 0, color: 'BLUE' },
      { x: 0, y: 9, color: 'GREEN' },
      { x: 9, y: 9, color: 'YELLOW' },
    ];

    homes.forEach(home => {
      ctx.fillStyle = COLOR_MAP[home.color] + '40';
      ctx.fillRect(home.x * cellSize, home.y * cellSize, 6 * cellSize, 6 * cellSize);

      ctx.strokeStyle = COLOR_MAP[home.color];
      ctx.lineWidth = 2;
      ctx.strokeRect(home.x * cellSize, home.y * cellSize, 6 * cellSize, 6 * cellSize);
    });

    // Draw center (finish area)
    ctx.fillStyle = '#ffffff20';
    ctx.fillRect(6 * cellSize, 6 * cellSize, 3 * cellSize, 3 * cellSize);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(6 * cellSize, 6 * cellSize, 3 * cellSize, 3 * cellSize);

    // Draw path
    drawLudoPath(ctx, size, cellSize);

    // Draw tokens
    gameState.players.forEach((player) => {
      player.tokens.forEach((token, idx) => {
        const { x, y } = getTokenPosition(token, player.color, idx, homes, size, cellSize);

        // Token shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, cellSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Token
        ctx.fillStyle = COLOR_MAP[player.color];
        ctx.beginPath();
        ctx.arc(x, y, cellSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Token border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Highlight selectable tokens
        const isSelectable = validMoves.some(m => m.tokenId === idx) &&
          player.userId === userId && isMyTurn && hasRolled;
        if (isSelectable) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, cellSize * 0.4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Token number
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((idx + 1).toString(), x, y);
      });
    });
  };

  const drawLudoPath = (ctx: CanvasRenderingContext2D, size: number, cellSize: number) => {
    const pathPositions = getLudoPathPositions(size, cellSize);

    ctx.fillStyle = '#ffffff10';
    pathPositions.forEach((pos, i) => {
      ctx.fillRect(pos.x - cellSize / 4, pos.y - cellSize / 4, cellSize / 2, cellSize / 2);

      ctx.fillStyle = '#ffffff30';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(i.toString(), pos.x, pos.y - cellSize / 3);
    });
  };

  const getLudoPathPositions = (size: number, cellSize: number) => {
    const positions = [];
    const center = size / 2;
    const radius = size * 0.35;

    for (let i = 0; i <= 57; i++) {
      if (i === 57) {
        positions.push({ x: center, y: center });
      } else {
        const angle = (i / 52) * Math.PI * 2 - Math.PI / 2;
        positions.push({
          x: center + Math.cos(angle) * radius,
          y: center + Math.sin(angle) * radius
        });
      }
    }

    return positions;
  };

  const getTokenPosition = (token: LudoToken, color: string, tokenIdx: number, homes: any[], size: number, cellSize: number) => {
    if (token.position === -1) {
      const homeIdx = ['RED', 'BLUE', 'GREEN', 'YELLOW'].indexOf(color);
      const home = homes[homeIdx];
      return {
        x: (home.x + 2 + (tokenIdx % 2) * 2) * cellSize + cellSize / 2,
        y: (home.y + 2 + Math.floor(tokenIdx / 2) * 2) * cellSize + cellSize / 2
      };
    } else {
      const pathPositions = getLudoPathPositions(size, cellSize);
      return pathPositions[token.position] || { x: size / 2, y: size / 2 };
    }
  };

  const leaveGame = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('leave-game', { userId });
    onGameEnd();
  };

  // --- Waiting Screen ---
  if (gameStatus === 'waiting') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-xl">Waiting for game to start...</div>
          <div className="text-sm text-gray-400 mt-2">
            Players: {players.map(p => p.username).join(', ')}
          </div>
          <button onClick={leaveGame} className="btn-secondary mt-4 px-6 py-2">
            ← Leave Game (Refund)
          </button>
        </div>
      </div>
    );
  }

  // --- Game Over Screen ---
  if (gameStatus === 'finished' && gameResult) {
    const isWinner = gameResult.winners?.includes(userId);
    return (
      <div className="space-y-6">
        <div className="card text-center">
          <div className="text-4xl mb-4">{isWinner ? '🏆' : '💔'}</div>
          <h2 className="text-3xl font-bold mb-2">{isWinner ? 'You Won!' : 'Game Over'}</h2>
          {isWinner && gameResult.payout && (
            <div className="text-2xl text-green-400 font-bold mb-4">+${gameResult.payout.toFixed(2)}</div>
          )}
          {gameResult.forfeitedBy && (
            <div className="text-sm text-gray-400 mb-4">
              {gameResult.forfeitedBy === userId ? 'You forfeited' : 'Opponent forfeited'}
            </div>
          )}
          {gameResult.serverSeed && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg text-left">
              <div className="text-xs text-gray-400 mb-1">Server Seed (for verification)</div>
              <div className="text-xs font-mono break-all">{gameResult.serverSeed}</div>
            </div>
          )}
          <button onClick={onGameEnd} className="btn-primary mt-6 px-8 py-3">
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  // --- Playing Screen ---
  const currentPlayer = gameState?.players[gameState?.currentTurnIndex || 0];
  const myPlayer = gameState?.players.find(p => p.userId === userId);

  return (
    <div className="space-y-6">
      {/* Leave/Forfeit Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card max-w-sm mx-4">
            <h3 className="text-xl font-bold mb-3 text-red-400">⚠️ Forfeit Game?</h3>
            <p className="text-gray-300 mb-2">If you leave now:</p>
            <ul className="text-sm text-gray-400 mb-4 space-y-1">
              <li>• You will <span className="text-red-400 font-bold">lose your bet</span></li>
              <li>• Remaining players will <span className="text-green-400 font-bold">split the pot</span></li>
            </ul>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveConfirm(false)} className="btn-secondary flex-1 py-2">
                Cancel
              </button>
              <button onClick={leaveGame} className="bg-red-600 hover:bg-red-700 text-white rounded-lg flex-1 py-2 font-bold transition">
                Forfeit & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Ludo Game</h2>
            <div className="text-sm text-gray-400">
              Current Turn: <span className="font-bold" style={{ color: COLOR_MAP[currentPlayer?.color || 'RED'] }}>
                {currentPlayer?.username} ({currentPlayer?.color})
              </span>
            </div>
            {isMyTurn && <div className="text-primary font-bold">Your Turn!</div>}
          </div>
          <button onClick={() => setShowLeaveConfirm(true)} className="text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-1.5 rounded-lg transition">
            🚪 Leave
          </button>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full max-w-2xl mx-auto rounded-lg border-2 border-gray-700"
        />

        <div className="mt-4 text-center">
          {isMyTurn && !hasRolled && (
            <button onClick={rollDice} className="btn-primary px-8 py-3 text-lg">
              🎲 Roll Dice
            </button>
          )}

          {diceResult && (
            <div className="mb-4">
              <div className="text-4xl font-bold mb-2">🎲 {diceResult}</div>
              {validMoves.length > 0 && isMyTurn ? (
                <div className="text-sm text-gray-400">Select a token to move (click buttons below)</div>
              ) : isMyTurn ? (
                <div className="text-sm text-red-400">No valid moves - turn will pass automatically</div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {myPlayer && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Your Tokens ({myPlayer.color})</h3>
          <div className="grid grid-cols-4 gap-2">
            {myPlayer.tokens.map((token, i) => (
              <button
                key={i}
                onClick={() => makeMove(i)}
                disabled={!isMyTurn || !hasRolled || !validMoves.some(m => m.tokenId === i)}
                className={`p-3 rounded-lg border-2 transition ${validMoves.some(m => m.tokenId === i) && isMyTurn && hasRolled
                  ? 'border-primary bg-primary/10 hover:bg-primary/20 cursor-pointer'
                  : 'border-gray-700 opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs">Token {i + 1}</div>
                <div className="text-xs text-gray-400">
                  {token.isFinished ? '✓ Finished' :
                    token.position === -1 ? 'Home' :
                      `Pos ${token.position}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-xl font-bold mb-4">Players</h3>
        <div className="space-y-2">
          {gameState?.players.map((player, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg flex items-center gap-3 ${currentPlayer?.userId === player.userId
                ? 'bg-primary/20 border-2 border-primary'
                : 'bg-gray-800'
                }`}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLOR_MAP[player.color] }}
              />
              <div className="flex-1">
                <div className="font-bold">{player.username}</div>
                <div className="text-xs text-gray-400">
                  {player.tokens.filter(t => t.isFinished).length}/4 finished
                </div>
              </div>
              {currentPlayer?.userId === player.userId && (
                <div className="text-xs text-primary">● Turn</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}