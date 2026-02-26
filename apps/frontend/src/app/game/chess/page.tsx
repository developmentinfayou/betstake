import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { walletAPI, chessAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import ChessBoard from '@/components/games/chess/ChessBoard';
import ChessGameControls from '@/components/games/chess/ChessGameControls';
import '@/components/games/chess/chess.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type GamePhase = 'lobby' | 'waiting' | 'playing' | 'finished';

interface GameState {
    fen: string;
    pgn: string;
    playerWhite: string;
    playerBlack: string;
    currentTurn: 'white' | 'black';
    whiteTime: number;
    blackTime: number;
    moveCount: number;
    isCheck: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    isDraw: boolean;
    isGameOver: boolean;
    endReason?: string;
    winner?: string;
}

interface GameResult {
    winner?: string;
    winnerUsername?: string;
    endReason?: string;
    isDraw?: boolean;
    payout?: number;
    pgn?: string;
    shareableLink?: string;
}

const PRESET_MODES = [
    { category: 'Bullet', modes: ['1+0', '2+1'] },
    { category: 'Blitz', modes: ['3+0', '3+2', '5+0', '5+3'] },
    { category: 'Rapid', modes: ['10+0', '10+5', '15+10'] },
    { category: 'Classical', modes: ['30+0', '30+20'] },
];

export default function ChessPage() {
    // Auth
    const [user, setUser] = useState<any>(null);
    const [balance, setBalance] = useState(0);
    const [currency, setCurrency] = useState('USD');

    // Game phase
    const [phase, setPhase] = useState<GamePhase>('lobby');

    // Lobby state
    const [selectedMode, setSelectedMode] = useState('10+0');
    const [customBase, setCustomBase] = useState('');
    const [customIncrement, setCustomIncrement] = useState('');
    const [betAmount, setBetAmount] = useState(1);

    // Game state
    const [gameId, setGameId] = useState('');
    const [shareableLink, setShareableLink] = useState('');
    const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);
    const [drawOfferedBy, setDrawOfferedBy] = useState<string | null>(null);
    const [antiCheatWarning, setAntiCheatWarning] = useState<string | null>(null);
    const [players, setPlayers] = useState<{ white: string; black: string }>({ white: '', black: '' });

    // Join link input
    const [joinLink, setJoinLink] = useState('');

    // Socket
    const socketRef = useRef<Socket | null>(null);

    // Load user from JWT token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ id: payload.id, username: payload.username || 'Player' });
            } catch {
                setUser(null);
            }
        }
        loadBalance();
    }, []);

    const loadBalance = async () => {
        try {
            const res = await walletAPI.get(currency);
            setBalance(res.data.balance || 0);
        } catch {
            setBalance(0);
        }
    };

    useEffect(() => {
        loadBalance();
    }, [currency]);

    // Setup socket connection
    useEffect(() => {
        if (!user) return;

        const socket = io(`${API_URL}/chess`, {
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Chess] Connected to socket');

            // Auto-rejoin active game on reconnect/refresh
            const savedGameId = sessionStorage.getItem('chess_gameId');
            if (savedGameId) {
                console.log('[Chess] Rejoining game:', savedGameId);
                socket.emit('join-game', {
                    gameId: savedGameId,
                    userId: user.id,
                    username: user.username,
                });
                setGameId(savedGameId);
            }
        });

        socket.on('game-created', (data: any) => {
            setGameId(data.gameId);
            setShareableLink(data.shareableLink);
            setPhase('waiting');
            sessionStorage.setItem('chess_gameId', data.gameId);
            toast.success('Game created! Share the link with your opponent.');
        });

        socket.on('game-joined', (data: any) => {
            if (data.playerColor) {
                setPlayerColor(data.playerColor);
            }
            if (data.gameState) {
                setGameState(data.gameState);
                setPhase(data.gameState.isGameOver ? 'finished' : 'playing');
                // Set player names from room
                if (data.room?.players && data.gameState) {
                    updatePlayerNames(data.room.players, data.gameState);
                }
            } else {
                // No gameState means still in waiting phase
                setPhase('waiting');
            }
            // Persist gameId
            if (data.room?.gameId) {
                setGameId(data.room.gameId);
                sessionStorage.setItem('chess_gameId', data.room.gameId);
            }
        });

        socket.on('player-joined', (data: any) => {
            toast.success(`${data.player.username} joined the game!`);
        });

        socket.on('game-started', (data: any) => {
            setGameState(data.gameState);
            setPlayerColor(data.playerColor);
            setPhase('playing');
            toast.success(`Game started! You are ${data.playerColor}.`);
            if (data.room?.players && data.gameState) {
                updatePlayerNames(data.room.players, data.gameState);
            }
        });

        socket.on('move-made', (data: any) => {
            setGameState(data.gameState);
            setLastMove(data.move);
            if (data.clocks) {
                setGameState(prev => prev ? {
                    ...prev,
                    whiteTime: data.clocks.whiteTime,
                    blackTime: data.clocks.blackTime,
                } : prev);
            }
        });

        socket.on('clock-update', (data: any) => {
            setGameState(prev => prev ? {
                ...prev,
                whiteTime: data.whiteTime,
                blackTime: data.blackTime,
                currentTurn: data.currentTurn,
            } : prev);
        });

        socket.on('draw-offered', (data: any) => {
            if (data.byUserId !== user?.id) {
                setDrawOfferedBy(data.byUserId);
                toast('Your opponent offers a draw', { icon: '🤝' });
            }
        });

        socket.on('draw-declined', () => {
            setDrawOfferedBy(null);
            toast('Draw declined', { icon: '❌' });
        });

        socket.on('game-ended', (data: any) => {
            setGameState(data.gameState);
            setGameResult({
                winner: data.winner,
                winnerUsername: data.winnerUsername,
                endReason: data.endReason,
                isDraw: data.isDraw,
                payout: data.payout,
                pgn: data.pgn,
                shareableLink: data.shareableLink,
            });
            setPhase('finished');
            sessionStorage.removeItem('chess_gameId');

            if (data.isDraw) {
                toast('Game drawn!', { icon: '🤝' });
            } else if (data.winner === user?.id) {
                toast.success(`You won! +$${data.payout?.toFixed(2)}`);
            } else {
                toast.error('You lost!');
            }

            loadBalance();
        });

        socket.on('opponent-disconnected', (data: any) => {
            toast(data.message, { icon: '⚠️', duration: 5000 });
        });

        socket.on('player-forfeited', (data: any) => {
            toast('Opponent forfeited!', { icon: '🏳️' });
        });

        socket.on('anti-cheat-warning', (data: any) => {
            setAntiCheatWarning(data.message);
            setTimeout(() => setAntiCheatWarning(null), 5000);
        });

        socket.on('error', (data: any) => {
            toast.error(data.message);
        });

        // Tab focus tracking for anti-cheat
        const handleVisibilityChange = () => {
            const currentGameId = sessionStorage.getItem('chess_gameId');
            if (currentGameId) {
                socket.emit('tab-focus-change', {
                    gameId: currentGameId,
                    userId: user?.id,
                    focused: !document.hidden,
                });
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            socket.disconnect();
        };
    }, [user]);

    const updatePlayerNames = (roomPlayers: any[], gs: GameState) => {
        const white = roomPlayers.find((p: any) => p.userId === gs.playerWhite);
        const black = roomPlayers.find((p: any) => p.userId === gs.playerBlack);
        setPlayers({
            white: white?.username || 'White',
            black: black?.username || 'Black',
        });
    };

    // ─── Actions ───

    const createGame = useCallback(() => {
        if (!socketRef.current || !user) return;

        const mode = selectedMode === 'custom'
            ? `${customBase}+${customIncrement}`
            : selectedMode;

        socketRef.current.emit('create-game', {
            userId: user.id,
            username: user.username,
            mode,
            betAmount,
            currency,
        });
    }, [user, selectedMode, customBase, customIncrement, betAmount, currency]);

    const joinGame = useCallback((linkOrId: string) => {
        if (!socketRef.current || !user) return;

        // Extract gameId from various link formats
        let extractedId = linkOrId;
        if (linkOrId.includes('chess/')) {
            extractedId = linkOrId.split('chess/').pop() || linkOrId;
        }

        socketRef.current.emit('join-game', {
            gameId: extractedId,
            userId: user.id,
            username: user.username,
        });

        setGameId(extractedId);
        sessionStorage.setItem('chess_gameId', extractedId);
    }, [user]);

    const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
        if (!socketRef.current || !user || !gameId) return;

        socketRef.current.emit('make-move', {
            gameId,
            userId: user.id,
            move,
            tabFocused: !document.hidden,
        });
    }, [user, gameId]);

    const resign = useCallback(() => {
        if (!socketRef.current || !user || !gameId) return;
        if (!confirm('Are you sure you want to resign?')) return;

        socketRef.current.emit('resign', {
            gameId,
            userId: user.id,
        });
    }, [user, gameId]);

    const offerDraw = useCallback(() => {
        if (!socketRef.current || !user || !gameId) return;

        socketRef.current.emit('offer-draw', {
            gameId,
            userId: user.id,
        });

        toast('Draw offered', { icon: '🤝' });
    }, [user, gameId]);

    const acceptDraw = useCallback(() => {
        if (!socketRef.current || !user || !gameId) return;

        socketRef.current.emit('accept-draw', {
            gameId,
            userId: user.id,
        });
    }, [user, gameId]);

    const declineDraw = useCallback(() => {
        if (!socketRef.current || !user || !gameId) return;

        socketRef.current.emit('decline-draw', {
            gameId,
            userId: user.id,
        });

        setDrawOfferedBy(null);
    }, [user, gameId]);

    const leaveGame = useCallback(() => {
        if (!socketRef.current || !user) return;

        socketRef.current.emit('leave-game', { userId: user.id });
        resetToLobby();
    }, [user]);

    const resetToLobby = () => {
        setPhase('lobby');
        setGameId('');
        setShareableLink('');
        setGameState(null);
        setLastMove(null);
        setGameResult(null);
        setDrawOfferedBy(null);
        setAntiCheatWarning(null);
        sessionStorage.removeItem('chess_gameId');
        loadBalance();
    };

    const copyShareLink = () => {
        const fullUrl = `${window.location.origin}/game/chess?join=${gameId}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied!');
    };

    // Auto-join from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const joinId = params.get('join');
        if (joinId && user && socketRef.current) {
            joinGame(joinId);
        }
    }, [user]);

    // ─── Render ───

    if (!user) {
        return (
            <div className="chess-page">
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <h2>♚ Chess</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
                        Please log in to play chess.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="chess-page">
            {/* ─── LOBBY ─── */}
            {phase === 'lobby' && (
                <div className="chess-lobby" id="chess-lobby">
                    <h2>♚ Chess</h2>

                    {/* Mode Selector */}
                    <div className="mode-categories">
                        {PRESET_MODES.map(cat => (
                            <div key={cat.category} className="mode-category">
                                <h4>{cat.category}</h4>
                                <div className="mode-options">
                                    {cat.modes.map(mode => (
                                        <button
                                            key={mode}
                                            className={`mode-btn ${selectedMode === mode ? 'active' : ''}`}
                                            onClick={() => setSelectedMode(mode)}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Custom Mode */}
                        <div className="mode-category">
                            <h4>Custom</h4>
                            <div className="mode-options">
                                <button
                                    className={`mode-btn ${selectedMode === 'custom' ? 'active' : ''}`}
                                    onClick={() => setSelectedMode('custom')}
                                >
                                    Custom
                                </button>
                            </div>
                            {selectedMode === 'custom' && (
                                <div className="custom-mode-input">
                                    <input
                                        type="number"
                                        value={customBase}
                                        onChange={e => setCustomBase(e.target.value)}
                                        placeholder="Min"
                                        min="1"
                                        max="120"
                                    />
                                    <span>+</span>
                                    <input
                                        type="number"
                                        value={customIncrement}
                                        onChange={e => setCustomIncrement(e.target.value)}
                                        placeholder="Sec"
                                        min="0"
                                        max="60"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bet Section */}
                    <div className="bet-section">
                        <label>Bet Amount</label>
                        <div className="bet-input-group">
                            <input
                                type="number"
                                value={betAmount}
                                onChange={e => setBetAmount(Number(e.target.value))}
                                min={1}
                                step={0.01}
                                id="bet-amount-input"
                            />
                            <select value={currency} onChange={e => setCurrency(e.target.value)}>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                        <div className="balance-display">
                            Balance: <strong>${balance.toFixed(2)}</strong>
                        </div>
                    </div>

                    {/* Create Game Button */}
                    <button
                        className="btn-create-game"
                        onClick={createGame}
                        disabled={betAmount <= 0 || betAmount > balance}
                        id="create-game-btn"
                    >
                        Create Game ({selectedMode === 'custom' ? `${customBase || '?'}+${customIncrement || '?'}` : selectedMode})
                    </button>

                    {/* Join Game Section */}
                    <div className="join-section">
                        <h4>Join a Game</h4>
                        <div className="join-input-group">
                            <input
                                type="text"
                                value={joinLink}
                                onChange={e => setJoinLink(e.target.value)}
                                placeholder="Paste game link or ID..."
                                id="join-link-input"
                            />
                            <button onClick={() => joinGame(joinLink)} disabled={!joinLink} id="join-game-btn">
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── WAITING ROOM ─── */}
            {phase === 'waiting' && (
                <div className="waiting-room" id="waiting-room">
                    <h3>Waiting for opponent...</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                        Share this link with your opponent:
                    </p>
                    <div className="share-link-box">
                        <input
                            readOnly
                            value={`${window.location.origin}/game/chess?join=${gameId}`}
                            id="share-link-display"
                        />
                        <button onClick={copyShareLink}>Copy</button>
                    </div>
                    <div className="waiting-spinner">⏳ Waiting for player 2...</div>
                    <button className="btn-cancel-game" onClick={leaveGame} id="cancel-game-btn">
                        Cancel Game
                    </button>
                </div>
            )}

            {/* ─── PLAYING ─── */}
            {(phase === 'playing' || phase === 'finished') && gameState && (
                <div className="chess-game-container" id="chess-game">
                    <ChessBoard
                        fen={gameState.fen}
                        playerColor={playerColor}
                        isMyTurn={gameState.currentTurn === playerColor && !gameState.isGameOver}
                        lastMove={lastMove}
                        onMove={makeMove}
                        disabled={gameState.isGameOver}
                    />

                    <ChessGameControls
                        whiteTime={gameState.whiteTime}
                        blackTime={gameState.blackTime}
                        currentTurn={gameState.currentTurn}
                        playerColor={playerColor}
                        isGameOver={gameState.isGameOver}
                        pgn={gameState.pgn}
                        moveCount={gameState.moveCount}
                        onResign={resign}
                        onOfferDraw={offerDraw}
                        drawOffered={drawOfferedBy !== null && drawOfferedBy !== user?.id}
                        onAcceptDraw={acceptDraw}
                        onDeclineDraw={declineDraw}
                        gameResult={gameResult || undefined}
                        players={players}
                    />

                    {/* Anti-cheat warning */}
                    {antiCheatWarning && (
                        <div className="anticheat-warning">
                            ⚠️ {antiCheatWarning}
                        </div>
                    )}

                    {/* Game over actions */}
                    {phase === 'finished' && (
                        <div className="game-over-actions">
                            <button className="btn-share" onClick={copyShareLink} id="share-result-btn">
                                📋 Share Game
                            </button>
                            <button className="btn-new-game" onClick={resetToLobby} id="new-game-btn">
                                🎮 New Game
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
