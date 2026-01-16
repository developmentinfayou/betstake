import { Server } from 'socket.io';
import { FastParityRound } from '@casino/database';
import { generateInt, generateServerSeed, hashServerSeed } from '@casino/fairness';
import { v4 as uuidv4 } from 'uuid';

interface RoundState {
  roundId: string;
  status: 'betting' | 'closed' | 'completed';
  startTime: Date;
  bettingEndTime: Date;
  timeLeft: number;
  bets: Array<{
    userId: string;
    username: string;
    betType: 'number' | 'color';
    value: number | string;
    amount: number;
  }>;
  totalAmount: number;
  playerCount: number;
}

class FastParityServer {
  private io: Server;
  private currentRound: RoundState | null = null;
  private roundTimer: NodeJS.Timeout | null = null;
  private bettingDuration = 30000; // 30 seconds
  private resultDelay = 5000; // 5 seconds

  constructor(io: Server) {
    this.io = io;
    this.startNewRound();
  }

  private async startNewRound() {
    const roundId = this.generateRoundId();
    const startTime = new Date();
    const bettingEndTime = new Date(startTime.getTime() + this.bettingDuration);

    this.currentRound = {
      roundId,
      status: 'betting',
      startTime,
      bettingEndTime,
      timeLeft: this.bettingDuration / 1000,
      bets: [],
      totalAmount: 0,
      playerCount: 0
    };

    // Broadcast new round
    this.io.to('fastparity').emit('round:started', {
      roundId,
      timeLeft: this.currentRound.timeLeft,
      status: 'betting'
    });

    // Start countdown timer
    this.startCountdown();

    // Schedule betting close
    this.roundTimer = setTimeout(() => {
      this.closeBetting();
    }, this.bettingDuration);
  }

  private startCountdown() {
    const countdown = setInterval(() => {
      if (!this.currentRound || this.currentRound.status !== 'betting') {
        clearInterval(countdown);
        return;
      }

      this.currentRound.timeLeft--;
      
      if (this.currentRound.timeLeft <= 0) {
        clearInterval(countdown);
        return;
      }

      // Emit timer update
      this.io.to('fastparity').emit('round:timer', {
        timeLeft: this.currentRound.timeLeft
      });
    }, 1000);
  }

  private async closeBetting() {
    if (!this.currentRound) return;

    this.currentRound.status = 'closed';
    
    // Broadcast betting closed
    this.io.to('fastparity').emit('round:betting_closed', {
      roundId: this.currentRound.roundId
    });

    // Generate result after delay
    setTimeout(() => {
      this.generateResult();
    }, this.resultDelay);
  }

  private async generateResult() {
    if (!this.currentRound) return;

    // Generate provably fair result
    const serverSeed = generateServerSeed();
    const serverSeedHash = hashServerSeed(serverSeed);
    const clientSeed = 'fastparity_' + Date.now();
    const nonce = 1;

    const number = generateInt({ serverSeed, clientSeed, nonce }, 0, 9);
    const color = this.getColor(number);

    // Calculate payouts
    const processedBets = this.currentRound.bets.map(bet => {
      let won = false;
      let multiplier = 0;

      if (bet.betType === 'number') {
        won = number === bet.value;
        multiplier = won ? 9 : 0;
      } else if (bet.betType === 'color') {
        won = color === bet.value;
        if (color === 'violet') {
          multiplier = won ? 4.5 : 0;
        } else {
          multiplier = won ? 1.96 : 0;
        }
      }

      return {
        ...bet,
        multiplier,
        payout: bet.amount * multiplier,
        won
      };
    });

    // Save round to database
    const round = new FastParityRound({
      roundId: this.currentRound.roundId,
      number,
      color,
      serverSeed,
      serverSeedHash,
      clientSeed,
      nonce,
      startTime: this.currentRound.startTime,
      bettingEndTime: this.currentRound.bettingEndTime,
      resultTime: new Date(),
      status: 'completed',
      totalBets: this.currentRound.bets.length,
      totalAmount: this.currentRound.totalAmount,
      totalPayout: processedBets.reduce((sum, bet) => sum + bet.payout, 0),
      playerCount: this.currentRound.playerCount,
      bets: processedBets
    });

    await round.save();

    // Broadcast result
    this.io.to('fastparity').emit('round:result', {
      roundId: this.currentRound.roundId,
      number,
      color,
      bets: processedBets,
      serverSeedHash,
      clientSeed,
      nonce
    });

    this.currentRound.status = 'completed';

    // Start next round after delay
    setTimeout(() => {
      this.startNewRound();
    }, 3000);
  }

  private getColor(num: number): 'green' | 'red' | 'violet' {
    if (num === 0 || num === 5) return 'violet';
    if ([1, 3, 7, 9].includes(num)) return 'green';
    return 'red';
  }

  private generateRoundId(): string {
    const timestamp = Date.now().toString();
    return timestamp.slice(-12); // Last 12 digits
  }

  public placeBet(userId: string, username: string, betType: 'number' | 'color', value: number | string, amount: number): boolean {
    if (!this.currentRound || this.currentRound.status !== 'betting') {
      return false;
    }

    // Check if user already has a bet
    const existingBetIndex = this.currentRound.bets.findIndex(bet => bet.userId === userId);
    
    if (existingBetIndex >= 0) {
      // Update existing bet
      this.currentRound.totalAmount -= this.currentRound.bets[existingBetIndex].amount;
      this.currentRound.bets[existingBetIndex] = {
        userId,
        username,
        betType,
        value,
        amount
      };
    } else {
      // Add new bet
      this.currentRound.bets.push({
        userId,
        username,
        betType,
        value,
        amount
      });
      this.currentRound.playerCount++;
    }

    this.currentRound.totalAmount += amount;

    // Broadcast updated bets
    this.io.to('fastparity').emit('round:bets_updated', {
      bets: this.currentRound.bets,
      totalAmount: this.currentRound.totalAmount,
      playerCount: this.currentRound.playerCount
    });

    return true;
  }

  public getCurrentRound(): RoundState | null {
    return this.currentRound;
  }

  public async getHistory(limit = 50) {
    return FastParityRound.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('roundId number color createdAt totalAmount playerCount');
  }
}

let fastParityServer: FastParityServer;

export function setupFastParitySocket(io: Server) {
  fastParityServer = new FastParityServer(io);

  io.on('connection', (socket) => {
    socket.on('fastparity:join', () => {
      socket.join('fastparity');
      
      // Send current round state
      const currentRound = fastParityServer.getCurrentRound();
      if (currentRound) {
        socket.emit('round:current', {
          roundId: currentRound.roundId,
          status: currentRound.status,
          timeLeft: currentRound.timeLeft,
          bets: currentRound.bets,
          totalAmount: currentRound.totalAmount,
          playerCount: currentRound.playerCount
        });
      }
    });

    socket.on('fastparity:leave', () => {
      socket.leave('fastparity');
    });

    socket.on('fastparity:bet', async (data) => {
      const { userId, username, betType, value, amount } = data;
      
      const success = fastParityServer.placeBet(userId, username, betType, value, amount);
      
      socket.emit('bet:response', { success });
    });

    socket.on('fastparity:history', async () => {
      const history = await fastParityServer.getHistory();
      socket.emit('history:data', history);
    });
  });
}

export { fastParityServer };