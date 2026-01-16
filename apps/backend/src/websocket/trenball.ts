import { Server, Socket } from 'socket.io';
import { generateFloat, generateServerSeed, generateClientSeed } from '@casino/fairness';

type TrenballBetType = 'crash' | 'red' | 'green' | 'moon';

interface TrenballBet {
  userId: string;
  username: string;
  amount: number;
  currency: string;
  betType: TrenballBetType;
  payout: number;
  won: boolean;
}

/**
 * Trenball multiplayer game socket handler
 * Similar to Crash but with color betting options
 */
export function setupTrenballSocket(io: Server) {
  const trenballNamespace = io.of('/trenball');
  
  let roundNumber = 1;
  let bets: TrenballBet[] = [];
  let gameState: 'betting' | 'playing' | 'ended' = 'betting';
  let result: { type: TrenballBetType; multiplier: number } | null = null;

  startNewRound();

  trenballNamespace.on('connection', (socket: Socket) => {
    console.log('Trenball player connected:', socket.id);

    socket.emit('game-state', {
      state: gameState,
      roundNumber,
      result,
      bets,
    });

    socket.on('place-bet', (data: { userId: string; username: string; amount: number; currency: string; betType: TrenballBetType }) => {
      if (gameState !== 'betting') {
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

      bets.push(bet);
      trenballNamespace.emit('bet-placed', bet);
    });

    socket.on('disconnect', () => {
      console.log('Trenball player disconnected:', socket.id);
    });
  });

  function startNewRound() {
    gameState = 'betting';
    bets = [];
    result = null;

    trenballNamespace.emit('round-starting', {
      roundNumber,
      bettingTime: 5000,
    });

    setTimeout(() => {
      playRound();
    }, 5000);
  }

  function playRound() {
    gameState = 'playing';

    // Generate result
    const serverSeed = generateServerSeed();
    const clientSeed = generateClientSeed();
    const float = generateFloat({ serverSeed, clientSeed, nonce: roundNumber });

    // Determine result type and multiplier
    if (float < 0.01) {
      // 1% chance for moon (100x)
      result = { type: 'moon', multiplier: 100 };
    } else if (float < 0.35) {
      // 34% chance for green (2x)
      result = { type: 'green', multiplier: 2 };
    } else if (float < 0.69) {
      // 34% chance for red (2x)
      result = { type: 'red', multiplier: 2 };
    } else {
      // 31% chance for crash (0x)
      result = { type: 'crash', multiplier: 0 };
    }

    // Calculate payouts
    bets.forEach(bet => {
      if (bet.betType === result!.type) {
        bet.won = true;
        bet.payout = bet.amount * result!.multiplier;
      }
    });

    trenballNamespace.emit('round-result', {
      result,
      bets,
    });

    gameState = 'ended';

    setTimeout(() => {
      roundNumber++;
      startNewRound();
    }, 3000);
  }
}
