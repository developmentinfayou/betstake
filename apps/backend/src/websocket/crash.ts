import { Server, Socket } from 'socket.io';
import { CrashGame } from '@casino/game-engine';
import { CrashRound, CrashBet } from '@casino/database';
import { generateServerSeed, generateClientSeed } from '@casino/fairness';

interface CrashBet {
  userId: string;
  username: string;
  amount: number;
  currency: string;
  autoCashout?: number;
  cashedOut: boolean;
  cashoutAt?: number;
  payout: number;
}

/**
 * Crash multiplayer game socket handler
 */
export function setupCrashSocket(io: Server) {
  const crashNamespace = io.of('/crash');
  
  let currentRound: any = null;
  let roundNumber = 1;
  let bets: CrashBet[] = [];
  let gameState: 'waiting' | 'betting' | 'playing' | 'crashed' = 'waiting';
  let startTime: number = 0;
  let crashPoint: number = 0;
  let currentMultiplier: number = 1.0;

  // Start first round
  startNewRound();

  crashNamespace.on('connection', (socket: Socket) => {
    console.log('Crash player connected:', socket.id);

    // Send current game state
    socket.emit('game-state', {
      state: gameState,
      roundNumber,
      currentMultiplier,
      crashPoint: gameState === 'crashed' ? crashPoint : null,
      bets,
    });

    // Place bet
    socket.on('place-bet', async (data: { userId: string; username: string; amount: number; currency: string; autoCashout?: number }) => {
      if (gameState !== 'betting') {
        socket.emit('error', { message: 'Betting is closed' });
        return;
      }

      const bet: CrashBet = {
        userId: data.userId,
        username: data.username,
        amount: data.amount,
        currency: data.currency,
        autoCashout: data.autoCashout,
        cashedOut: false,
        payout: 0,
      };

      bets.push(bet);
      crashNamespace.emit('bet-placed', bet);
    });

    // Cash out
    socket.on('cashout', (data: { userId: string }) => {
      if (gameState !== 'playing') {
        socket.emit('error', { message: 'Cannot cash out now' });
        return;
      }

      const bet = bets.find(b => b.userId === data.userId && !b.cashedOut);
      if (!bet) {
        socket.emit('error', { message: 'No active bet found' });
        return;
      }

      bet.cashedOut = true;
      bet.cashoutAt = currentMultiplier;
      bet.payout = bet.amount * currentMultiplier;

      crashNamespace.emit('player-cashed-out', {
        userId: bet.userId,
        username: bet.username,
        multiplier: currentMultiplier,
        payout: bet.payout,
      });
    });

    socket.on('disconnect', () => {
      console.log('Crash player disconnected:', socket.id);
    });
  });

  function startNewRound() {
    gameState = 'betting';
    bets = [];
    currentMultiplier = 1.0;

    // Generate crash point
    const serverSeed = generateServerSeed();
    const clientSeed = generateClientSeed();
    crashPoint = CrashGame.generateCrashPoint({
      serverSeed,
      clientSeed,
      nonce: roundNumber,
    });

    // Save round to database
    CrashRound.findOneAndUpdate(
      { roundNumber },
      {
        roundNumber,
        crashPoint,
        hash: serverSeed,
        startedAt: new Date(),
      },
      { upsert: true, new: true }
    ).catch(console.error);

    crashNamespace.emit('round-starting', {
      roundNumber,
      bettingTime: 5000, // 5 seconds to bet
    });

    // Start game after betting period
    setTimeout(() => {
      startGame();
    }, 5000);
  }

  function startGame() {
    gameState = 'playing';
    startTime = Date.now();

    crashNamespace.emit('game-started', {
      roundNumber,
      startTime,
    });

    // Game loop
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      currentMultiplier = CrashGame.getMultiplierAtTime(elapsed);

      // Check auto cashouts
      bets.forEach(bet => {
        if (!bet.cashedOut && bet.autoCashout && currentMultiplier >= bet.autoCashout) {
          bet.cashedOut = true;
          bet.cashoutAt = currentMultiplier;
          bet.payout = bet.amount * currentMultiplier;

          crashNamespace.emit('player-cashed-out', {
            userId: bet.userId,
            username: bet.username,
            multiplier: currentMultiplier,
            payout: bet.payout,
          });
        }
      });

      // Check if crashed
      if (CrashGame.hasCrashed(currentMultiplier, crashPoint)) {
        clearInterval(interval);
        endGame();
        return;
      }

      // Broadcast current multiplier
      crashNamespace.emit('multiplier-update', {
        multiplier: currentMultiplier,
      });
    }, 50); // Update every 50ms
  }

  function endGame() {
    gameState = 'crashed';

    crashNamespace.emit('game-crashed', {
      crashPoint,
      bets,
    });

    // Save bets to database
    saveBets();

    // Start new round after delay
    setTimeout(() => {
      roundNumber++;
      startNewRound();
    }, 3000);
  }

  async function saveBets() {
    try {
      const round = await CrashRound.findOne({ roundNumber });
      if (!round) return;

      const crashBets = bets.map(bet => ({
        roundId: round._id,
        userId: bet.userId,
        currency: bet.currency,
        amount: bet.amount,
        autoCashout: bet.autoCashout,
        cashedOut: bet.cashedOut,
        cashoutAt: bet.cashoutAt,
        payout: bet.payout,
      }));

      await CrashBet.insertMany(crashBets);
    } catch (error) {
      console.error('Error saving crash bets:', error);
    }
  }
}
