import { LudoMode } from '@casino/game-engine';
import { nanoid } from 'nanoid';

interface QueueEntry {
  userId: string;
  username: string;
  socketId: string;
  mode: LudoMode;
  betAmount: number;
  currency: string;
  timestamp: number;
}

interface MatchmakingQueue {
  [key: string]: QueueEntry[]; // key: mode-currency-betRange
}

export class LudoMatchmakingService {
  private static queues: MatchmakingQueue = {};
  private static readonly BET_RANGE_TOLERANCE = 0.2; // 20% tolerance
  private static readonly QUEUE_TIMEOUT = 60000; // 60 seconds

  /**
   * Add player to matchmaking queue
   */
  static addToQueue(entry: Omit<QueueEntry, 'timestamp'>): string {
    const queueKey = this.getQueueKey(entry.mode, entry.currency, entry.betAmount);
    
    if (!this.queues[queueKey]) {
      this.queues[queueKey] = [];
    }

    const queueEntry: QueueEntry = {
      ...entry,
      timestamp: Date.now()
    };

    this.queues[queueKey].push(queueEntry);

    // Clean old entries
    this.cleanQueue(queueKey);

    return queueKey;
  }

  /**
   * Remove player from queue
   */
  static removeFromQueue(userId: string): boolean {
    for (const key in this.queues) {
      const index = this.queues[key].findIndex(e => e.userId === userId);
      if (index !== -1) {
        this.queues[key].splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Try to find match for player
   */
  static findMatch(entry: QueueEntry): QueueEntry[] | null {
    const queueKey = this.getQueueKey(entry.mode, entry.currency, entry.betAmount);
    const queue = this.queues[queueKey] || [];

    const requiredPlayers = this.getRequiredPlayers(entry.mode);

    // Check if enough players in queue
    if (queue.length >= requiredPlayers) {
      // Take first N players
      const matched = queue.splice(0, requiredPlayers);
      return matched;
    }

    // Try nearby bet ranges
    const nearbyMatches = this.findNearbyMatches(entry);
    if (nearbyMatches && nearbyMatches.length >= requiredPlayers) {
      return nearbyMatches.slice(0, requiredPlayers);
    }

    return null;
  }

  /**
   * Find matches in nearby bet ranges
   */
  private static findNearbyMatches(entry: QueueEntry): QueueEntry[] | null {
    const allMatches: QueueEntry[] = [];

    for (const key in this.queues) {
      const [mode, currency, betRange] = key.split('-');
      
      if (mode !== entry.mode || currency !== entry.currency) continue;

      const [minBet, maxBet] = betRange.split('_').map(Number);
      
      // Check if bet amount is within range
      if (entry.betAmount >= minBet && entry.betAmount <= maxBet) {
        allMatches.push(...this.queues[key]);
      }
    }

    const requiredPlayers = this.getRequiredPlayers(entry.mode);
    
    if (allMatches.length >= requiredPlayers) {
      // Remove matched players from their queues
      allMatches.slice(0, requiredPlayers).forEach(player => {
        this.removeFromQueue(player.userId);
      });
      return allMatches;
    }

    return null;
  }

  /**
   * Get queue statistics
   */
  static getQueueStats(mode: LudoMode, currency: string): {
    playersWaiting: number;
    averageWaitTime: number;
  } {
    let totalPlayers = 0;
    let totalWaitTime = 0;
    const now = Date.now();

    for (const key in this.queues) {
      if (key.startsWith(`${mode}-${currency}`)) {
        const queue = this.queues[key];
        totalPlayers += queue.length;
        queue.forEach(entry => {
          totalWaitTime += now - entry.timestamp;
        });
      }
    }

    return {
      playersWaiting: totalPlayers,
      averageWaitTime: totalPlayers > 0 ? totalWaitTime / totalPlayers : 0
    };
  }

  /**
   * Get queue key based on mode, currency, and bet range
   */
  private static getQueueKey(mode: LudoMode, currency: string, betAmount: number): string {
    const betRange = this.getBetRange(betAmount);
    return `${mode}-${currency}-${betRange}`;
  }

  /**
   * Get bet range bucket
   */
  private static getBetRange(betAmount: number): string {
    const ranges = [
      [0, 10],
      [10, 50],
      [50, 100],
      [100, 500],
      [500, 1000],
      [1000, 5000],
      [5000, Infinity]
    ];

    for (const [min, max] of ranges) {
      if (betAmount >= min && betAmount < max) {
        return `${min}_${max}`;
      }
    }

    return '0_10';
  }

  /**
   * Get required players for mode
   */
  private static getRequiredPlayers(mode: LudoMode): number {
    switch (mode) {
      case LudoMode.ONE_V_ONE: return 2;
      case LudoMode.TWO_V_TWO: return 4;
      case LudoMode.FOUR_PLAYER: return 4;
    }
  }

  /**
   * Clean expired entries from queue
   */
  private static cleanQueue(queueKey: string): void {
    const now = Date.now();
    const queue = this.queues[queueKey];

    if (!queue) return;

    this.queues[queueKey] = queue.filter(
      entry => now - entry.timestamp < this.QUEUE_TIMEOUT
    );

    // Remove empty queues
    if (this.queues[queueKey].length === 0) {
      delete this.queues[queueKey];
    }
  }

  /**
   * Clean all expired entries
   */
  static cleanAllQueues(): void {
    for (const key in this.queues) {
      this.cleanQueue(key);
    }
  }

  /**
   * Get all queues (for debugging)
   */
  static getAllQueues(): MatchmakingQueue {
    return this.queues;
  }
}

// Auto-clean queues every 30 seconds
setInterval(() => {
  LudoMatchmakingService.cleanAllQueues();
}, 30000);
