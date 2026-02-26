/**
 * Chess Anti-Cheat Service
 * 
 * Multi-layered anti-cheat system for PvP chess:
 * 1. Move speed enforcement (minimum 300ms)
 * 2. Timing variance analysis (bots have suspiciously consistent timing)
 * 3. Engine move correlation (compare against top engine moves)
 * 4. Tab-focus change tracking
 * 5. Per-game data storage for admin review
 */

import { ChessEngine } from '@casino/game-engine';

interface MoveRecord {
    playerId: string;
    move: string;       // SAN notation
    fen: string;        // position before the move
    timeMs: number;     // time taken for this move in ms
    timestamp: number;
    wasTopMove: boolean; // was this move in the top-3 engine moves?
    tabFocused: boolean;
}

interface PlayerAntiCheatProfile {
    moveTimes: number[];
    topMoveCount: number;
    totalMoves: number;
    tabSwitchCount: number;
    suspiciousFlags: string[];
    flagCount: number;
}

export interface AntiCheatResult {
    allowed: boolean;
    flagged: boolean;
    reason?: string;
    warningMessage?: string;
}

export interface AntiCheatReport {
    playerId: string;
    totalMoves: number;
    avgMoveTime: number;
    moveTimeStdDev: number;
    engineCorrelation: number;  // percentage of moves matching top engine moves
    tabSwitchCount: number;
    flags: string[];
    verdict: 'clean' | 'suspicious' | 'likely_cheating';
}

// Per-game anti-cheat tracking
const gameTracking = new Map<string, {
    moves: MoveRecord[];
    players: Map<string, PlayerAntiCheatProfile>;
}>();

const MIN_MOVE_TIME_MS = 300;     // Minimum time for a move (300ms)
const ENGINE_CORRELATION_THRESHOLD = 0.85; // 85% match with engine moves
const MIN_MOVES_FOR_CORRELATION = 15; // Need at least 15 moves to check correlation
const TIMING_VARIANCE_THRESHOLD = 50; // ms - suspiciously low standard deviation

export class ChessAntiCheat {
    /**
     * Initialize tracking for a new game
     */
    static initGame(gameId: string, player1Id: string, player2Id: string): void {
        const players = new Map<string, PlayerAntiCheatProfile>();

        const initProfile = (): PlayerAntiCheatProfile => ({
            moveTimes: [],
            topMoveCount: 0,
            totalMoves: 0,
            tabSwitchCount: 0,
            suspiciousFlags: [],
            flagCount: 0,
        });

        players.set(player1Id, initProfile());
        players.set(player2Id, initProfile());

        gameTracking.set(gameId, { moves: [], players });
    }

    /**
     * Analyze a move and decide if it should be allowed
     */
    static analyzeMove(
        gameId: string,
        playerId: string,
        moveSan: string,
        fenBefore: string,
        moveTimeMs: number,
        tabFocused: boolean = true,
    ): AntiCheatResult {
        const tracking = gameTracking.get(gameId);
        if (!tracking) {
            return { allowed: true, flagged: false };
        }

        const profile = tracking.players.get(playerId);
        if (!profile) {
            return { allowed: true, flagged: false };
        }

        const flags: string[] = [];
        let warningMessage: string | undefined;

        // --- Check 1: Minimum move time ---
        if (moveTimeMs < MIN_MOVE_TIME_MS && profile.totalMoves > 2) {
            // Allow first 2 moves to be fast (premoves, opening prep)
            flags.push(`move_too_fast:${moveTimeMs}ms`);
            return {
                allowed: false,
                flagged: true,
                reason: 'Move was too fast',
                warningMessage: 'Please slow down — moves must take at least 0.3 seconds.',
            };
        }

        // --- Check 2: Engine move correlation ---
        let wasTopMove = false;
        try {
            const topMoves = ChessEngine.getTopMoves(fenBefore, 3);
            wasTopMove = topMoves.some((tm: { move: string; score: number }) => tm.move === moveSan);
        } catch {
            // If evaluation fails, skip this check
        }

        if (wasTopMove) {
            profile.topMoveCount++;
        }
        profile.totalMoves++;

        // Check correlation rate after enough moves
        if (profile.totalMoves >= MIN_MOVES_FOR_CORRELATION) {
            const correlation = profile.topMoveCount / profile.totalMoves;
            if (correlation >= ENGINE_CORRELATION_THRESHOLD) {
                flags.push(`high_engine_correlation:${(correlation * 100).toFixed(1)}%`);
                warningMessage = 'Your play pattern has been flagged for review.';
            }
        }

        // --- Check 3: Timing variance (bot detection) ---
        profile.moveTimes.push(moveTimeMs);

        if (profile.moveTimes.length >= 10) {
            const stdDev = this.calculateStdDev(profile.moveTimes);
            if (stdDev < TIMING_VARIANCE_THRESHOLD) {
                flags.push(`low_timing_variance:${stdDev.toFixed(0)}ms`);
            }

            // Also check for suspiciously uniform average (bots often have avg between 500-800ms)
            const avg = profile.moveTimes.reduce((a, b) => a + b, 0) / profile.moveTimes.length;
            if (avg < 800 && stdDev < 100 && profile.totalMoves > 15) {
                flags.push(`bot_like_timing:avg=${avg.toFixed(0)}ms,std=${stdDev.toFixed(0)}ms`);
                warningMessage = 'Unusual play patterns detected. Your game may be reviewed.';
            }
        }

        // --- Check 4: Tab focus tracking ---
        if (!tabFocused) {
            profile.tabSwitchCount++;
            if (profile.tabSwitchCount > 10) {
                flags.push(`excessive_tab_switching:${profile.tabSwitchCount}`);
            }
        }

        // Record the move
        tracking.moves.push({
            playerId,
            move: moveSan,
            fen: fenBefore,
            timeMs: moveTimeMs,
            timestamp: Date.now(),
            wasTopMove,
            tabFocused,
        });

        // Update flags
        profile.suspiciousFlags.push(...flags);
        profile.flagCount += flags.length;

        return {
            allowed: true,
            flagged: flags.length > 0,
            reason: flags.length > 0 ? flags.join('; ') : undefined,
            warningMessage,
        };
    }

    /**
     * Generate a post-game report for a player
     */
    static getPlayerReport(gameId: string, playerId: string): AntiCheatReport | null {
        const tracking = gameTracking.get(gameId);
        if (!tracking) return null;

        const profile = tracking.players.get(playerId);
        if (!profile) return null;

        const avgTime = profile.moveTimes.length > 0
            ? profile.moveTimes.reduce((a, b) => a + b, 0) / profile.moveTimes.length
            : 0;

        const stdDev = this.calculateStdDev(profile.moveTimes);
        const correlation = profile.totalMoves > 0
            ? profile.topMoveCount / profile.totalMoves
            : 0;

        let verdict: 'clean' | 'suspicious' | 'likely_cheating' = 'clean';

        if (profile.flagCount >= 5 ||
            (correlation >= ENGINE_CORRELATION_THRESHOLD && profile.totalMoves >= MIN_MOVES_FOR_CORRELATION)) {
            verdict = 'likely_cheating';
        } else if (profile.flagCount >= 2) {
            verdict = 'suspicious';
        }

        return {
            playerId,
            totalMoves: profile.totalMoves,
            avgMoveTime: avgTime,
            moveTimeStdDev: stdDev,
            engineCorrelation: correlation,
            tabSwitchCount: profile.tabSwitchCount,
            flags: profile.suspiciousFlags,
            verdict,
        };
    }

    /**
     * Get combined anti-cheat data for storing in the database
     */
    static getGameAntiCheatData(gameId: string): any {
        const tracking = gameTracking.get(gameId);
        if (!tracking) return {};

        const reports: Record<string, AntiCheatReport | null> = {};
        for (const [playerId] of tracking.players) {
            reports[playerId] = this.getPlayerReport(gameId, playerId);
        }

        return {
            reports,
            totalMoves: tracking.moves.length,
            analyzedAt: new Date().toISOString(),
        };
    }

    /**
     * Clean up tracking data for a finished game
     */
    static cleanupGame(gameId: string): void {
        // Keep data for 10 minutes after game ends for admin queries, then cleanup
        setTimeout(() => {
            gameTracking.delete(gameId);
        }, 10 * 60 * 1000);
    }

    /**
     * Report a tab focus change from the client
     */
    static reportTabSwitch(gameId: string, playerId: string): void {
        const tracking = gameTracking.get(gameId);
        if (!tracking) return;

        const profile = tracking.players.get(playerId);
        if (profile) {
            profile.tabSwitchCount++;
        }
    }

    /**
     * Calculate standard deviation of an array of numbers
     */
    private static calculateStdDev(values: number[]): number {
        if (values.length < 2) return Infinity;

        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => (v - avg) ** 2);
        const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

        return Math.sqrt(avgSquaredDiff);
    }
}
