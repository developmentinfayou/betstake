import { RPSMode } from '@casino/game-engine';

interface QueueEntry {
    userId: string;
    username: string;
    socketId: string;
    mode: RPSMode;
    betAmount: number;
    currency: string;
    timestamp: number;
}

interface MatchmakingQueue {
    [key: string]: QueueEntry[];
}

export class RPSMatchmakingService {
    private static queues: MatchmakingQueue = {};
    private static readonly QUEUE_TIMEOUT = 60000; // 60 seconds

    /**
     * Add player to matchmaking queue
     */
    static addToQueue(entry: Omit<QueueEntry, 'timestamp'>): string {
        const queueKey = this.getQueueKey(entry.mode, entry.currency, entry.betAmount);

        if (!this.queues[queueKey]) {
            this.queues[queueKey] = [];
        }

        // Remove if already in queue
        this.removeFromQueue(entry.userId);

        const queueEntry: QueueEntry = {
            ...entry,
            timestamp: Date.now()
        };

        this.queues[queueKey].push(queueEntry);
        this.cleanQueue(queueKey);

        console.log(`[RPS-MM] addToQueue: key=${queueKey}, userId=${entry.userId}, queueSize=${this.queues[queueKey]?.length || 0}`);
        console.log(`[RPS-MM] All queues:`, Object.entries(this.queues).map(([k, v]) => `${k}:${v.length}`).join(', '));

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
     * Try to find a match (always 2 players for RPS)
     */
    static findMatch(entry: QueueEntry): QueueEntry[] | null {
        const queueKey = this.getQueueKey(entry.mode, entry.currency, entry.betAmount);
        const queue = this.queues[queueKey] || [];

        console.log(`[RPS-MM] findMatch: key=${queueKey}, queueSize=${queue.length}, players=[${queue.map(q => q.userId).join(',')}]`);

        if (queue.length >= 2) {
            const matched = queue.splice(0, 2);
            console.log(`[RPS-MM] MATCHED from primary queue: [${matched.map(m => m.userId).join(', ')}]`);
            return matched;
        }

        // Try nearby bet ranges
        const nearbyMatch = this.findNearbyMatches(entry);
        if (nearbyMatch) {
            console.log(`[RPS-MM] MATCHED from nearby: [${nearbyMatch.map(m => m.userId).join(', ')}]`);
        }
        return nearbyMatch;
    }

    /**
     * Find matches in nearby bet ranges
     */
    private static findNearbyMatches(entry: QueueEntry): QueueEntry[] | null {
        const allMatches: QueueEntry[] = [];

        for (const key in this.queues) {
            const [mode, currency] = key.split('-');
            if (mode !== entry.mode || currency !== entry.currency) continue;

            allMatches.push(...this.queues[key]);
        }

        if (allMatches.length >= 2) {
            allMatches.slice(0, 2).forEach(player => {
                this.removeFromQueue(player.userId);
            });
            return allMatches.slice(0, 2);
        }

        return null;
    }

    /**
     * Get queue statistics
     */
    static getQueueStats(mode: RPSMode, currency: string): {
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

    private static getQueueKey(mode: RPSMode, currency: string, betAmount: number): string {
        const betRange = this.getBetRange(betAmount);
        return `${mode}-${currency}-${betRange}`;
    }

    private static getBetRange(betAmount: number): string {
        const ranges: [number, number][] = [
            [0, 10], [10, 50], [50, 100], [100, 500],
            [500, 1000], [1000, 5000], [5000, Infinity]
        ];

        for (const [min, max] of ranges) {
            if (betAmount >= min && betAmount < max) {
                return `${min}_${max}`;
            }
        }
        return '0_10';
    }

    private static cleanQueue(queueKey: string): void {
        const now = Date.now();
        const queue = this.queues[queueKey];
        if (!queue) return;

        this.queues[queueKey] = queue.filter(
            entry => now - entry.timestamp < this.QUEUE_TIMEOUT
        );

        if (this.queues[queueKey].length === 0) {
            delete this.queues[queueKey];
        }
    }

    static cleanAllQueues(): void {
        for (const key in this.queues) {
            this.cleanQueue(key);
        }
    }
}

// Auto-clean queues every 30 seconds
setInterval(() => {
    RPSMatchmakingService.cleanAllQueues();
}, 30000);
