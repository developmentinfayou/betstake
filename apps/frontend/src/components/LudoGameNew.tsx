'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { SimpleLudoGame } from '@/lib/simple-ludo';

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
  winner?: string;
  gameStatus: string;
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<LudoGameState | null>(null);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [validMoves, setValidMoves] = useState<any[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3001/ludo');
    
    newSocket.emit('join-game', { gameId, userId, username });

    newSocket.on('game-joined', (data) => {
      if (data.room) {
        setPlayers(data.room.players);
        if (data.room.status === 'playing' && data.gameState) {
          setGameState(data.gameState);
          setGameStatus('playing');
          setIsMyTurn(data.gameState.players[data.gameState.currentTurnIndex].userId === userId);
        }
      }
    });

    newSocket.on('game-started', (data) => {
      const initialState = SimpleLudoGame.initializeGame(players);
      setGameState(initialState);
      setGameStatus('playing');
      setIsMyTurn(initialState.players[0].userId === userId);
      toast.success('Game started!');
    });

    newSocket.on('dice-rolled', (data) => {
      if (!gameState) return;
      
      const newGameState = { ...gameState };
      newGameState.diceResult = data.result;
      
      const currentPlayer = SimpleLudoGame.getCurrentPlayer(newGameState);
      const moves = SimpleLudoGame.getValidMoves(currentPlayer, data.result);
      
      setGameState(newGameState);
      setDiceResult(data.result);
      setValidMoves(moves);
      setHasRolled(true);
      
      if (data.playerId === userId && moves.length === 0) {
        toast('No valid moves! Turn will pass automatically.');
        setTimeout(() => {
          // Auto-skip turn
          newGameState.currentTurnIndex = (newGameState.currentTurnIndex + 1) % newGameState.players.length;
          newGameState.diceResult = null;
          setGameState(newGameState);
          setIsMyTurn(newGameState.players[newGameState.currentTurnIndex].userId === userId);
          setHasRolled(false);
          setDiceResult(null);
          setValidMoves([]);
        }, 2000);
      }
    });

    newSocket.on('move-made', (data) => {
      if (!gameState) return;
      
      const result = SimpleLudoGame.makeMove(gameState, data.tokenId);
      
      if (result.success) {
        setGameState({ ...gameState });
        setDiceResult(null);
        setValidMoves([]);
        setHasRolled(false);
        
        if (result.gameWon) {
          setGameStatus('finished');
          const isWinner = gameState.winner === userId;
          toast.success(isWinner ? 'You won!' : 'Game over!');
          setTimeout(() => onGameEnd(), 3000);
        } else if (result.extraTurn && gameState.players[gameState.currentTurnIndex].userId === userId) {
          toast.success('Rolled 6! Extra turn!');
          setIsMyTurn(true);
        } else {
          setIsMyTurn(gameState.players[gameState.currentTurnIndex].userId === userId);
        }
      }
    });

    newSocket.on('error', (data) => {
      toast.error(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [gameId, userId, username, players]);

  useEffect(() => {
    if (gameState) {
      drawBoard();
    }
  }, [gameState, validMoves]);

  const rollDice = () => {
    if (!socket || !isMyTurn || hasRolled || !gameState) return;
    
    const result = SimpleLudoGame.rollDice();
    socket.emit('roll-dice', { gameId, userId, result });
  };

  const makeMove = (tokenId: number) => {
    if (!socket || !isMyTurn || !hasRolled || !gameState) return;
    
    const isValid = validMoves.some(m => m.tokenId === tokenId);
    if (!isValid) {
      toast.error('Invalid move');
      return;
    }

    socket.emit('make-move', { gameId, userId, tokenId });
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
    // Draw main path squares
    const pathPositions = getLudoPathPositions(size, cellSize);
    
    ctx.fillStyle = '#ffffff10';
    pathPositions.forEach((pos, i) => {
      ctx.fillRect(pos.x - cellSize/4, pos.y - cellSize/4, cellSize/2, cellSize/2);
      
      // Draw position numbers for debugging
      ctx.fillStyle = '#ffffff30';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(i.toString(), pos.x, pos.y - cellSize/3);
    });
  };

  const getLudoPathPositions = (size: number, cellSize: number) => {
    const positions = [];
    const center = size / 2;
    const radius = size * 0.35;

    // Create 58 positions (0-57) around the board
    for (let i = 0; i <= 57; i++) {
      if (i === 57) {
        // Finish position at center
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
      // Home position
      const homeIdx = ['RED', 'BLUE', 'GREEN', 'YELLOW'].indexOf(color);
      const home = homes[homeIdx];
      return {
        x: (home.x + 2 + (tokenIdx % 2) * 2) * cellSize + cellSize/2,
        y: (home.y + 2 + Math.floor(tokenIdx / 2) * 2) * cellSize + cellSize/2
      };
    } else {
      // On path or finished
      const pathPositions = getLudoPathPositions(size, cellSize);
      return pathPositions[token.position] || { x: size/2, y: size/2 };
    }
  };

  if (gameStatus === 'waiting') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-xl">Waiting for game to start...</div>
          <div className="text-sm text-gray-400 mt-2">
            Players: {players.map(p => p.username).join(', ')}
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState?.players[gameState?.currentTurnIndex || 0];
  const myPlayer = gameState?.players.find(p => p.userId === userId);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Ludo Game</h2>
          <div className="text-sm text-gray-400">
            Current Turn: <span className="font-bold" style={{ color: COLOR_MAP[currentPlayer?.color || 'RED'] }}>
              {currentPlayer?.username} ({currentPlayer?.color})
            </span>
          </div>
          {isMyTurn && <div className="text-primary font-bold">Your Turn!</div>}
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
              ) : (
                <div className="text-sm text-red-400">No valid moves - turn will pass automatically</div>
              )}
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
                className={`p-3 rounded-lg border-2 transition ${
                  validMoves.some(m => m.tokenId === i) && isMyTurn && hasRolled
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
              className={`p-3 rounded-lg flex items-center gap-3 ${
                currentPlayer?.userId === player.userId
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