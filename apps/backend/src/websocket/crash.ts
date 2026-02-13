import { Server, Socket } from 'socket.io';
import { CrashGame } from '@casino/game-engine';
import { CrashRound, CrashBet, CrashGameMode, TrenballBetType, TrenballResult, UserStats } from '@casino/database';
import { generateServerSeed, generateClientSeed } from '@casino/fairness';
import { UnifiedJackpotService } from '../services/unified-jackpot-service';

// Bet interfaces
interface ClassicBet {
  userId: string;
  username: string;
  amount: number;
  currency: string;
  autoCashout?: number;
  cashedOut: boolean;
  cashoutAt?: number;
  payout: number;
  won: boolean;
}

interface TrenballBet {
  userId: string;
  username: string;
  amount: number;
  currency: string;
  betType: TrenballBetType;
  payout: number;
  won: boolean;
}

type GameState = 'waiting' | 'betting' | 'playing' | 'crashed';

interface RoundHistory {
  roundNumber: number;
  crashPoint: number;
  trenballResult?: TrenballResult;
}

// State structure for each mode
interface ModeState {
  roundNumber: number;
  gameState: GameState;
  crashPoint: number;
  currentMultiplier: number;
  startTime: number;
  history: RoundHistory[];
}

interface ClassicModeState extends ModeState {
  bets: ClassicBet[];
}

interface TrenballModeState extends ModeState {
  bets: TrenballBet[];
  trenballResult: TrenballResult | null;
}

/**
 * Unified Crash multiplayer game socket handler
 * Supports both Classic and Trenball modes
 */
export function setupCrashSocket(io: Server) {
  const crashNamespace = io.of('/crash');

  // Classic mode state
  const classic: ClassicModeState = {
    roundNumber: 1,
    bets: [],
    gameState: 'waiting',
    crashPoint: 0,
    currentMultiplier: 1.0,
    startTime: 0,
    history: []
  };

  // Trenball mode state
  const trenball: TrenballModeState = {
    roundNumber: 1,
    bets: [],
    gameState: 'betting',
    crashPoint: 0,
    currentMultiplier: 1.0,
    startTime: 0,
    history: [],
    trenballResult: null
  };

  // Track which mode each socket is in
  const socketModes = new Map<string, CrashGameMode>();

  // Start games for both modes
  startNewRound('classic');
  startNewRound('trenball');

  crashNamespace.on('connection', (socket: Socket) => {
    console.log('Crash player connected:', socket.id);

    // Default to classic mode
    let currentMode: CrashGameMode = 'classic';
    socketModes.set(socket.id, currentMode);

    // Join mode room
    socket.join(`mode:${currentMode}`);

    // Send current game state for default mode
    sendGameState(socket, currentMode);

    // Switch mode
    socket.on('switch-mode', (mode: CrashGameMode) => {
      if (mode !== 'classic' && mode !== 'trenball') {
        socket.emit('error', { message: 'Invalid mode' });
        return;
      }

      // Leave old mode room
      socket.leave(`mode:${currentMode}`);

      // Join new mode room
      currentMode = mode;
      socketModes.set(socket.id, mode);
      socket.join(`mode:${mode}`);

      // Send game state for new mode
      sendGameState(socket, mode);
    });

    // Place bet (Classic mode)
    socket.on('place-bet', async (data: {
      userId: string;
      username: string;
      amount: number;
      currency: string;
      autoCashout?: number;
      mode?: CrashGameMode;
    }) => {
      const mode = data.mode || currentMode;

      if (mode !== 'classic') {
        socket.emit('error', { message: 'Use place-trenball-bet for trenball mode' });
        return;
      }

      if (classic.gameState !== 'betting') {
        socket.emit('error', { message: 'Betting is closed' });
        return;
      }

      // Check if user already has a bet
      if (classic.bets.find(b => b.userId === data.userId)) {
        socket.emit('error', { message: 'Already placed a bet this round' });
        return;
      }

      const bet: ClassicBet = {
        userId: data.userId,
        username: data.username,
        amount: data.amount,
        currency: data.currency,
        autoCashout: data.autoCashout,
        cashedOut: false,
        payout: 0,
        won: false,
      };

      classic.bets.push(bet);
      crashNamespace.to('mode:classic').emit('bet-placed', { mode: 'classic', bet });
    });

    // Place bet (Trenball mode)
    socket.on('place-trenball-bet', async (data: {
      userId: string;
      username: string;
      amount: number;
      currency: string;
      betType: TrenballBetType;
    }) => {
      if (trenball.gameState !== 'betting') {
        socket.emit('error', { message: 'Betting is closed' });
        return;
      }

      const bet: TrenballBet = {
        userId: data.userId,
        username: data.username,
        amount: data.amount,
        currency: data.currency,
        betType: data.betType,
        payout: 0,
        won: false,
      };

      trenball.bets.push(bet);
      crashNamespace.to('mode:trenball').emit('bet-placed', { mode: 'trenball', bet });
    });

    // Cash out (Classic mode only)
    socket.on('cashout', (data: { userId: string }) => {
      if (classic.gameState !== 'playing') {
        socket.emit('error', { message: 'Cannot cash out now' });
        return;
      }

      const bet = classic.bets.find(b => b.userId === data.userId && !b.cashedOut);
      if (!bet) {
        socket.emit('error', { message: 'No active bet found' });
        return;
      }

      bet.cashedOut = true;
      bet.cashoutAt = classic.currentMultiplier;
      bet.payout = bet.amount * classic.currentMultiplier;
      bet.won = true;

      crashNamespace.to('mode:classic').emit('player-cashed-out', {
        mode: 'classic',
        userId: bet.userId,
        username: bet.username,
        multiplier: classic.currentMultiplier,
        payout: bet.payout,
      });

      // Process jackpot for this bet via unified service
      UnifiedJackpotService.processBet(
        bet.userId,
        'CRASH',
        bet.currency,
        bet.amount,
        { crashPoint: classic.crashPoint, cashoutMultiplier: bet.cashoutAt, won: true }
      ).then(result => {
        if (result.won) {
          socket.emit('jackpot-triggered', result);
        }
      }).catch(console.error);
    });

    socket.on('disconnect', () => {
      socketModes.delete(socket.id);
      console.log('Crash player disconnected:', socket.id);
    });
  });

  function sendGameState(socket: Socket, mode: CrashGameMode) {
    if (mode === 'classic') {
      socket.emit('game-state', {
        mode: 'classic',
        state: classic.gameState,
        roundNumber: classic.roundNumber,
        currentMultiplier: classic.currentMultiplier,
        crashPoint: classic.gameState === 'crashed' ? classic.crashPoint : null,
        bets: classic.bets,
        history: classic.history.slice(-10),
      });
    } else {
      socket.emit('game-state', {
        mode: 'trenball',
        state: trenball.gameState,
        roundNumber: trenball.roundNumber,
        currentMultiplier: trenball.currentMultiplier,
        crashPoint: trenball.gameState === 'crashed' ? trenball.crashPoint : null,
        trenballResult: trenball.trenballResult,
        bets: trenball.bets,
        history: trenball.history.slice(-10),
      });
    }
  }

  function startNewRound(mode: CrashGameMode) {
    const state = mode === 'classic' ? classic : trenball;

    state.gameState = 'betting';
    if (mode === 'classic') {
      (state as ClassicModeState).bets = [];
    } else {
      (state as TrenballModeState).bets = [];
      (state as TrenballModeState).trenballResult = null;
    }
    state.currentMultiplier = 1.0;

    // Generate crash point
    const serverSeed = generateServerSeed();
    const clientSeed = generateClientSeed();
    state.crashPoint = CrashGame.generateCrashPoint({
      serverSeed,
      clientSeed,
      nonce: state.roundNumber,
    });

    // Calculate trenball result if trenball mode
    let trenballResult: TrenballResult | undefined;
    if (mode === 'trenball') {
      trenballResult = CrashGame.getTrenballResult(state.crashPoint);
    }

    // Save round to database
    CrashRound.findOneAndUpdate(
      { roundNumber: state.roundNumber, mode },
      {
        roundNumber: state.roundNumber,
        mode,
        crashPoint: state.crashPoint,
        hash: serverSeed,
        startedAt: new Date(),
        trenballResult: trenballResult,
      },
      { upsert: true, new: true }
    ).catch(console.error);

    crashNamespace.to(`mode:${mode}`).emit('round-starting', {
      mode,
      roundNumber: state.roundNumber,
      bettingTime: 5000,
    });

    // Start game after betting period
    setTimeout(() => {
      startGame(mode);
    }, 5000);
  }

  function startGame(mode: CrashGameMode) {
    const state = mode === 'classic' ? classic : trenball;

    state.gameState = 'playing';
    state.startTime = Date.now();

    crashNamespace.to(`mode:${mode}`).emit('game-started', {
      mode,
      roundNumber: state.roundNumber,
      startTime: state.startTime,
    });

    // Game loop
    const interval = setInterval(() => {
      const elapsed = Date.now() - state.startTime;
      state.currentMultiplier = CrashGame.getMultiplierAtTime(elapsed);

      // Classic mode: Check auto cashouts
      if (mode === 'classic') {
        classic.bets.forEach(bet => {
          if (!bet.cashedOut && bet.autoCashout && state.currentMultiplier >= bet.autoCashout) {
            bet.cashedOut = true;
            bet.cashoutAt = state.currentMultiplier;
            bet.payout = bet.amount * state.currentMultiplier;
            bet.won = true;

            crashNamespace.to('mode:classic').emit('player-cashed-out', {
              mode: 'classic',
              userId: bet.userId,
              username: bet.username,
              multiplier: state.currentMultiplier,
              payout: bet.payout,
            });
          }
        });
      }

      // Check if crashed
      if (CrashGame.hasCrashed(state.currentMultiplier, state.crashPoint)) {
        clearInterval(interval);
        endGame(mode);
        return;
      }

      // Broadcast current multiplier
      crashNamespace.to(`mode:${mode}`).emit('multiplier-update', {
        mode,
        multiplier: state.currentMultiplier,
      });
    }, 50);
  }

  function endGame(mode: CrashGameMode) {
    const state = mode === 'classic' ? classic : trenball;

    state.gameState = 'crashed';

    // Calculate trenball result
    if (mode === 'trenball') {
      const result = CrashGame.getTrenballResult(state.crashPoint);
      (state as TrenballModeState).trenballResult = result;

      // Calculate payouts for trenball bets
      trenball.bets.forEach(bet => {
        if (bet.betType === result.type) {
          bet.won = true;
          bet.payout = bet.amount * result.multiplier;
        }
      });
    } else {
      // Classic mode: mark non-cashed out bets as lost
      classic.bets.forEach(bet => {
        if (!bet.cashedOut) {
          bet.won = false;
          bet.payout = 0;
        }
      });
    }

    // Add to history
    const historyEntry: RoundHistory = {
      roundNumber: state.roundNumber,
      crashPoint: state.crashPoint,
    };
    if (mode === 'trenball') {
      historyEntry.trenballResult = (state as TrenballModeState).trenballResult!;
    }
    state.history.push(historyEntry);
    if (state.history.length > 20) {
      state.history.shift();
    }

    crashNamespace.to(`mode:${mode}`).emit('game-crashed', {
      mode,
      crashPoint: state.crashPoint,
      trenballResult: mode === 'trenball' ? (state as TrenballModeState).trenballResult : undefined,
      bets: mode === 'classic' ? classic.bets : trenball.bets,
    });

    // Save bets to database
    saveBets(mode);

    // Update UserStats for rakeback calculation
    updateUserStats(mode);

    // Process jackpots for all bets
    processRoundJackpots(mode);

    // Start new round after delay
    setTimeout(() => {
      state.roundNumber++;
      startNewRound(mode);
    }, 3000);
  }

  async function saveBets(mode: CrashGameMode) {
    try {
      const state = mode === 'classic' ? classic : trenball;
      const round = await CrashRound.findOne({ roundNumber: state.roundNumber, mode });
      if (!round) return;

      const bets = mode === 'classic' ? classic.bets : trenball.bets;

      const crashBets = bets.map(bet => ({
        roundId: round._id,
        userId: bet.userId,
        username: bet.username,
        currency: bet.currency,
        amount: bet.amount,
        autoCashout: mode === 'classic' ? (bet as ClassicBet).autoCashout : undefined,
        cashedOut: mode === 'classic' ? (bet as ClassicBet).cashedOut : false,
        cashoutAt: mode === 'classic' ? (bet as ClassicBet).cashoutAt : undefined,
        betType: mode === 'trenball' ? (bet as TrenballBet).betType : undefined,
        payout: bet.payout,
        won: bet.won,
      }));

      await CrashBet.insertMany(crashBets);
    } catch (error) {
      console.error('Error saving crash bets:', error);
    }
  }

  async function updateUserStats(mode: CrashGameMode) {
    try {
      const bets = mode === 'classic' ? classic.bets : trenball.bets;
      for (const bet of bets) {
        await UserStats.findOneAndUpdate(
          { userId: bet.userId },
          {
            $inc: {
              totalWagered: bet.amount,
              totalProfit: bet.payout - bet.amount,
              totalWins: bet.won ? 1 : 0,
              totalLosses: bet.won ? 0 : 1,
            },
            $setOnInsert: { userId: bet.userId }
          },
          { upsert: true }
        );
      }
    } catch (error) {
      console.error('Error updating crash user stats:', error);
    }
  }

  async function processRoundJackpots(mode: CrashGameMode) {
    try {
      const state = mode === 'classic' ? classic : trenball;
      const bets = mode === 'classic' ? classic.bets : trenball.bets;

      for (const bet of bets) {
        const result = await UnifiedJackpotService.processBet(
          bet.userId,
          'CRASH',
          bet.currency,
          bet.amount,
          {
            crashPoint: state.crashPoint,
            cashoutMultiplier: mode === 'classic' ? (bet as ClassicBet).cashoutAt : undefined,
            trenballOutcome: mode === 'trenball' ? (state as TrenballModeState).trenballResult?.type : undefined,
            won: bet.won,
          }
        );

        if (result.won) {
          crashNamespace.to(`mode:${mode}`).emit('jackpot-triggered', {
            mode,
            userId: bet.userId,
            conditionName: result.conditionName,
            prizeAmount: result.amount,
          });
        }
      }
    } catch (error) {
      console.error('Error processing jackpots:', error);
    }
  }
}
