import { useState, useEffect, useRef, useCallback } from 'react';
import { activeSessionsAPI, betAPI } from '@/lib/api';

interface ActiveGameInfo {
    gameType: string;
    sessionId: string;
    betAmount: number;
}

interface UseActiveGameGuardOptions {
    /** The game type of the CURRENT page (e.g., 'MINES', 'HILO', etc.) */
    currentGameType: string;
    /** Whether autobet is currently active — used for cleanup on unmount */
    autoBetActive?: boolean;
}

/**
 * Hook that enforces two BC Game-like behaviors:
 * 1. Cross-game blocking: detects active sessions in OTHER games and blocks betting
 * 2. Auto-bet cleanup: stops autobet server-side when navigating away
 */
export function useActiveGameGuard({ currentGameType, autoBetActive }: UseActiveGameGuardOptions) {
    const [blockedByGame, setBlockedByGame] = useState<ActiveGameInfo | null>(null);
    const [checking, setChecking] = useState(true);
    const autoBetActiveRef = useRef(autoBetActive);

    // Keep ref in sync so the cleanup function has the latest value
    useEffect(() => {
        autoBetActiveRef.current = autoBetActive;
    }, [autoBetActive]);

    // On mount: check for active sessions in OTHER games
    useEffect(() => {
        checkCrossGameSessions();
    }, []);

    // On unmount: stop autobet if it was active
    useEffect(() => {
        return () => {
            if (autoBetActiveRef.current) {
                betAPI.stopAutobet().catch(() => { });
            }
        };
    }, []);

    const checkCrossGameSessions = useCallback(async () => {
        setChecking(true);
        try {
            const response = await activeSessionsAPI.check();
            const { activeGames } = response.data;

            // Find any active session that is NOT the current game
            for (const [, game] of Object.entries(activeGames)) {
                if (game && (game as ActiveGameInfo).gameType !== currentGameType) {
                    setBlockedByGame(game as ActiveGameInfo);
                    return;
                }
            }

            setBlockedByGame(null);
        } catch {
            // If the check fails, don't block
            setBlockedByGame(null);
        } finally {
            setChecking(false);
        }
    }, [currentGameType]);

    return {
        /** Whether this game is blocked because another game has an active session */
        isBlocked: blockedByGame !== null,
        /** Whether we're still checking for active sessions */
        checking,
        /** Info about the blocking game (null if not blocked) */
        blockedByGame,
        /** Re-check (call after the user finishes the other game) */
        recheckSessions: checkCrossGameSessions,
    };
}
