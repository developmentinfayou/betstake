import { BaseGame, BetInput, BetResult } from '../../base-game';
// @ts-ignore - chess.js has no type declarations
import { Chess } from 'chess.js';

/**
 * Time control configuration
 */
export interface TimeControl {
    baseTime: number;   // seconds
    increment: number;  // seconds per move
}

/**
 * Chess game state stored in PVPGame.gameState
 */
export interface ChessGameState {
    fen: string;
    pgn: string;
    playerWhite: string;   // userId
    playerBlack: string;   // userId
    currentTurn: 'white' | 'black';
    whiteTime: number;     // remaining ms
    blackTime: number;     // remaining ms
    lastMoveAt: number;    // timestamp ms (for calculating elapsed time)
    moveCount: number;
    isCheck: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    isDraw: boolean;
    isGameOver: boolean;
    endReason?: string;
    winner?: string;       // userId or null
}

/**
 * Preset time control modes
 */
export const CHESS_MODES: Record<string, TimeControl> = {
    '1+0': { baseTime: 60, increment: 0 },    // Bullet
    '2+1': { baseTime: 120, increment: 1 },    // Bullet
    '3+0': { baseTime: 180, increment: 0 },    // Blitz
    '3+2': { baseTime: 180, increment: 2 },    // Blitz
    '5+0': { baseTime: 300, increment: 0 },    // Blitz
    '5+3': { baseTime: 300, increment: 3 },    // Blitz
    '10+0': { baseTime: 600, increment: 0 },    // Rapid
    '10+5': { baseTime: 600, increment: 5 },    // Rapid
    '15+10': { baseTime: 900, increment: 10 },   // Rapid
    '30+0': { baseTime: 1800, increment: 0 },    // Classical
    '30+20': { baseTime: 1800, increment: 20 },   // Classical
};

/**
 * Parse a time control string like "15+10" into { baseTime, increment }
 */
export function parseTimeControl(mode: string): TimeControl {
    // Check preset modes first
    if (CHESS_MODES[mode]) {
        return CHESS_MODES[mode];
    }

    // Parse custom format "baseMinutes+incrementSeconds"
    const parts = mode.split('+');
    if (parts.length !== 2) {
        throw new Error(`Invalid time control format: ${mode}. Use format like "15+10"`);
    }

    const baseMinutes = parseInt(parts[0], 10);
    const incrementSeconds = parseInt(parts[1], 10);

    if (isNaN(baseMinutes) || isNaN(incrementSeconds) || baseMinutes < 1 || incrementSeconds < 0) {
        throw new Error(`Invalid time control values: ${mode}`);
    }

    return {
        baseTime: baseMinutes * 60,
        increment: incrementSeconds,
    };
}

/**
 * Chess Engine — handles game state, move validation, and clock management
 */
export class ChessEngine {
    /**
     * Initialize a new chess game state
     */
    static initializeGame(
        players: Array<{ userId: string; username: string }>,
        mode: string,
    ): ChessGameState {
        const chess = new Chess();
        const tc = parseTimeControl(mode);
        const baseTimeMs = tc.baseTime * 1000;

        // Randomly assign colors (first player = white in this case, 
        // the WebSocket handler may randomize before calling this)
        return {
            fen: chess.fen(),
            pgn: '',
            playerWhite: players[0].userId,
            playerBlack: players[1].userId,
            currentTurn: 'white',
            whiteTime: baseTimeMs,
            blackTime: baseTimeMs,
            lastMoveAt: Date.now(),
            moveCount: 0,
            isCheck: false,
            isCheckmate: false,
            isStalemate: false,
            isDraw: false,
            isGameOver: false,
        };
    }

    /**
     * Validate and apply a move, returning updated game state
     */
    static validateAndApplyMove(
        gameState: ChessGameState,
        playerId: string,
        move: { from: string; to: string; promotion?: string },
        incrementSeconds: number,
    ): { success: boolean; gameState: ChessGameState; error?: string; san?: string } {
        // Check it's the player's turn
        const isWhite = playerId === gameState.playerWhite;
        const isBlack = playerId === gameState.playerBlack;

        if (!isWhite && !isBlack) {
            return { success: false, gameState, error: 'Not a player in this game' };
        }

        if ((gameState.currentTurn === 'white' && !isWhite) ||
            (gameState.currentTurn === 'black' && !isBlack)) {
            return { success: false, gameState, error: 'Not your turn' };
        }

        if (gameState.isGameOver) {
            return { success: false, gameState, error: 'Game is already over' };
        }

        // Load chess position
        const chess = new Chess(gameState.fen);

        // Try to make the move
        try {
            const result = chess.move({
                from: move.from,
                to: move.to,
                promotion: move.promotion || undefined,
            });

            if (!result) {
                return { success: false, gameState, error: 'Invalid move' };
            }

            // Update clocks
            const now = Date.now();
            const elapsed = now - gameState.lastMoveAt;

            const newState: ChessGameState = {
                ...gameState,
                fen: chess.fen(),
                pgn: chess.pgn(),
                currentTurn: chess.turn() === 'w' ? 'white' : 'black',
                lastMoveAt: now,
                moveCount: gameState.moveCount + 1,
                isCheck: chess.isCheck(),
                isCheckmate: chess.isCheckmate(),
                isStalemate: chess.isStalemate(),
                isDraw: chess.isDraw(),
                isGameOver: chess.isGameOver(),
            };

            // Update the clock of the player who just moved
            if (gameState.currentTurn === 'white') {
                newState.whiteTime = Math.max(0, gameState.whiteTime - elapsed + (incrementSeconds * 1000));
            } else {
                newState.blackTime = Math.max(0, gameState.blackTime - elapsed + (incrementSeconds * 1000));
            }

            // Determine game end
            if (chess.isCheckmate()) {
                newState.endReason = 'checkmate';
                newState.winner = gameState.currentTurn === 'white'
                    ? gameState.playerWhite
                    : gameState.playerBlack;
            } else if (chess.isStalemate()) {
                newState.endReason = 'stalemate';
            } else if (chess.isDraw()) {
                if (chess.isThreefoldRepetition()) {
                    newState.endReason = 'threefold repetition';
                } else if (chess.isInsufficientMaterial()) {
                    newState.endReason = 'insufficient material';
                } else {
                    newState.endReason = 'draw';
                }
            }

            return { success: true, gameState: newState, san: result.san };
        } catch (e: any) {
            return { success: false, gameState, error: e.message || 'Invalid move' };
        }
    }

    /**
     * Handle timeout — the player whose clock ran out loses
     */
    static handleTimeout(gameState: ChessGameState, timedOutColor: 'white' | 'black'): ChessGameState {
        return {
            ...gameState,
            isGameOver: true,
            endReason: 'timeout',
            winner: timedOutColor === 'white' ? gameState.playerBlack : gameState.playerWhite,
        };
    }

    /**
     * Handle resignation
     */
    static handleResignation(gameState: ChessGameState, resigningPlayerId: string): ChessGameState {
        const isWhite = resigningPlayerId === gameState.playerWhite;
        return {
            ...gameState,
            isGameOver: true,
            endReason: 'resignation',
            winner: isWhite ? gameState.playerBlack : gameState.playerWhite,
        };
    }

    /**
     * Handle draw agreement
     */
    static handleDrawAgreement(gameState: ChessGameState): ChessGameState {
        return {
            ...gameState,
            isGameOver: true,
            isDraw: true,
            endReason: 'agreement',
        };
    }

    /**
     * Get legal moves for the current position (for frontend highlighting)
     */
    static getLegalMoves(fen: string): Array<{ from: string; to: string; promotion?: string }> {
        const chess = new Chess(fen);
        return chess.moves({ verbose: true }).map((m: any) => ({
            from: m.from,
            to: m.to,
            promotion: m.promotion || undefined,
        }));
    }

    /**
     * Lightweight position evaluation for anti-cheat engine correlation
     * Returns centipawn score from white's perspective
     */
    static evaluatePosition(fen: string): number {
        const chess = new Chess(fen);
        const board = chess.board();

        const pieceValues: Record<string, number> = {
            p: 100, n: 320, b: 330, r: 500, q: 900, k: 0,
        };

        // Positional bonuses (center control, development)
        const centerSquares = ['d4', 'd5', 'e4', 'e5'];
        const extendedCenter = ['c3', 'c4', 'c5', 'c6', 'd3', 'd6', 'e3', 'e6', 'f3', 'f4', 'f5', 'f6'];

        let score = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (!piece) continue;

                const value = pieceValues[piece.type] || 0;
                const sign = piece.color === 'w' ? 1 : -1;
                score += value * sign;

                // Center control bonus
                const square = String.fromCharCode(97 + col) + (8 - row);
                if (centerSquares.includes(square)) {
                    score += 30 * sign;
                } else if (extendedCenter.includes(square)) {
                    score += 10 * sign;
                }
            }
        }

        // Mobility bonus
        const moves = chess.moves().length;
        const currentTurnSign = chess.turn() === 'w' ? 1 : -1;
        score += moves * 2 * currentTurnSign;

        return score;
    }

    /**
     * Get top N "best" moves using lightweight evaluation
     * Used by anti-cheat to check if player consistently plays engine-level moves
     */
    static getTopMoves(fen: string, n: number = 3): Array<{ move: string; score: number }> {
        const chess = new Chess(fen);
        const moves = chess.moves({ verbose: true });

        const evaluated = moves.map((move: any) => {
            const testChess = new Chess(fen);
            testChess.move(move);
            const score = -this.evaluatePosition(testChess.fen()); // Negate for opponent's perspective
            return { move: move.san, from: move.from, to: move.to, score };
        });

        evaluated.sort((a: any, b: any) => b.score - a.score);
        return evaluated.slice(0, n);
    }
}

/**
 * ChessGame — placeholder BaseGame implementation for game registry
 * Actual gameplay is session-based via WebSocket, not through BetEngine.placeBet()
 */
export class ChessGame extends BaseGame {
    play(input: BetInput): BetResult {
        // Chess is PvP session-based, this is a stub for registry compatibility
        return {
            multiplier: 0,
            payout: 0,
            profit: -input.amount,
            won: false,
            gameData: input.gameParams,
            result: { message: 'Chess is played via PvP WebSocket, not BetEngine' },
        };
    }
}
