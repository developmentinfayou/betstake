import { useState, useEffect, useRef } from 'react';
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
  teamId?: number;
}

interface LudoGameState {
  players: LudoPlayer[];
  currentTurnIndex: number;
  diceResult: number | null;
  moveHistory: any[];
  winner?: string;
  winningTeam?: number;
}

const COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
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

  useEffect(() => {
    const newSocket = io('http://localhost:3001/ludo');
    
    newSocket.emit('join-game', { gameId, userId, username });

    newSocket.on('game-started', (data) => {
      setGameState(data.gameState);
      setGameStatus('playing');
      setIsMyTurn(data.gameState.players[0].userId === userId);
      toast.success('Game started!');
    });

    newSocket.on('dice-rolled', (data) => {
      setDiceResult(data.result);
      setValidMoves(data.validMoves);
      setHasRolled(true);
      
      if (data.playerId === userId && data.validMoves.length === 0) {
        toast('No valid moves! Turn will pass automatically.');
        setTimeout(() => {
          setHasRolled(false);
          setDiceResult(null);
        }, 2000);
      }
    });

    newSocket.on('move-made', (data) => {
      setGameState(data.gameState);
      setDiceResult(null);
      setValidMoves([]);
      setHasRolled(false);
      
      if (data.captured) {
        toast.success(`${data.captured.playerId} token captured!`);
      }
    });

    newSocket.on('turn-changed', (data) => {
      setIsMyTurn(data.currentPlayerId === userId);
      setDiceResult(null);
      setHasRolled(false);
    });

    newSocket.on('extra-turn', (data) => {
      if (data.playerId === userId) {
        toast.success('Rolled 6! Extra turn!');
        setHasRolled(false);
        setDiceResult(null);
      }
    });

    newSocket.on('game-ended', (data) => {
      setGameStatus('finished');
      const isWinner = data.winners?.includes(userId);
      
      if (isWinner) {
        toast.success(`You won $${data.payout.toFixed(2)}!`);
      } else {
        toast.error('Game over!');
      }
      
      setTimeout(() => {
        onGameEnd();
      }, 3000);
    });

    newSocket.on('error', (data) => {
      toast.error(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [gameId, userId, username]);

  useEffect(() => {
    if (gameState) {
      drawBoard();
    }
  }, [gameState, validMoves]);

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

    // Draw center
    ctx.fillStyle = '#ffffff20';
    ctx.fillRect(6 * cellSize, 6 * cellSize, 3 * cellSize, 3 * cellSize);

    // Draw path
    drawLudoPath(ctx, size, cellSize);

    // Draw tokens
    gameState.players.forEach((player) => {
      player.tokens.forEach((token, idx) => {
        if (token.isFinished) return;

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
    pathPositions.forEach(pos => {
      ctx.fillRect(pos.x - cellSize/4, pos.y - cellSize/4, cellSize/2, cellSize/2);
    });

    // Draw safe squares
    const safePositions = [0, 8, 13, 21, 26, 34, 39, 47];
    ctx.fillStyle = '#00ff0020';
    safePositions.forEach(safePos => {
      if (pathPositions[safePos]) {
        const pos = pathPositions[safePos];
        ctx.fillRect(pos.x - cellSize/3, pos.y - cellSize/3, cellSize*2/3, cellSize*2/3);
      }
    });
  };

  const getLudoPathPositions = (size: number, cellSize: number) => {
    const positions = [];
    const center = size / 2;
    const radius = size * 0.35;

    // Create 52 positions around the board
    for (let i = 0; i < 52; i++) {
      const angle = (i / 52) * Math.PI * 2 - Math.PI / 2;
      positions.push({
        x: center + Math.cos(angle) * radius,
        y: center + Math.sin(angle) * radius
      });
    }

    return positions;
  };

  const getTokenPosition = (token: LudoToken, color: string, tokenIdx: number, homes: any[], size: number, cellSize: number) => {
    if (token.position === -1) {
      // Home position
      const homeIdx = COLORS.indexOf(color);
      const home = homes[homeIdx];
      return {
        x: (home.x + 2 + (tokenIdx % 2) * 2) * cellSize + cellSize/2,
        y: (home.y + 2 + Math.floor(tokenIdx / 2) * 2) * cellSize + cellSize/2
      };
    } else if (token.position >= 57) {
      // Finished position
      return {
        x: size / 2,
        y: size / 2
      };
    } else {
      // On path
      const pathPositions = getLudoPathPositions(size, cellSize);
      const pos = token.position % 52;
      return pathPositions[pos] || { x: size/2, y: size/2 };
    }
  };

  if (gameStatus === 'waiting') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-xl">Waiting for game to start...</div>
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
            Current Turn: {currentPlayer?.username} ({currentPlayer?.color})
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full max-w-2xl mx-auto rounded-lg border-2 border-gray-700"
          onClick={(e) => {
            // Handle canvas clicks for token selection
            if (!isMyTurn || !hasRolled) return;
            // Token selection logic would go here
          }}
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
                <div className="text-sm text-gray-400">Select a token to move</div>
              ) : (
                <div className="text-sm text-red-400">No valid moves</div>
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