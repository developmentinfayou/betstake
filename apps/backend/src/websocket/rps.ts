import { Server, Socket } from 'socket.io';
import { RPSGame, RPSMode, RPSGameState, RPSChoice } from '@casino/game-engine';
import { PVPGame, PVPGameStatus, PVPGameType, UserStats, Currency } from '@casino/database';
import { nanoid } from 'nanoid';
import { RPSMatchmakingService } from '../services/rps-matchmaking';
import { WalletService } from '../services/wallet-service';

interface RPSRoom {
    gameId: string;
    mode: RPSMode;
    betAmount: number;
    currency: Currency;
    players: Array<{ userId: string; username: string; socketId: string }>;
    gameState: RPSGameState | null;
    status: 'waiting' | 'playing' | 'finished';
    roundTimer: NodeJS.Timeout | null;
    createdAt: number;
}

const rooms = new Map<string, RPSRoom>();
const playerToRoom = new Map<string, string>();
const ROUND_TIMER_MS = 10000; // 10 seconds per round

export function setupRPSSocket(io: Server) {
    const rpsNamespace = io.of('/rps');

    rpsNamespace.on('connection', (socket: Socket) => {
        console.log('RPS player connected:', socket.id);

        // ─── Create private game ───
        socket.on('create-game', async (data: {
            userId: string;
            username: string;
            mode: RPSMode;
            betAmount: number;
            currency: string;
        }) => {
            try {
                const balance = await WalletService.getAvailableBalance(data.userId, data.currency as Currency);
                if (balance < data.betAmount) {
                    socket.emit('error', { message: 'Insufficient balance' });
                    return;
                }

                await WalletService.debitBalance(data.userId, data.currency as Currency, data.betAmount);

                const gameId = nanoid(10);
                const shareableLink = `rps/join/${gameId}`;

                const room: RPSRoom = {
                    gameId,
                    mode: data.mode,
                    betAmount: data.betAmount,
                    currency: data.currency as Currency,
                    players: [{ userId: data.userId, username: data.username, socketId: socket.id }],
                    gameState: null,
                    status: 'waiting',
                    roundTimer: null,
                    createdAt: Date.now()
                };

                rooms.set(gameId, room);
                playerToRoom.set(data.userId, gameId);
                socket.join(gameId);

                await PVPGame.create({
                    gameType: PVPGameType.RPS,
                    mode: data.mode,
                    players: [data.userId],
                    betAmount: data.betAmount,
                    currency: data.currency,
                    status: PVPGameStatus.WAITING,
                    gameState: {},
                    shareableLink
                });

                socket.emit('game-created', {
                    gameId,
                    shareableLink,
                    room: sanitizeRoom(room)
                });

                socket.emit('game-joined', {
                    room: sanitizeRoom(room),
                    gameState: null
                });
            } catch (error: any) {
                console.error('[RPS] Error creating game:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // ─── Join game via link ───
        socket.on('join-game', async (data: {
            gameId: string;
            userId: string;
            username: string;
        }) => {
            try {
                const dbGame = await PVPGame.findOne({
                    $or: [
                        { shareableLink: `rps/join/${data.gameId}` },
                        { shareableLink: `rps/${data.gameId}` }
                    ]
                });

                if (!dbGame) {
                    socket.emit('error', { message: 'Game not found' });
                    return;
                }

                let room = rooms.get(data.gameId);
                if (!room) {
                    room = {
                        gameId: data.gameId,
                        mode: dbGame.mode as RPSMode,
                        betAmount: dbGame.betAmount,
                        currency: dbGame.currency as Currency,
                        players: dbGame.players.map((playerId: any, index: number) => ({
                            userId: playerId.toString(),
                            username: `Player${index + 1}`,
                            socketId: ''
                        })),
                        gameState: dbGame.gameState as RPSGameState || null,
                        status: dbGame.status === PVPGameStatus.WAITING ? 'waiting' :
                            dbGame.status === PVPGameStatus.ACTIVE ? 'playing' : 'finished',
                        roundTimer: null,
                        createdAt: dbGame.createdAt?.getTime() || Date.now()
                    };
                    rooms.set(data.gameId, room);
                }

                const existingPlayer = room.players.find(p => p.userId === data.userId);

                if (existingPlayer) {
                    // Reconnecting
                    existingPlayer.socketId = socket.id;
                    existingPlayer.username = data.username;
                    playerToRoom.set(data.userId, data.gameId);
                    socket.join(data.gameId);

                    socket.emit('game-joined', {
                        room: sanitizeRoom(room),
                        gameState: room.gameState ? sanitizeGameState(room.gameState, data.userId) : null
                    });
                    return;
                }

                if (room.status !== 'waiting') {
                    socket.emit('error', { message: 'Game already started' });
                    return;
                }

                if (room.players.length >= 2) {
                    socket.emit('error', { message: 'Game is full' });
                    return;
                }

                const balance = await WalletService.getAvailableBalance(data.userId, room.currency);
                if (balance < room.betAmount) {
                    socket.emit('error', { message: 'Insufficient balance' });
                    return;
                }

                await WalletService.debitBalance(data.userId, room.currency, room.betAmount);

                room.players.push({
                    userId: data.userId,
                    username: data.username,
                    socketId: socket.id
                });

                playerToRoom.set(data.userId, data.gameId);
                socket.join(data.gameId);

                await PVPGame.findByIdAndUpdate(dbGame._id, {
                    $push: { players: data.userId }
                });

                rpsNamespace.to(data.gameId).emit('player-joined', {
                    player: { userId: data.userId, username: data.username },
                    room: sanitizeRoom(room)
                });

                // Auto-start when 2 players
                if (room.players.length === 2) {
                    setTimeout(() => {
                        startGame(room, rpsNamespace);
                    }, 2000);
                }
            } catch (error: any) {
                console.error('[RPS] Error joining game:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // ─── Join random matchmaking ───
        socket.on('join-random', async (data: {
            userId: string;
            username: string;
            mode: RPSMode;
            betAmount: number;
            currency: string;
        }) => {
            console.log(`[RPS] join-random from ${data.userId} (${data.username}), mode=${data.mode}, bet=${data.betAmount}, currency=${data.currency}`);

            try {
                const balance = await WalletService.getAvailableBalance(data.userId, data.currency as Currency);
                console.log(`[RPS] Balance check for ${data.userId}: ${balance} >= ${data.betAmount} = ${balance >= data.betAmount}`);
                if (balance < data.betAmount) {
                    socket.emit('error', { message: 'Insufficient balance' });
                    return;
                }
            } catch (error: any) {
                console.error(`[RPS] Balance check failed for ${data.userId}:`, error.message);
                socket.emit('error', { message: error.message });
                return;
            }

            const queueKey = RPSMatchmakingService.addToQueue({
                userId: data.userId,
                username: data.username,
                socketId: socket.id,
                mode: data.mode,
                betAmount: data.betAmount,
                currency: data.currency
            });

            const stats = RPSMatchmakingService.getQueueStats(data.mode, data.currency);
            console.log(`[RPS] Player ${data.userId} added to queue ${queueKey}. Queue stats: ${stats.playersWaiting} waiting`);

            socket.emit('queue-joined', {
                mode: data.mode,
                stats
            });

            // Try to find a match
            const match = RPSMatchmakingService.findMatch({
                userId: data.userId,
                username: data.username,
                socketId: socket.id,
                mode: data.mode,
                betAmount: data.betAmount,
                currency: data.currency,
                timestamp: Date.now()
            });

            if (!match) {
                console.log(`[RPS] No match found for ${data.userId}, waiting in queue...`);
                return;
            }

            console.log(`[RPS] MATCH FOUND! Players: ${match.map(m => m.userId).join(' vs ')}`);

            try {
                // Debit both players
                for (const player of match) {
                    console.log(`[RPS] Debiting ${data.betAmount} ${data.currency} from ${player.userId}`);
                    await WalletService.debitBalance(player.userId, data.currency as Currency, data.betAmount);
                }

                const gameId = nanoid(10);
                const shareableLink = `rps/join/${gameId}`;
                console.log(`[RPS] Creating match room ${gameId}`);

                const room: RPSRoom = {
                    gameId,
                    mode: data.mode,
                    betAmount: data.betAmount,
                    currency: data.currency as Currency,
                    players: match.map(m => ({ userId: m.userId, username: m.username, socketId: m.socketId })),
                    gameState: null,
                    status: 'waiting',
                    roundTimer: null,
                    createdAt: Date.now()
                };

                rooms.set(gameId, room);

                // Join both matched players to the socket room
                for (const m of match) {
                    playerToRoom.set(m.userId, gameId);
                    const playerSocket = rpsNamespace.sockets.get(m.socketId);
                    if (playerSocket) {
                        playerSocket.join(gameId);
                        console.log(`[RPS] Player ${m.userId} (socket ${m.socketId}) joined room ${gameId}`);
                    } else {
                        console.warn(`[RPS] Socket ${m.socketId} not found for player ${m.userId}!`);
                    }
                }

                await PVPGame.create({
                    gameType: PVPGameType.RPS,
                    mode: data.mode,
                    players: match.map(m => m.userId),
                    betAmount: data.betAmount,
                    currency: data.currency,
                    status: PVPGameStatus.WAITING,
                    gameState: {},
                    shareableLink
                });

                // Emit match-found to both players directly (in case room join failed)
                for (const m of match) {
                    const playerSocket = rpsNamespace.sockets.get(m.socketId);
                    if (playerSocket) {
                        playerSocket.emit('match-found', {
                            gameId,
                            room: sanitizeRoom(room)
                        });
                    }
                }

                console.log(`[RPS] Match created! Starting game in 3s...`);

                setTimeout(() => {
                    startGame(room, rpsNamespace);
                }, 3000);
            } catch (error: any) {
                console.error('[RPS] Match creation failed:', error);
                match.forEach(m => {
                    rpsNamespace.sockets.get(m.socketId)?.emit('error', { message: 'Match creation failed: ' + error.message });
                });
            }
        });

        // ─── Leave queue ───
        socket.on('leave-queue', (data: { userId: string }) => {
            const removed = RPSMatchmakingService.removeFromQueue(data.userId);
            if (removed) {
                socket.emit('queue-left');
            }
        });

        // ─── Submit choice ───
        socket.on('submit-choice', (data: {
            gameId: string;
            userId: string;
            choice: RPSChoice;
        }) => {
            const room = rooms.get(data.gameId);
            if (!room || !room.gameState || room.status !== 'playing') {
                socket.emit('error', { message: 'Game not active' });
                return;
            }

            // Validate choice
            if (!Object.values(RPSChoice).includes(data.choice)) {
                socket.emit('error', { message: 'Invalid choice' });
                return;
            }

            const result = RPSGame.submitChoice(room.gameState, data.userId, data.choice);
            if (!result.success) {
                socket.emit('error', { message: result.error || 'Invalid submission' });
                return;
            }

            // Notify opponent that this player has picked (without revealing choice)
            const opponent = room.players.find(p => p.userId !== data.userId);
            if (opponent && opponent.socketId) {
                rpsNamespace.sockets.get(opponent.socketId)?.emit('opponent-picked', {});
            }

            // If both picked, resolve the round
            if (RPSGame.bothPicked(room.gameState)) {
                resolveAndBroadcast(room, rpsNamespace);
            }
        });

        // ─── Leave game (forfeit) ───
        socket.on('leave-game', (data: { userId: string }) => {
            handlePlayerLeave(data.userId, rpsNamespace);
        });

        // ─── Disconnect ───
        socket.on('disconnect', () => {
            console.log('RPS player disconnected:', socket.id);
            for (const [userId, gameId] of playerToRoom.entries()) {
                const room = rooms.get(gameId);
                if (room?.players.some(p => p.socketId === socket.id)) {
                    const player = room.players.find(p => p.socketId === socket.id);
                    if (player) {
                        player.socketId = '';
                        console.log(`[RPS] Player ${userId} marked as disconnected from game ${gameId}`);
                    }
                    break;
                }
            }
        });
    });

    // ─── Helper Functions ───

    function startGame(room: RPSRoom, namespace: any) {
        room.status = 'playing';
        room.gameState = RPSGame.initializeGame(
            room.players.map(p => ({ userId: p.userId, username: p.username })),
            room.mode
        );

        namespace.to(room.gameId).emit('game-started', {
            gameState: sanitizeGameState(room.gameState, ''),
            serverSeedHash: room.gameState.serverSeedHash
        });

        PVPGame.findOneAndUpdate(
            { shareableLink: `rps/join/${room.gameId}` },
            {
                status: PVPGameStatus.ACTIVE,
                startedAt: new Date(),
                gameState: room.gameState
            }
        ).catch(console.error);

        // Start round after a brief countdown
        setTimeout(() => {
            startRound(room, namespace);
        }, 1500);
    }

    function startRound(room: RPSRoom, namespace: any) {
        if (!room.gameState || room.status !== 'playing') return;

        namespace.to(room.gameId).emit('round-started', {
            roundNumber: room.gameState.currentRound,
            timeLimit: ROUND_TIMER_MS / 1000
        });

        // Start round timer
        clearRoundTimer(room);
        room.roundTimer = setTimeout(() => {
            handleRoundTimeout(room, namespace);
        }, ROUND_TIMER_MS);
    }

    function handleRoundTimeout(room: RPSRoom, namespace: any) {
        if (!room.gameState || room.status !== 'playing') return;

        const round = room.gameState.rounds[room.gameState.currentRound - 1];
        if (!round) return;

        // Auto-pick for players who haven't submitted
        for (let i = 0; i < room.players.length; i++) {
            const playerChoice = i === 0 ? round.player1Choice : round.player2Choice;
            if (playerChoice === null) {
                const autoChoice = RPSGame.autoPickChoice(room.gameState, room.players[i].userId);
                RPSGame.submitChoice(room.gameState, room.players[i].userId, autoChoice);
            }
        }

        // Both should now have picks — resolve
        if (RPSGame.bothPicked(room.gameState)) {
            resolveAndBroadcast(room, namespace);
        }
    }

    function resolveAndBroadcast(room: RPSRoom, namespace: any) {
        if (!room.gameState) return;

        clearRoundTimer(room);

        const roundResult = RPSGame.resolveRound(room.gameState);
        if (!roundResult) return;

        namespace.to(room.gameId).emit('round-result', {
            roundNumber: roundResult.roundNumber,
            player1Choice: roundResult.player1Choice,
            player2Choice: roundResult.player2Choice,
            roundWinner: roundResult.roundWinner,
            scores: roundResult.scores
        });

        // Check if match is over
        const matchWinner = RPSGame.checkMatchWinner(room.gameState);
        if (matchWinner) {
            setTimeout(() => {
                endGame(room, namespace, matchWinner);
            }, 2000);
        } else {
            // Next round after a brief pause
            setTimeout(() => {
                startRound(room, namespace);
            }, 2500);
        }
    }

    async function endGame(room: RPSRoom, namespace: any, matchWinner: string) {
        if (!room.gameState) return;

        room.status = 'finished';
        clearRoundTimer(room);

        try {
            let winners: string[] = [];
            let payout = 0;
            let endReason = 'match_complete';

            if (matchWinner === 'draw') {
                // Refund both players
                for (const player of room.players) {
                    await WalletService.addBalance(player.userId, room.currency, room.betAmount);
                }
                endReason = 'draw';
            } else {
                winners = [matchWinner];
                const payoutCalc = RPSGame.calculatePayout(room.betAmount);
                payout = payoutCalc.winnerPayout;
                await WalletService.addBalance(matchWinner, room.currency, payout);
            }

            await PVPGame.findOneAndUpdate(
                { shareableLink: `rps/join/${room.gameId}` },
                {
                    status: PVPGameStatus.FINISHED,
                    winner: matchWinner !== 'draw' ? matchWinner : undefined,
                    finishedAt: new Date(),
                    endReason,
                    gameState: room.gameState
                }
            );

            namespace.to(room.gameId).emit('game-ended', {
                winner: matchWinner,
                winners,
                payout,
                endReason,
                serverSeed: room.gameState.serverSeed,
                gameState: sanitizeGameState(room.gameState, '')
            });

            // Update UserStats for rakeback tracking
            for (const player of room.players) {
                const isWinner = winners.includes(player.userId);
                const isDraw = matchWinner === 'draw';
                const profit = isDraw ? 0 : (isWinner ? payout - room.betAmount : -room.betAmount);
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
                            $setOnInsert: { userId: player.userId }
                        },
                        { upsert: true }
                    );
                } catch (statsErr) {
                    console.error('[RPS] UserStats error:', statsErr);
                }
            }
        } catch (error) {
            console.error('[RPS] Error ending game:', error);
        }

        // Cleanup after 5 minutes
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
            namespace.to(gameId).emit('player-forfeited', { userId });

            const remainingPlayers = room.players.filter(p => p.userId !== userId);

            if (remainingPlayers.length > 0) {
                const payout = RPSGame.calculatePayout(room.betAmount);

                for (const winner of remainingPlayers) {
                    try {
                        await WalletService.addBalance(winner.userId, room.currency, payout.winnerPayout);
                    } catch (err) {
                        console.error(`[RPS] Failed to credit forfeit payout to ${winner.userId}:`, err);
                    }
                }

                room.status = 'finished';
                clearRoundTimer(room);

                namespace.to(gameId).emit('game-ended', {
                    winner: remainingPlayers[0].userId,
                    winners: remainingPlayers.map(p => p.userId),
                    payout: payout.winnerPayout,
                    endReason: 'forfeit',
                    serverSeed: room.gameState?.serverSeed,
                    gameState: room.gameState ? sanitizeGameState(room.gameState, '') : null
                });

                PVPGame.findOneAndUpdate(
                    { shareableLink: `rps/join/${room.gameId}` },
                    {
                        status: PVPGameStatus.FINISHED,
                        winner: remainingPlayers[0].userId,
                        finishedAt: new Date(),
                        endReason: 'forfeit',
                        gameState: room.gameState
                    }
                ).catch(console.error);

                setTimeout(() => {
                    rooms.delete(room.gameId);
                    room.players.forEach(p => playerToRoom.delete(p.userId));
                }, 300000);
            }
        } else {
            // Refund in waiting state
            try {
                await WalletService.addBalance(userId, room.currency, room.betAmount);
            } catch (err) {
                console.error(`[RPS] Failed to refund bet to ${userId}:`, err);
            }

            room.players = room.players.filter(p => p.userId !== userId);
            namespace.to(gameId).emit('player-left', { userId });

            if (room.players.length === 0) {
                rooms.delete(gameId);
            }
        }

        playerToRoom.delete(userId);
    }

    function clearRoundTimer(room: RPSRoom) {
        if (room.roundTimer) {
            clearTimeout(room.roundTimer);
            room.roundTimer = null;
        }
    }

    // Clean up abandoned rooms every minute
    setInterval(() => {
        const now = Date.now();
        const ABANDON_TIMEOUT = 5 * 60 * 1000;

        for (const [gameId, room] of rooms.entries()) {
            if (room.status === 'waiting' && now - room.createdAt > ABANDON_TIMEOUT) {
                const allDisconnected = room.players.every(p => !p.socketId);
                if (allDisconnected) {
                    console.log(`[RPS] Cleaning up abandoned game ${gameId}`);
                    rooms.delete(gameId);
                    room.players.forEach(p => playerToRoom.delete(p.userId));
                }
            }
        }
    }, 60000);

    function sanitizeRoom(room: RPSRoom) {
        return {
            gameId: room.gameId,
            mode: room.mode,
            betAmount: room.betAmount,
            currency: room.currency,
            players: room.players.map(p => ({ userId: p.userId, username: p.username })),
            status: room.status
        };
    }

    function sanitizeGameState(state: RPSGameState, requestingUserId: string) {
        // Hide unrevealed choices — only show choices for completed rounds
        const sanitizedRounds = state.rounds.map(round => {
            if (round.winner !== null) {
                // Round resolved — show everything
                return round;
            }
            // Round in progress — hide choices
            return {
                roundNumber: round.roundNumber,
                player1Choice: null,
                player2Choice: null,
                winner: null
            };
        });

        return {
            players: state.players,
            rounds: sanitizedRounds,
            currentRound: state.currentRound,
            scores: state.scores,
            mode: state.mode,
            winner: state.winner,
            serverSeedHash: state.serverSeedHash
        };
    }
}
