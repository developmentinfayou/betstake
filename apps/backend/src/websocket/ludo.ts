import { Server, Socket } from 'socket.io';
import { LudoGame, LudoMode, LudoGameState } from '@casino/game-engine';
import { PVPGame, PVPGameStatus, PVPGameType, User } from '@casino/database';
import { nanoid } from 'nanoid';
import { LudoMatchmakingService } from '../services/ludo-matchmaking';
import { WalletService } from '../services/wallet-service';

interface LudoRoom {
  gameId: string;
  mode: LudoMode;
  betAmount: number;
  currency: string;
  players: Array<{ userId: string; username: string; socketId: string }>;
  gameState: LudoGameState | null;
  status: 'waiting' | 'playing' | 'finished';
  turnTimeout: NodeJS.Timeout | null;
  createdAt: number;
}

const rooms = new Map<string, LudoRoom>();
const playerToRoom = new Map<string, string>(); // userId -> gameId

export function setupLudoSocket(io: Server) {
  const ludoNamespace = io.of('/ludo');

  ludoNamespace.on('connection', (socket: Socket) => {
    console.log('Ludo player connected:', socket.id);

    // Create private game
    socket.on('create-game', async (data: {
      userId: string;
      username: string;
      mode: LudoMode;
      betAmount: number;
      currency: string;
    }) => {
      console.log(`[Ludo] Creating game for user ${data.userId}, mode: ${data.mode}`);
      try {
        // Check balance
        const balance = await WalletService.getAvailableBalance(data.userId, data.currency as any);
        if (balance < data.betAmount) {
          socket.emit('error', { message: 'Insufficient balance' });
          return;
        }

        // Debit wallet
        await WalletService.debitBalance(data.userId, data.currency, data.betAmount);

        const gameId = nanoid(10);
        const shareableLink = `ludo/join/${gameId}`;
        console.log(`[Ludo] Game created with ID: ${gameId}`);

        const room: LudoRoom = {
          gameId,
          mode: data.mode,
          betAmount: data.betAmount,
          currency: data.currency,
          players: [{ userId: data.userId, username: data.username, socketId: socket.id }],
          gameState: null,
          status: 'waiting',
          turnTimeout: null,
          createdAt: Date.now()
        };

        rooms.set(gameId, room);
        playerToRoom.set(data.userId, gameId);
        socket.join(gameId);
        console.log(`[Ludo] Room created and player joined socket room`);

        // Save to database
        await PVPGame.create({
          gameType: PVPGameType.LUDO,
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
        
        // Also send initial room state for immediate display
        socket.emit('game-joined', {
          room: sanitizeRoom(room),
          gameState: null
        });
        console.log(`[Ludo] Game creation events sent to client`);
      } catch (error: any) {
        console.error(`[Ludo] Error creating game:`, error);
        socket.emit('error', { message: error.message });
      }
    });

    // Join game via link
    socket.on('join-game', async (data: {
      gameId: string;
      userId: string;
      username: string;
    }) => {
      console.log(`[Ludo] Player ${data.userId} trying to join game ${data.gameId}`);
      
      try {
        // First check database for persistent game state
        const dbGame = await PVPGame.findOne({ 
          $or: [
            { shareableLink: `ludo/join/${data.gameId}` },
            { shareableLink: `ludo/${data.gameId}` }
          ]
        });

        if (!dbGame) {
          console.log(`[Ludo] Game ${data.gameId} not found in database`);
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        // Get or create room from database
        let room = rooms.get(data.gameId);
        if (!room) {
          console.log(`[Ludo] Restoring room ${data.gameId} from database`);
          room = {
            gameId: data.gameId,
            mode: dbGame.mode as LudoMode,
            betAmount: dbGame.betAmount,
            currency: dbGame.currency,
            players: dbGame.players.map((playerId: string, index: number) => ({
              userId: playerId,
              username: `Player${index + 1}`, // Will be updated when they connect
              socketId: ''
            })),
            gameState: dbGame.gameState as LudoGameState || null,
            status: dbGame.status === PVPGameStatus.WAITING ? 'waiting' : 
                   dbGame.status === PVPGameStatus.ACTIVE ? 'playing' : 'finished',
            turnTimeout: null,
            createdAt: dbGame.createdAt?.getTime() || Date.now()
          };
          rooms.set(data.gameId, room);
        }

        const existingPlayer = room.players.find(p => p.userId === data.userId);
        
        if (existingPlayer) {
          // Player reconnecting
          console.log(`[Ludo] Player ${data.userId} reconnecting to game ${data.gameId}`);
          existingPlayer.socketId = socket.id;
          existingPlayer.username = data.username; // Update username
          playerToRoom.set(data.userId, data.gameId);
          socket.join(data.gameId);
          
          socket.emit('game-joined', {
            room: sanitizeRoom(room),
            gameState: room.gameState ? sanitizeGameState(room.gameState) : null
          });
          return;
        }

        // New player joining
        if (room.status !== 'waiting') {
          socket.emit('error', { message: 'Game already started' });
          return;
        }

        const maxPlayers = getMaxPlayers(room.mode);
        if (room.players.length >= maxPlayers) {
          socket.emit('error', { message: 'Game is full' });
          return;
        }

        // Check balance and debit
        const balance = await WalletService.getAvailableBalance(data.userId, room.currency as any);
        if (balance < room.betAmount) {
          socket.emit('error', { message: 'Insufficient balance' });
          return;
        }

        await WalletService.debitBalance(data.userId, room.currency, room.betAmount);

        // Add new player
        room.players.push({
          userId: data.userId,
          username: data.username,
          socketId: socket.id
        });

        playerToRoom.set(data.userId, data.gameId);
        socket.join(data.gameId);

        // Update database
        await PVPGame.findByIdAndUpdate(dbGame._id, {
          $push: { players: data.userId }
        });

        ludoNamespace.to(data.gameId).emit('player-joined', {
          player: { userId: data.userId, username: data.username },
          room: sanitizeRoom(room)
        });

        // Auto-start if full
        if (room.players.length === maxPlayers) {
          startGame(room, ludoNamespace);
        }
      } catch (error: any) {
        console.error(`[Ludo] Error joining game:`, error);
        socket.emit('error', { message: error.message });
      }
    });

    // Join random matchmaking
    socket.on('join-random', async (data: {
      userId: string;
      username: string;
      mode: LudoMode;
      betAmount: number;
      currency: string;
    }) => {
      // Check balance first
      try {
        const balance = await WalletService.getAvailableBalance(data.userId, data.currency as any);
        if (balance < data.betAmount) {
          socket.emit('error', { message: 'Insufficient balance' });
          return;
        }
      } catch (error: any) {
        socket.emit('error', { message: error.message });
        return;
      }

      // Add to queue
      LudoMatchmakingService.addToQueue({
        userId: data.userId,
        username: data.username,
        socketId: socket.id,
        mode: data.mode,
        betAmount: data.betAmount,
        currency: data.currency
      });

      socket.emit('queue-joined', {
        mode: data.mode,
        stats: LudoMatchmakingService.getQueueStats(data.mode, data.currency)
      });

      // Try to find match
      const match = LudoMatchmakingService.findMatch({
        userId: data.userId,
        username: data.username,
        socketId: socket.id,
        mode: data.mode,
        betAmount: data.betAmount,
        currency: data.currency,
        timestamp: Date.now()
      });

      if (match) {
        try {
          // Debit all players
          for (const player of match) {
            await WalletService.debitBalance(player.userId, data.currency, data.betAmount);
          }

          // Create game room
          const gameId = nanoid(10);
          const shareableLink = `ludo/join/${gameId}`;

          const room: LudoRoom = {
            gameId,
            mode: data.mode,
            betAmount: data.betAmount,
            currency: data.currency,
            players: match.map(m => ({ userId: m.userId, username: m.username, socketId: m.socketId })),
            gameState: null,
            status: 'waiting',
            turnTimeout: null,
            createdAt: Date.now()
          };

          rooms.set(gameId, room);
          match.forEach(m => {
            playerToRoom.set(m.userId, gameId);
            ludoNamespace.sockets.get(m.socketId)?.join(gameId);
          });

          // Save to database
          await PVPGame.create({
            gameType: PVPGameType.LUDO,
            mode: data.mode,
            players: match.map(m => m.userId),
            betAmount: data.betAmount,
            currency: data.currency,
            status: PVPGameStatus.WAITING,
            gameState: {},
            shareableLink
          });

          ludoNamespace.to(gameId).emit('match-found', {
            gameId,
            room: sanitizeRoom(room)
          });

          // Auto-start after 3 seconds
          setTimeout(() => {
            startGame(room, ludoNamespace);
          }, 3000);
        } catch (error: any) {
          console.error('Match creation failed:', error);
          match.forEach(m => {
            ludoNamespace.sockets.get(m.socketId)?.emit('error', { message: 'Match creation failed' });
          });
        }
      }
    });

    // Leave queue
    socket.on('leave-queue', (data: { userId: string }) => {
      const removed = LudoMatchmakingService.removeFromQueue(data.userId);
      if (removed) {
        socket.emit('queue-left');
      }
    });

    // Start game (manual trigger)
    socket.on('start-game', (data: { gameId: string; userId: string }) => {
      const room = rooms.get(data.gameId);

      if (!room) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Only host can start
      if (room.players[0].userId !== data.userId) {
        socket.emit('error', { message: 'Only host can start' });
        return;
      }

      const minPlayers = getMaxPlayers(room.mode);
      if (room.players.length < minPlayers) {
        socket.emit('error', { message: 'Not enough players' });
        return;
      }

      startGame(room, ludoNamespace);
    });

    // Roll dice
    socket.on('roll-dice', (data: { gameId: string; userId: string }) => {
      const room = rooms.get(data.gameId);

      if (!room || !room.gameState) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const currentPlayer = room.gameState.players[room.gameState.currentTurnIndex];
      if (currentPlayer.userId !== data.userId) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      if (room.gameState.diceResult !== null) {
        socket.emit('error', { message: 'Already rolled' });
        return;
      }

      const diceResult = LudoGame.rollDice(room.gameState);
      const validMoves = LudoGame.getValidMoves(room.gameState);

      ludoNamespace.to(data.gameId).emit('dice-rolled', {
        playerId: data.userId,
        result: diceResult,
        validMoves,
        nonce: room.gameState.nonce - 1
      });

      // Auto-skip if no valid moves
      if (validMoves.length === 0) {
        setTimeout(() => {
          nextTurn(room, ludoNamespace);
        }, 2000);
        return;
      }

      // Start turn timeout
      startTurnTimeout(room, ludoNamespace);
    });

    // Make move
    socket.on('make-move', (data: { gameId: string; userId: string; tokenId: number }) => {
      const room = rooms.get(data.gameId);

      if (!room || !room.gameState) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const currentPlayer = room.gameState.players[room.gameState.currentTurnIndex];
      if (currentPlayer.userId !== data.userId) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      const result = LudoGame.executeMove(room.gameState, data.tokenId);

      if (!result.success) {
        socket.emit('error', { message: 'Invalid move' });
        return;
      }

      clearTurnTimeout(room);

      ludoNamespace.to(data.gameId).emit('move-made', {
        playerId: data.userId,
        tokenId: data.tokenId,
        captured: result.captured,
        gameState: sanitizeGameState(room.gameState)
      });

      // Check win
      if (room.gameState.winner || room.gameState.winningTeam !== undefined) {
        endGame(room, ludoNamespace);
        return;
      }

      // Next turn or same player (rolled 6)
      const rolledSix = room.gameState.moveHistory[room.gameState.moveHistory.length - 1].diceRoll === 6;
      if (!rolledSix) {
        nextTurn(room, ludoNamespace);
      } else {
        ludoNamespace.to(data.gameId).emit('extra-turn', { playerId: data.userId });
      }
    });

    // Leave game
    socket.on('leave-game', (data: { userId: string }) => {
      handlePlayerLeave(data.userId, ludoNamespace);
    });

    socket.on('disconnect', () => {
      console.log('Ludo player disconnected:', socket.id);
      // Don't immediately clean up rooms on disconnect
      // Just mark player as disconnected and clean up later
      for (const [userId, gameId] of playerToRoom.entries()) {
        const room = rooms.get(gameId);
        if (room?.players.some(p => p.socketId === socket.id)) {
          // Mark player as disconnected but don't remove them yet
          const player = room.players.find(p => p.socketId === socket.id);
          if (player) {
            player.socketId = ''; // Mark as disconnected
            console.log(`[Ludo] Player ${userId} marked as disconnected from game ${gameId}`);
          }
          break;
        }
      }
    });
  });

  // Helper functions
  function getMaxPlayers(mode: LudoMode): number {
    switch (mode) {
      case LudoMode.ONE_V_ONE: return 2;
      case LudoMode.TWO_V_TWO: return 4;
      case LudoMode.FOUR_PLAYER: return 4;
    }
  }

  // Clean up abandoned games every 5 minutes
  setInterval(() => {
    const now = Date.now();
    const ABANDON_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    
    for (const [gameId, room] of rooms.entries()) {
      // Only clean up waiting rooms that are old
      if (room.status === 'waiting' && now - room.createdAt > ABANDON_TIMEOUT) {
        const allDisconnected = room.players.every(p => !p.socketId);
        if (allDisconnected) {
          console.log(`[Ludo] Cleaning up abandoned game ${gameId}`);
          rooms.delete(gameId);
          room.players.forEach(p => playerToRoom.delete(p.userId));
        }
      }
    }
  }, 60000); // Check every minute

  function startGame(room: LudoRoom, namespace: any) {
    room.status = 'playing';
    room.gameState = LudoGame.initializeGame(
      room.players.map(p => ({ userId: p.userId, username: p.username })),
      room.mode
    );

    namespace.to(room.gameId).emit('game-started', {
      gameState: sanitizeGameState(room.gameState),
      serverSeedHash: room.gameState.serverSeedHash
    });

    // Update database
    PVPGame.findOneAndUpdate(
      { shareableLink: `ludo/join/${room.gameId}` },
      {
        status: PVPGameStatus.ACTIVE,
        startedAt: new Date(),
        gameState: room.gameState
      }
    ).catch(console.error);
  }

  function nextTurn(room: LudoRoom, namespace: any) {
    if (!room.gameState) return;

    namespace.to(room.gameId).emit('turn-changed', {
      currentPlayerId: room.gameState.players[room.gameState.currentTurnIndex].userId
    });
  }

  function startTurnTimeout(room: LudoRoom, namespace: any) {
    clearTurnTimeout(room);

    room.turnTimeout = setTimeout(() => {
      if (!room.gameState) return;

      const tokenId = LudoGame.autoSelectMove(room.gameState);
      if (tokenId !== null) {
        LudoGame.executeMove(room.gameState, tokenId);
        namespace.to(room.gameId).emit('auto-move', {
          playerId: room.gameState.players[room.gameState.currentTurnIndex].userId,
          tokenId
        });
      }

      nextTurn(room, namespace);
    }, 30000); // 30 seconds
  }

  function clearTurnTimeout(room: LudoRoom) {
    if (room.turnTimeout) {
      clearTimeout(room.turnTimeout);
      room.turnTimeout = null;
    }
  }

  async function endGame(room: LudoRoom, namespace: any) {
    if (!room.gameState) return;

    room.status = 'finished';
    clearTurnTimeout(room);

    const payout = LudoGame.calculatePayout(room.mode, room.betAmount, room.players.length);

    try {
      // Determine winner(s)
      let winners: string[] = [];
      
      if (room.gameState.winner) {
        winners = [room.gameState.winner];
      } else if (room.gameState.winningTeam !== undefined) {
        winners = room.gameState.players
          .filter(p => p.teamId === room.gameState!.winningTeam)
          .map(p => p.userId);
      }

      // Credit winners
      const payoutPerWinner = payout.winnerPayout / winners.length;
      for (const winnerId of winners) {
        await WalletService.creditBalance(winnerId, '', room.currency, payoutPerWinner);
      }

      // Update database
      await PVPGame.findOneAndUpdate(
        { shareableLink: `ludo/join/${room.gameId}` },
        {
          status: PVPGameStatus.FINISHED,
          winner: room.gameState.winner,
          finishedAt: new Date(),
          gameState: room.gameState
        }
      );

      namespace.to(room.gameId).emit('game-ended', {
        winner: room.gameState.winner,
        winningTeam: room.gameState.winningTeam,
        winners,
        payout: payoutPerWinner,
        serverSeed: room.gameState.serverSeed,
        gameState: sanitizeGameState(room.gameState)
      });
    } catch (error) {
      console.error('Error ending game:', error);
    }

    // Cleanup after 5 minutes
    setTimeout(() => {
      rooms.delete(room.gameId);
      room.players.forEach(p => playerToRoom.delete(p.userId));
    }, 300000);
  }

  function handlePlayerLeave(userId: string, namespace: any) {
    const gameId = playerToRoom.get(userId);
    if (!gameId) return;

    const room = rooms.get(gameId);
    if (!room) return;

    if (room.status === 'playing') {
      // Forfeit game
      namespace.to(gameId).emit('player-forfeited', { userId });
      // TODO: Handle forfeit logic
    } else {
      // Remove from waiting room
      room.players = room.players.filter(p => p.userId !== userId);
      namespace.to(gameId).emit('player-left', { userId });

      if (room.players.length === 0) {
        rooms.delete(gameId);
      }
    }

    playerToRoom.delete(userId);
  }

  function sanitizeRoom(room: LudoRoom) {
    return {
      gameId: room.gameId,
      mode: room.mode,
      betAmount: room.betAmount,
      currency: room.currency,
      players: room.players.map(p => ({ userId: p.userId, username: p.username })),
      status: room.status
    };
  }

  function sanitizeGameState(state: LudoGameState) {
    return {
      players: state.players,
      currentTurnIndex: state.currentTurnIndex,
      diceResult: state.diceResult,
      moveHistory: state.moveHistory.slice(-10), // Last 10 moves
      serverSeedHash: state.serverSeedHash
    };
  }
}
