import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { BetEngine, PlaceBetInput } from './bet-engine';
import { AutoBetConfig } from '@casino/shared';
import { socketManager } from './socket-manager';
import { StrategyEngine, StrategySessionState } from './strategy-engine';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

/**
 * AutoBet Service - handles automated betting with strategies
 */
export class AutoBetService {
  private static autoBetQueue = new Queue('autobet', { connection: new Redis(redisConfig) });
  private static worker: Worker | null = null;
  // Dedicated Redis client for stop-flag signaling
  private static redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  });

  /**
   * Get the Redis key used as a cancellation signal for a user
   */
  private static stopKey(userId: string): string {
    return `autobet:stop:${userId}`;
  }

  /**
   * Check if a user has requested stop
   */
  private static async isStopRequested(userId: string): Promise<boolean> {
    const val = await this.redis.get(this.stopKey(userId));
    return val === '1';
  }

  /**
   * Start autobet worker
   */
  static async startWorker() {
    if (this.worker) return;

    // Clear any stuck jobs from previous sessions
    try {
      await this.autoBetQueue.obliterate({ force: true });
      console.log('[AutoBet] 🧹 Cleared old jobs from queue');
    } catch (error) {
      console.log('[AutoBet] No old jobs to clear');
    }

    const workerConnection = new Redis(redisConfig);

    workerConnection.on('error', (err) => {
      console.error('[AutoBet] Redis Worker connection error:', err.message);
    });

    workerConnection.on('connect', () => {
      console.log('[AutoBet] ✅ Redis Worker connected');
    });

    this.worker = new Worker(
      'autobet',
      async (job) => {
        console.log('\n[AutoBet] ========== WORKER RECEIVED JOB ==========');
        console.log('[AutoBet] Job ID:', job.id);
        console.log('[AutoBet] Job Data:', JSON.stringify(job.data, null, 2));

        const { userId, config, betInput, currentBet } = job.data;

        try {
          // ── CHECK 1: Was stop requested BEFORE we place the bet? ──
          if (await this.isStopRequested(userId)) {
            console.log(`[AutoBet] User ${userId} requested stop — skipping bet ${currentBet}`);
            await this.redis.del(this.stopKey(userId));
            this.emitStopped(userId, 'user_requested');
            return { completed: true, reason: 'user_stopped' };
          }

          console.log(`[AutoBet] Processing bet ${currentBet} for user ${userId}, amount: ${betInput.amount}`);

          // Place bet
          const { bet, result, wallet } = await BetEngine.placeBet(betInput);
          console.log(`[AutoBet] Bet result: won=${result.won}, profit=${result.profit}`);

          // Update total profit
          const totalProfit = (config.totalProfit || 0) + result.profit;

          // Emit Socket.IO event to user
          if (socketManager.isInitialized()) {
            socketManager.emitToUser(userId, 'autobet:result', {
              bet: {
                id: bet._id,
                gameType: bet.gameType,
                amount: bet.amount,
                multiplier: bet.multiplier,
                payout: bet.payout,
                profit: bet.profit,
                status: bet.status,
                result: bet.result,
                won: result.won,
              },
              wallet: wallet ? { balance: wallet.balance, currency: wallet.currency } : null,
              stats: {
                currentBet,
                totalProfit,
                totalBets: config.totalBets || 0,
              },
            });
          }

          // Check stop conditions BEFORE scheduling next bet
          if (this.shouldStop(config, currentBet, totalProfit)) {
            console.log(`[AutoBet] Stopping - conditions met`);
            this.emitStopped(userId, 'conditions_met');
            return { completed: true, totalBets: currentBet };
          }

          // ── CHECK 2: Was stop requested AFTER we placed the bet? ──
          if (await this.isStopRequested(userId)) {
            console.log(`[AutoBet] User ${userId} requested stop after bet ${currentBet} — not scheduling next`);
            await this.redis.del(this.stopKey(userId));
            this.emitStopped(userId, 'user_requested');
            return { completed: true, reason: 'user_stopped' };
          }

          // Update config and amount based on result
          let newAmount: number;
          let strategyShouldStop = false;

          if (config.strategyId && config.strategySessionState) {
            // Strategy mode: use condition evaluator
            const sessionState: StrategySessionState = {
              ...config.strategySessionState,
              firedFirstStreaks: new Set(config.strategySessionState.firedFirstStreaks || []),
            };
            StrategyEngine.updateSessionState(sessionState, result.won, result.profit, wallet?.balance || 0);
            const evalResult = StrategyEngine.evaluateConditions(config.strategyConditions || [], sessionState);
            newAmount = evalResult.newAmount;
            strategyShouldStop = evalResult.shouldStop;
            // Serialize Set back to array for next job
            config.strategySessionState = {
              ...sessionState,
              firedFirstStreaks: Array.from(sessionState.firedFirstStreaks),
              currentAmount: newAmount,
            };
          } else {
            // Auto mode: use traditional adjustment
            const updateResult = this.updateConfigAfterBet(config, result.won, betInput.amount, totalProfit);
            config = updateResult.newConfig;
            newAmount = updateResult.newAmount;
          }

          if (strategyShouldStop) {
            console.log(`[AutoBet] Strategy condition: stop autobet`);
            this.emitStopped(userId, 'strategy_stop');
            return { completed: true, totalBets: currentBet };
          }

          const newConfig = { ...config, totalProfit };
          const newBetInput = { ...betInput, amount: newAmount };

          // Schedule next bet
          if (config.numberOfBets === 0 || currentBet < config.numberOfBets) {
            await this.scheduleNextBet(userId, newConfig, newBetInput, currentBet + 1);
          }

          return { bet, result, nextBet: currentBet + 1 };
        } catch (error) {
          console.error('[AutoBet] Error:', error);
          throw error;
        }
      },
      { connection: workerConnection, concurrency: 1 }
    );

    this.worker.on('completed', (job) => {
      console.log(`[AutoBet] ✅ Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[AutoBet] ❌ Job ${job?.id} failed:`, err.message);
    });

    this.worker.on('active', (job) => {
      console.log(`[AutoBet] 🔄 Job ${job.id} is now active`);
    });

    console.log('✅ AutoBet worker started');
  }

  /**
   * Check if game type is session-based
   */
  private static isSessionGame(gameType: string): boolean {
    return ['TOWER', 'STAIRS', 'HILO', 'BLACKJACK'].includes(gameType);
  }

  /**
   * Start autobet session
   */
  static async startAutoBet(userId: string, config: AutoBetConfig & { strategyId?: string }, betInput: Omit<PlaceBetInput, 'isAutoBet'>) {
    console.log('\n[AutoBet] ========== START AUTOBET ==========');
    console.log('[AutoBet] User:', userId);
    console.log('[AutoBet] Config:', JSON.stringify(config, null, 2));
    console.log('[AutoBet] BetInput:', JSON.stringify(betInput, null, 2));

    // Stop any existing session
    await this.stopAutoBet(userId);

    // Clear any leftover stop flag from previous session
    await this.redis.del(this.stopKey(userId));

    // Check if this is a session-based game
    if (this.isSessionGame(betInput.gameType)) {
      console.log(`[AutoBet] Session game ${betInput.gameType} - AutoBet not supported`);
      throw new Error(`AutoBet is not supported for ${betInput.gameType}. This game requires manual play.`);
    }

    // Special validation for MINES
    if (betInput.gameType === 'MINES') {
      const params = betInput.gameParams as any;
      if (!params.selectedTiles || params.selectedTiles.length === 0) {
        throw new Error('MINES autobet requires selected tiles. Please select tiles in Auto mode.');
      }
      console.log(`[AutoBet] MINES autobet with ${params.selectedTiles.length} selected tiles`);
    }

    // Store initial amount for reset functionality
    const sessionData: any = {
      ...config,
      initialAmount: betInput.amount,
      totalProfit: 0,
      totalBets: 0,
    };

    // If a strategy is selected, load it and set up session state
    if (config.strategyId) {
      const strategy = await StrategyEngine.getStrategy(config.strategyId);
      if (!strategy) {
        throw new Error('Strategy not found');
      }
      console.log(`[AutoBet] Using strategy: ${strategy.name} (${strategy.conditions.length} conditions)`);
      sessionData.strategyId = config.strategyId;
      sessionData.strategyConditions = strategy.conditions;
      sessionData.strategySessionState = {
        ...StrategyEngine.createSessionState(betInput.amount, 0),
        firedFirstStreaks: [],  // serialize Set as array for JSON
      };
    }

    try {
      // Test Redis connection
      const queueConnection = new Redis(redisConfig);
      await queueConnection.ping();
      console.log('[AutoBet] ✅ Redis Queue connection OK');
      queueConnection.disconnect();

      await this.scheduleNextBet(userId, sessionData, betInput, 1);

      // Check if job was added
      const jobs = await this.autoBetQueue.getJobs(['waiting', 'delayed']);
      console.log(`[AutoBet] Jobs in queue: ${jobs.length}`);
    } catch (error: any) {
      console.error('[AutoBet] ❌ Redis failed, using sync mode:', error.message);
      // Fallback: process immediately without queue
      this.processAutoBetSync(userId, sessionData, betInput, 1);
    }
  }

  private static activeSessions = new Map<string, boolean>();

  /**
   * Process autobet synchronously (fallback when Redis unavailable)
   */
  private static async processAutoBetSync(userId: string, config: any, betInput: any, currentBet: number) {
    console.log('[AutoBet] Processing synchronously (Redis unavailable)');
    this.activeSessions.set(userId, true);

    let stopReason = 'completed';

    for (let i = currentBet; config.numberOfBets === 0 || i <= config.numberOfBets; i++) {
      // Check if stopped
      if (!this.activeSessions.get(userId)) {
        console.log('[AutoBet] Stopped by user');
        stopReason = 'user_requested';
        break;
      }

      try {
        console.log(`[AutoBet] Processing bet ${i} for user ${userId}, amount: ${betInput.amount}`);

        const { bet, result, wallet } = await BetEngine.placeBet({ ...betInput, isAutoBet: true });
        console.log(`[AutoBet] Bet result: won=${result.won}, profit=${result.profit}`);

        const totalProfit = (config.totalProfit || 0) + result.profit;

        // Emit Socket.IO event to user
        if (socketManager.isInitialized()) {
          socketManager.emitToUser(userId, 'autobet:result', {
            bet: {
              id: bet._id,
              gameType: bet.gameType,
              amount: bet.amount,
              multiplier: bet.multiplier,
              payout: bet.payout,
              profit: bet.profit,
              status: bet.status,
              result: bet.result,
              won: result.won,
            },
            wallet: wallet ? { balance: wallet.balance, currency: wallet.currency } : null,
            stats: {
              currentBet: i,
              totalProfit,
              totalBets: config.totalBets || 0,
            },
          });
        }

        if (this.shouldStop(config, i, totalProfit)) {
          console.log(`[AutoBet] Stopping - conditions met`);
          stopReason = 'conditions_met';
          break;
        }

        if (config.strategyId && config.strategySessionState) {
          // Strategy mode
          const sessionState: StrategySessionState = {
            ...config.strategySessionState,
            firedFirstStreaks: new Set(config.strategySessionState.firedFirstStreaks || []),
          };
          StrategyEngine.updateSessionState(sessionState, result.won, result.profit, wallet?.balance || 0);
          const evalResult = StrategyEngine.evaluateConditions(config.strategyConditions || [], sessionState);
          betInput.amount = evalResult.newAmount;
          config.strategySessionState = {
            ...sessionState,
            firedFirstStreaks: Array.from(sessionState.firedFirstStreaks),
            currentAmount: evalResult.newAmount,
          };
          if (evalResult.shouldStop) {
            console.log(`[AutoBet] Strategy condition: stop autobet`);
            stopReason = 'strategy_stop';
            break;
          }
        } else {
          // Auto mode
          const { newConfig, newAmount } = this.updateConfigAfterBet(config, result.won, betInput.amount, totalProfit);
          config = newConfig;
          betInput.amount = newAmount;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('[AutoBet] Error:', error);
        stopReason = 'error';
        break;
      }
    }

    this.activeSessions.delete(userId);
    this.emitStopped(userId, stopReason);
    console.log(`[AutoBet] Session ended (reason: ${stopReason})`);
  }

  /**
   * Schedule next bet
   */
  private static async scheduleNextBet(
    userId: string,
    config: AutoBetConfig,
    betInput: any,
    currentBet: number
  ) {
    const jobData = {
      userId,
      config,
      betInput: { ...betInput, isAutoBet: true },
      currentBet,
    };

    console.log(`[AutoBet] Adding job to queue for bet ${currentBet}...`);

    const job = await this.autoBetQueue.add(
      `autobet-${userId}`,
      jobData,
      {
        delay: currentBet === 1 ? 0 : 100,
        jobId: `${userId}-${Date.now()}-${currentBet}`,
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    console.log(`[AutoBet] ✅ Job ${job.id} added to queue for bet ${currentBet}`);
  }

  /**
   * Update config after bet based on win/loss
   */
  private static updateConfigAfterBet(config: any, won: boolean, currentAmount: number, totalProfit: number): { newConfig: any, newAmount: number } {
    const newConfig = { ...config, totalProfit };
    const adjustment = won ? config.onWin : config.onLoss;

    let newAmount = currentAmount;

    // Only apply adjustments if advanced settings are configured
    if (adjustment) {
      if (adjustment.reset) {
        // Reset to initial amount
        newAmount = config.initialAmount;
        console.log(`[AutoBet] ${won ? 'Win' : 'Loss'} - Reset amount to $${newAmount}`);
      } else if (adjustment.increaseBy) {
        newAmount = currentAmount * (1 + adjustment.increaseBy / 100);
        console.log(`[AutoBet] ${won ? 'Win' : 'Loss'} - Increase amount by ${adjustment.increaseBy}%: $${currentAmount} → $${newAmount.toFixed(2)}`);
      } else if (adjustment.decreaseBy) {
        newAmount = currentAmount * (1 - adjustment.decreaseBy / 100);
        console.log(`[AutoBet] ${won ? 'Win' : 'Loss'} - Decrease amount by ${adjustment.decreaseBy}%: $${currentAmount} → $${newAmount.toFixed(2)}`);
      }
    } else {
      console.log(`[AutoBet] Basic mode - Keep same amount $${currentAmount}`);
    }

    return { newConfig, newAmount };
  }

  /**
   * Check if autobet should stop
   */
  private static shouldStop(config: any, currentBet: number, totalProfit: number): boolean {
    // Check bet count (always checked)
    if (config.numberOfBets > 0 && currentBet >= config.numberOfBets) {
      console.log(`[AutoBet] Stop: Reached bet limit ${config.numberOfBets}`);
      return true;
    }

    // Check profit stop (only if configured and > 0)
    if (config.stopOnProfit && config.stopOnProfit > 0) {
      if (totalProfit >= config.stopOnProfit) {
        console.log(`[AutoBet] Stop: Reached profit target $${config.stopOnProfit} (current: $${totalProfit.toFixed(2)})`);
        return true;
      }
    }

    // Check loss stop (only if configured and > 0)
    if (config.stopOnLoss && config.stopOnLoss > 0) {
      if (totalProfit <= -config.stopOnLoss) {
        console.log(`[AutoBet] Stop: Reached loss limit $${config.stopOnLoss} (current: $${totalProfit.toFixed(2)})`);
        return true;
      }
    }

    return false;
  }

  /**
   * Stop autobet for user
   */
  static async stopAutoBet(userId: string) {
    console.log(`[AutoBet] Stopping autobet for user ${userId}`);

    // 1. Set Redis stop flag so the worker self-terminates
    try {
      await this.redis.set(this.stopKey(userId), '1', 'EX', 300); // expires in 5 min
      console.log(`[AutoBet] ✅ Stop flag set for user ${userId}`);
    } catch (err: any) {
      console.error(`[AutoBet] ⚠️ Failed to set stop flag:`, err.message);
    }

    // 2. Stop sync session
    this.activeSessions.set(userId, false);

    // 3. Remove waiting/delayed queue jobs
    try {
      const jobs = await this.autoBetQueue.getJobs(['waiting', 'delayed', 'active']);
      for (const job of jobs) {
        if (job.data.userId === userId) {
          try {
            await job.remove();
            console.log(`[AutoBet] Removed job ${job.id}`);
          } catch {
            // Active jobs can't be removed — the Redis flag will handle them
          }
        }
      }
    } catch (error) {
      // Queue might not be available
    }

    // 4. Emit stopped event to frontend
    this.emitStopped(userId, 'user_requested');
  }

  /**
   * Emit autobet:stopped event to frontend via socket
   */
  private static emitStopped(userId: string, reason: string) {
    if (socketManager.isInitialized()) {
      socketManager.emitToUser(userId, 'autobet:stopped', { reason });
      console.log(`[AutoBet] Emitted autobet:stopped to user ${userId} (reason: ${reason})`);
    }
  }

  /**
   * Get autobet status
   */
  static async getAutoBetStatus(userId: string) {
    // Check sync session first
    if (this.activeSessions.get(userId)) {
      return {
        active: true,
        currentBet: 0,
        totalBets: 0,
      };
    }

    // Check queue
    try {
      const jobs = await this.autoBetQueue.getJobs(['waiting', 'delayed', 'active']);
      const userJobs = jobs.filter(job => job.data.userId === userId);

      return {
        active: userJobs.length > 0,
        currentBet: userJobs[0]?.data.currentBet || 0,
        totalBets: userJobs[0]?.data.config.numberOfBets || 0,
      };
    } catch (error) {
      return { active: false, currentBet: 0, totalBets: 0 };
    }
  }
}
