import { Server, Socket } from 'socket.io';
import { PVPGame, PVPGameStatus, PVPGameType, UserStats, Currency } from '@casino/database';
import { ChessEngine, parseTimeControl, ChessGameState } from '@casino/game-engine';
import { nanoid } from 'nanoid';
import { WalletService } from '../services/wallet-service';
import { ChessAntiCheat } from '../services/chess-anticheat';

interface ChessRoom {
    gameId: string;
    dbId?: string;          // MongoDB _id
    mode: string;            // e.g. "15+10"
    betAmount: number;
    currency: Currency;
    players: Array<{ userId: string; username: string; socketId: string }>;
    gameState: ChessGameState | null;
    status: 'waiting' | 'playing' | 'finished';
    clockInterval: NodeJS.Timeout | null;
    createdAt: number;
}

const rooms = new Map<string, ChessRoom>();
const playerToRoom = new Map<string, string>(); // userId -> gameId
const lastActionTime = new Map<string, number>(); // rate limiting
const RATE_LIMIT_MS = 200;
const HOUSE_EDGE_PERCENT = 2; // 2% house edge

export function setupChessSocket(io: Server) {
    const chessNamespace = io.of('/chess');

    chessNamespace.on('connection', (socket: Socket) => {
        console.log('[Chess] Player connected:', socket.id);

        // ─────────── CREATE GAME ───────────
        socket.on('create-game', async (data: {
            userId: string;
            username: string;
            mode: string;        // e.g. "15+10", "3+2"
            betAmount: number;
            currency: string;
        }) => {
            console.log(`[Chess] Creating game for ${data.userId}, mode: ${data.mode}`);
            try {
                // Validate time control
                const tc = parseTimeControl(data.mode);

                // Check balance
                const balance = await WalletService.getAvailableBalance(data.userId, data.currency as Currency);
                if (balance < data.betAmount) {
                    socket.emit('error', { message: 'Insufficient balance' });
                    return;
                }

                // Debit wallet
                await WalletService.debitBalance(data.userId, data.currency as Currency, data.betAmount);

                const gameId = nanoid(10);
                const shareableLink = `chess/${gameId}`;

                const room: ChessRoom = {
                    gameId,
                    mode: data.mode,
                    betAmount: data.betAmount,
                    currency: data.currency as Currency,
                    players: [{ userId: data.userId, username: data.username, socketId: socket.id }],
                    gameState: null,
                    status: 'waiting',
                    clockInterval: null,
                    createdAt: Date.now(),
                };

                rooms.set(gameId, room);
                playerToRoom.set(data.userId, gameId);
                socket.join(gameId);

                // Save to database
                const dbGame = await PVPGame.create({
                    gameType: PVPGameType.CHESS,
                    mode: data.mode,
                    players: [data.userId],
                    betAmount: data.betAmount,
                    currency: data.currency,
                    status: PVPGameStatus.WAITING,
                    gameState: {},
                    shareableLink,
                    timeControl: {
                        baseTime: tc.baseTime,
                        increment: tc.increment,
                        whiteTime: tc.baseTime * 1000,
                        blackTime: tc.baseTime * 1000,
                    },
                });

                room.dbId = dbGame._id.toString();

                socket.emit('game-created', {
                    gameId,
                    shareableLink,
                    room: sanitizeRoom(room),
                });

                socket.emit('game-joined', {
                    room: sanitizeRoom(room),
                    gameState: null,
                });

            } catch (error: any) {
                console.error('[Chess] Error creating game:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // ─────────── JOIN GAME ───────────
        socket.on('join-game', async (data: {
            gameId: string;
            userId: string;
            username: string;
        }) => {
            console.log(`[Chess] Player ${data.userId} joining game ${data.gameId}`);

            try {
                // Find in database
                const dbGame = await PVPGame.findOne({
                    $or: [
                        { shareableLink: `chess/${data.gameId}` },
                        { shareableLink: data.gameId },
                    ]
                });

                if (!dbGame) {
                    socket.emit('error', { message: 'Game not found' });
                    return;
                }

                // Get or restore room
                let room = rooms.get(data.gameId);
                if (!room) {
                    room = {
                        gameId: data.gameId,
                        dbId: dbGame._id.toString(),
                        mode: dbGame.mode,
                        betAmount: dbGame.betAmount,
                        currency: dbGame.currency as Currency,
                        players: dbGame.players.map((pid: any, i: number) => ({
                            userId: pid.toString(),
                            username: `Player${i + 1}`,
                            socketId: '',
                        })),
                        gameState: dbGame.gameState as ChessGameState || null,
                        status: dbGame.status === PVPGameStatus.WAITING ? 'waiting' :
                            dbGame.status === PVPGameStatus.ACTIVE ? 'playing' : 'finished',
                        clockInterval: null,
                        createdAt: dbGame.createdAt?.getTime() || Date.now(),
                    };
                    rooms.set(data.gameId, room);
                }

                // Check if player is reconnecting
                const existingPlayer = room.players.find(p => p.userId === data.userId);
                if (existingPlayer) {
                    existingPlayer.socketId = socket.id;
                    existingPlayer.username = data.username;
                    playerToRoom.set(data.userId, data.gameId);
                    socket.join(data.gameId);

                    // Send current state
                    const playerColor = room.gameState
                        ? (data.userId === room.gameState.playerWhite ? 'white' : 'black')
                        : null;

                    socket.emit('game-joined', {
                        room: sanitizeRoom(room),
                        gameState: room.gameState ? sanitizeGameState(room.gameState) : null,
                        playerColor,
                    });

                    // Restart clock emitting if game is active
                    if (room.status === 'playing' && room.gameState && !room.gameState.isGameOver) {
                        startClockEmitter(room, chessNamespace);
                    }
                    return;
                }

                // New player joining
                if (room.status !== 'waiting') {
                    socket.emit('error', { message: 'Game already started' });
                    return;
                }

                if (room.players.length >= 2) {
                    socket.emit('error', { message: 'Game is full' });
                    return;
                }

                if (room.players[0].userId === data.userId) {
                    socket.emit('error', { message: 'Cannot play against yourself' });
                    return;
                }

                // Check balance and debit
                const balance = await WalletService.getAvailableBalance(data.userId, room.currency);
                if (balance < room.betAmount) {
                    socket.emit('error', { message: 'Insufficient balance' });
                    return;
                }

                await WalletService.debitBalance(data.userId, room.currency, room.betAmount);

                // Add player
                room.players.push({
                    userId: data.userId,
                    username: data.username,
                    socketId: socket.id,
                });

                playerToRoom.set(data.userId, data.gameId);
                socket.join(data.gameId);

                // Update database
                await PVPGame.findByIdAndUpdate(dbGame._id, {
                    $push: { players: data.userId },
                });

                chessNamespace.to(data.gameId).emit('player-joined', {
                    player: { userId: data.userId, username: data.username },
                    room: sanitizeRoom(room),
                });

                // Auto-start when 2 players
                if (room.players.length === 2) {
                    startGame(room, chessNamespace);
                }

            } catch (error: any) {
                console.error('[Chess] Error joining game:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // ─────────── MAKE MOVE ───────────
        socket.on('make-move', async (data: {
            gameId: string;
            userId: string;
            move: { from: string; to: string; promotion?: string };
            tabFocused?: boolean;
        }) => {
            // Rate limiting
            const now = Date.now();
            const lastAction = lastActionTime.get(data.userId) || 0;
            if (now - lastAction < RATE_LIMIT_MS) {
                socket.emit('error', { message: 'Too fast, please slow down' });
                return;
            }
            lastActionTime.set(data.userId, now);

            const room = rooms.get(data.gameId);
            if (!room || !room.gameState) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            if (room.status !== 'playing' || room.gameState.isGameOver) {
                socket.emit('error', { message: 'Game is not active' });
                return;
            }

            const gs = room.gameState;
            const tc = parseTimeControl(room.mode);

            // Calculate move time
            const moveTimeMs = now - gs.lastMoveAt;

            // Validate and apply the move
            const result = ChessEngine.validateAndApplyMove(gs, data.userId, data.move, tc.increment);

            if (!result.success) {
                socket.emit('error', { message: result.error || 'Invalid move' });
                return;
            }

            // Anti-cheat analysis
            const acResult = ChessAntiCheat.analyzeMove(
                data.gameId,
                data.userId,
                result.san || '',
                gs.fen,          // position BEFORE the move
                moveTimeMs,
                data.tabFocused !== false,
            );

            if (!acResult.allowed) {
                socket.emit('error', { message: acResult.reason || 'Move rejected' });
                return;
            }

            if (acResult.warningMessage) {
                socket.emit('anti-cheat-warning', { message: acResult.warningMessage });
            }

            // Update room state
            room.gameState = result.gameState;

            // Broadcast the move
            chessNamespace.to(data.gameId).emit('move-made', {
                playerId: data.userId,
                move: data.move,
                san: result.san,
                gameState: sanitizeGameState(room.gameState),
                clocks: {
                    whiteTime: room.gameState.whiteTime,
                    blackTime: room.gameState.blackTime,
                },
            });

            // Check if game ended
            if (room.gameState.isGameOver) {
                await endGame(room, chessNamespace);
            }
        });

        // ─────────── RESIGN ───────────
        socket.on('resign', async (data: { gameId: string; userId: string }) => {
            const room = rooms.get(data.gameId);
            if (!room || !room.gameState || room.status !== 'playing') {
                socket.emit('error', { message: 'Game not found or not active' });
                return;
            }

            const isPlayer = room.players.some(p => p.userId === data.userId);
            if (!isPlayer) {
                socket.emit('error', { message: 'Not a player in this game' });
                return;
            }

            room.gameState = ChessEngine.handleResignation(room.gameState, data.userId);
            await endGame(room, chessNamespace);
        });

        // ─────────── OFFER DRAW ───────────
        socket.on('offer-draw', (data: { gameId: string; userId: string }) => {
            const room = rooms.get(data.gameId);
            if (!room || !room.gameState || room.status !== 'playing') {
                socket.emit('error', { message: 'Game not active' });
                return;
            }

            // Can't offer draw to yourself
            const opponent = room.players.find(p => p.userId !== data.userId);
            if (!opponent) return;

            // Broadcast draw offer
            chessNamespace.to(data.gameId).emit('draw-offered', {
                byUserId: data.userId,
            });

            // Update DB with draw offer
            if (room.dbId) {
                PVPGame.findByIdAndUpdate(room.dbId, { drawOffer: data.userId }).catch(console.error);
            }
        });

        // ─────────── ACCEPT DRAW ───────────
        socket.on('accept-draw', async (data: { gameId: string; userId: string }) => {
            const room = rooms.get(data.gameId);
            if (!room || !room.gameState || room.status !== 'playing') {
                socket.emit('error', { message: 'Game not active' });
                return;
            }

            room.gameState = ChessEngine.handleDrawAgreement(room.gameState);
            await endGame(room, chessNamespace);
        });

        // ─────────── DECLINE DRAW ───────────
        socket.on('decline-draw', (data: { gameId: string; userId: string }) => {
            const room = rooms.get(data.gameId);
            if (!room) return;

            chessNamespace.to(data.gameId).emit('draw-declined', {});

            if (room.dbId) {
                PVPGame.findByIdAndUpdate(room.dbId, { drawOffer: null }).catch(console.error);
            }
        });

        // ─────────── TAB FOCUS CHANGE ───────────
        socket.on('tab-focus-change', (data: { gameId: string; userId: string; focused: boolean }) => {
            if (!data.focused) {
                ChessAntiCheat.reportTabSwitch(data.gameId, data.userId);
            }
        });

        // ─────────── LEAVE GAME ───────────
        socket.on('leave-game', (data: { userId: string }) => {
            handlePlayerLeave(data.userId, chessNamespace);
        });

        // ─────────── DISCONNECT ───────────
        socket.on('disconnect', () => {
            console.log('[Chess] Player disconnected:', socket.id);
            // Mark player as disconnected but don't remove them
            for (const [userId, gameId] of playerToRoom.entries()) {
                const room = rooms.get(gameId);
                if (room?.players.some(p => p.socketId === socket.id)) {
                    const player = room.players.find(p => p.socketId === socket.id);
                    if (player) {
                        player.socketId = ''; // Mark as disconnected
                        console.log(`[Chess] Player ${userId} disconnected from game ${gameId}`);

                        // If game is active, notify opponent
                        if (room.status === 'playing') {
                            chessNamespace.to(gameId).emit('opponent-disconnected', {
                                userId,
                                message: 'Opponent disconnected. They have 60 seconds to reconnect.',
                            });

                            // Auto-forfeit after 60 seconds if no reconnection
                            setTimeout(async () => {
                                const currentRoom = rooms.get(gameId);
                                if (currentRoom && currentRoom.status === 'playing') {
                                    const p = currentRoom.players.find(pp => pp.userId === userId);
                                    if (p && !p.socketId) {
                                        // Still disconnected — forfeit
                                        if (currentRoom.gameState) {
                                            currentRoom.gameState = ChessEngine.handleResignation(
                                                currentRoom.gameState,
                                                userId,
                                            );
                                            currentRoom.gameState.endReason = 'abandonment';
                                            await endGame(currentRoom, chessNamespace);
                                        }
                                    }
                                }
                            }, 60000);
                        }
                    }
                    break;
                }
            }
        });
    });

    // ═══════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════

    function startGame(room: ChessRoom, namespace: any) {
        room.status = 'playing';

        // Randomize colors: first joiner gets random color
        const shuffled = Math.random() < 0.5
            ? [room.players[0], room.players[1]]
            : [room.players[1], room.players[0]];

        room.gameState = ChessEngine.initializeGame(
            shuffled.map(p => ({ userId: p.userId, username: p.username })),
            room.mode,
        );

        // Initialize anti-cheat
        ChessAntiCheat.initGame(room.gameId, shuffled[0].userId, shuffled[1].userId);

        // Emit to each player with their color using room-targeted emit
        for (const player of room.players) {
            if (player.socketId) {
                const playerColor = player.userId === room.gameState.playerWhite ? 'white' : 'black';
                namespace.to(player.socketId).emit('game-started', {
                    gameState: sanitizeGameState(room.gameState),
                    playerColor,
                    room: sanitizeRoom(room),
                });
            }
        }

        // Start clock emitter
        startClockEmitter(room, namespace);

        // Update database
        if (room.dbId) {
            PVPGame.findByIdAndUpdate(room.dbId, {
                status: PVPGameStatus.ACTIVE,
                startedAt: new Date(),
                gameState: room.gameState,
            }).catch(console.error);
        }
    }

    function startClockEmitter(room: ChessRoom, namespace: any) {
        // Clear existing interval
        if (room.clockInterval) {
            clearInterval(room.clockInterval);
        }

        room.clockInterval = setInterval(async () => {
            if (!room.gameState || room.gameState.isGameOver || room.status !== 'playing') {
                if (room.clockInterval) clearInterval(room.clockInterval);
                return;
            }

            const gs = room.gameState;
            const now = Date.now();
            const elapsed = now - gs.lastMoveAt;

            // Calculate current times  
            const whiteTime = gs.currentTurn === 'white'
                ? Math.max(0, gs.whiteTime - elapsed)
                : gs.whiteTime;

            const blackTime = gs.currentTurn === 'black'
                ? Math.max(0, gs.blackTime - elapsed)
                : gs.blackTime;

            // Send clock update
            namespace.to(room.gameId).emit('clock-update', {
                whiteTime,
                blackTime,
                currentTurn: gs.currentTurn,
            });

            // Check for timeout
            if (whiteTime <= 0) {
                room.gameState = ChessEngine.handleTimeout(gs, 'white');
                room.gameState.whiteTime = 0;
                await endGame(room, namespace);
            } else if (blackTime <= 0) {
                room.gameState = ChessEngine.handleTimeout(gs, 'black');
                room.gameState.blackTime = 0;
                await endGame(room, namespace);
            }
        }, 1000); // Every second
    }

    async function endGame(room: ChessRoom, namespace: any) {
        if (!room.gameState) return;

        room.status = 'finished';

        // Stop clock
        if (room.clockInterval) {
            clearInterval(room.clockInterval);
            room.clockInterval = null;
        }

        const gs = room.gameState;
        const totalPot = room.betAmount * 2;
        const houseEdge = totalPot * (HOUSE_EDGE_PERCENT / 100);

        try {
            if (gs.isDraw || gs.endReason === 'stalemate' || gs.endReason === 'agreement' ||
                gs.endReason === 'threefold repetition' || gs.endReason === 'insufficient material' ||
                gs.endReason === 'draw') {
                // Draw — refund both players
                for (const player of room.players) {
                    await WalletService.addBalance(player.userId, room.currency, room.betAmount);
                }
            } else if (gs.winner) {
                // Winner gets pot minus house edge
                const winnings = totalPot - houseEdge;
                await WalletService.addBalance(gs.winner, room.currency, winnings);
            }

            // Get anti-cheat data
            const antiCheatData = ChessAntiCheat.getGameAntiCheatData(room.gameId);

            // Update database
            if (room.dbId) {
                await PVPGame.findByIdAndUpdate(room.dbId, {
                    status: PVPGameStatus.FINISHED,
                    winner: gs.winner || undefined,
                    finishedAt: new Date(),
                    gameState: gs,
                    pgn: gs.pgn,
                    endReason: gs.endReason,
                    antiCheatData,
                    'timeControl.whiteTime': gs.whiteTime,
                    'timeControl.blackTime': gs.blackTime,
                });
            }

            // Find winner/loser info
            const winnerPlayer = gs.winner
                ? room.players.find(p => p.userId === gs.winner)
                : null;

            const winnings = gs.isDraw ? room.betAmount : (totalPot - houseEdge);

            // Emit game end
            namespace.to(room.gameId).emit('game-ended', {
                winner: gs.winner,
                winnerUsername: winnerPlayer?.username,
                endReason: gs.endReason,
                isDraw: gs.isDraw,
                payout: winnings,
                pgn: gs.pgn,
                shareableLink: room.dbId ? `chess/${room.gameId}` : null,
                gameState: sanitizeGameState(gs),
                antiCheatReport: antiCheatData,
            });

            // Update UserStats for both players
            for (const player of room.players) {
                const isWinner = gs.winner === player.userId;
                const isDraw = gs.isDraw;
                const profit = isDraw ? 0 : (isWinner ? (totalPot - houseEdge - room.betAmount) : -room.betAmount);

                try {
                    await UserStats.findOneAndUpdate(
                        { userId: player.userId },
                        {
                            $inc: {
                                totalWagered: room.betAmount,
                                totalProfit: profit,
                                totalWins: isWinner ? 1 : 0,
                                totalLosses: (!isWinner && !isDraw) ? 1 : 0,
                            },
                            $setOnInsert: { userId: player.userId },
                        },
                        { upsert: true },
                    );
                } catch (statsErr) {
                    console.error('[Chess] UserStats error:', statsErr);
                }
            }

            // Cleanup anti-cheat tracking
            ChessAntiCheat.cleanupGame(room.gameId);

        } catch (error) {
            console.error('[Chess] Error ending game:', error);
        }

        // Cleanup room after 5 minutes
        setTimeout(() => {
            rooms.delete(room.gameId);
            room.players.forEach(p => playerToRoom.delete(p.userId));
        }, 300000);
    }

    async function handlePlayerLeave(userId: string, namespace: any) {
        const gameId = playerToRoom.get(userId);
        if (!gameId) return;

        const room = rooms.get(gameId);
        if (!room) return;

        if (room.status === 'playing') {
            // Forfeit — opponent wins
            if (room.gameState) {
                room.gameState = ChessEngine.handleResignation(room.gameState, userId);
                room.gameState.endReason = 'abandonment';

                namespace.to(gameId).emit('player-forfeited', { userId });
                await endGame(room, namespace);
            }
        } else {
            // Waiting room — refund bet
            try {
                await WalletService.addBalance(userId, room.currency, room.betAmount);
            } catch (err) {
                console.error(`[Chess] Failed to refund bet to ${userId}:`, err);
            }

            room.players = room.players.filter(p => p.userId !== userId);
            namespace.to(gameId).emit('player-left', { userId });

            if (room.players.length === 0) {
                rooms.delete(gameId);
                // Cancel the DB game
                if (room.dbId) {
                    PVPGame.findByIdAndUpdate(room.dbId, { status: PVPGameStatus.CANCELLED }).catch(console.error);
                }
            }
        }

        playerToRoom.delete(userId);
        lastActionTime.delete(userId);
    }

    // Clean up abandoned waiting rooms every minute
    setInterval(() => {
        const now = Date.now();
        const ABANDON_TIMEOUT = 10 * 60 * 1000; // 10 minutes

        for (const [gameId, room] of rooms.entries()) {
            if (room.status === 'waiting' && now - room.createdAt > ABANDON_TIMEOUT) {
                const allDisconnected = room.players.every(p => !p.socketId);
                if (allDisconnected) {
                    console.log(`[Chess] Cleaning up abandoned game ${gameId}`);
                    rooms.delete(gameId);
                    room.players.forEach(p => playerToRoom.delete(p.userId));

                    // Refund all waiting players
                    for (const player of room.players) {
                        WalletService.addBalance(player.userId, room.currency, room.betAmount).catch(console.error);
                    }

                    if (room.dbId) {
                        PVPGame.findByIdAndUpdate(room.dbId, { status: PVPGameStatus.CANCELLED }).catch(console.error);
                    }
                }
            }
        }
    }, 60000);

    function sanitizeRoom(room: ChessRoom) {
        return {
            gameId: room.gameId,
            mode: room.mode,
            betAmount: room.betAmount,
            currency: room.currency,
            players: room.players.map(p => ({ userId: p.userId, username: p.username })),
            status: room.status,
        };
    }

    function sanitizeGameState(gs: ChessGameState) {
        return {
            fen: gs.fen,
            pgn: gs.pgn,
            playerWhite: gs.playerWhite,
            playerBlack: gs.playerBlack,
            currentTurn: gs.currentTurn,
            whiteTime: gs.whiteTime,
            blackTime: gs.blackTime,
            moveCount: gs.moveCount,
            isCheck: gs.isCheck,
            isCheckmate: gs.isCheckmate,
            isStalemate: gs.isStalemate,
            isDraw: gs.isDraw,
            isGameOver: gs.isGameOver,
            endReason: gs.endReason,
            winner: gs.winner,
        };
    }
}
