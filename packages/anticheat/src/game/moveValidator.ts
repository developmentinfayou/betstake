import { Chess } from 'chess.js';
import { v4 as uuid } from 'uuid';
import { GameMove, MoveValidationResult, ClientEvent } from '../types';

interface GameState {
  gameId: string;
  fen: string;
  moveCount: number;
  moves: GameMove[];
  clientEvents: ClientEvent[];
  whitePlayerId: string;
  blackPlayerId: string;
  startedAt: number;
  lastMoveTimestamp: number;
}

export class MoveValidator {
  private games: Map<string, GameState> = new Map();

  /**
   * Initialize a new game with starting FEN.
   */
  createGame(
    gameId: string,
    whitePlayerId: string,
    blackPlayerId: string,
    startFen?: string
  ): GameState {
    const fen = startFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const state: GameState = {
      gameId,
      fen,
      moveCount: 0,
      moves: [],
      clientEvents: [],
      whitePlayerId,
      blackPlayerId,
      startedAt: Date.now(),
      lastMoveTimestamp: Date.now(),
    };
    this.games.set(gameId, state);
    return state;
  }

  /**
   * Validate and apply a move. Returns the result with SAN and new FEN if legal.
   */
  validateAndApplyMove(
    gameId: string,
    playerId: string,
    from: string,
    to: string,
    promotion?: string,
    clientElapsedMs?: number,
    clientTabFocused?: boolean
  ): MoveValidationResult & { move?: GameMove } {
    const state = this.games.get(gameId);
    if (!state) {
      return { valid: false, error: 'Game not found' };
    }

    const chess = new Chess(state.fen);

    // Verify it's the correct player's turn
    const expectedPlayer =
      chess.turn() === 'w' ? state.whitePlayerId : state.blackPlayerId;
    if (playerId !== expectedPlayer) {
      return { valid: false, error: 'Not your turn' };
    }

    const fenBefore = chess.fen();

    // Attempt the move
    let result;
    try {
      result = chess.move({ from, to, promotion });
    } catch {
      return { valid: false, error: 'Invalid move' };
    }

    if (!result) {
      return { valid: false, error: 'Illegal move' };
    }

    const fenAfter = chess.fen();
    const serverTimestamp = Date.now();
    const side: 'white' | 'black' = result.color === 'w' ? 'white' : 'black';

    // Count blur events during this think window
    const blurEventsDuringThink = this.countBlurEvents(
      state,
      playerId,
      state.lastMoveTimestamp,
      serverTimestamp
    );

    state.moveCount++;

    const gameMove: GameMove = {
      id: uuid(),
      gameId,
      moveNumber: state.moveCount,
      side,
      san: result.san,
      from: result.from,
      to: result.to,
      fenBefore,
      fenAfter,
      serverTimestamp,
      clientElapsedMs: clientElapsedMs ?? serverTimestamp - state.lastMoveTimestamp,
      clientTabFocused: clientTabFocused ?? true,
      blurEventsDuringThink,
      clientSequenceId: state.moveCount,
    };

    state.moves.push(gameMove);
    state.fen = fenAfter;
    state.lastMoveTimestamp = serverTimestamp;

    return {
      valid: true,
      san: result.san,
      fenAfter,
      move: gameMove,
    };
  }

  /**
   * Record a client event (tab blur, focus, etc.).
   */
  recordClientEvent(
    gameId: string,
    playerId: string,
    eventType: ClientEvent['eventType'],
    ts: number,
    moveNumber?: number
  ): void {
    const state = this.games.get(gameId);
    if (!state) return;

    state.clientEvents.push({
      id: uuid(),
      gameId,
      playerId,
      eventType,
      ts,
      moveNumber,
    });
  }

  /**
   * Get the current game state.
   */
  getGameState(gameId: string): GameState | undefined {
    return this.games.get(gameId);
  }

  /**
   * Check if the game is over (checkmate, stalemate, draw).
   */
  isGameOver(gameId: string): {
    over: boolean;
    result?: '1-0' | '0-1' | '1/2-1/2';
    reason?: string;
  } {
    const state = this.games.get(gameId);
    if (!state) return { over: false };

    const chess = new Chess(state.fen);

    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? '0-1' : '1-0';
      return { over: true, result: winner as '1-0' | '0-1', reason: 'checkmate' };
    }
    if (chess.isStalemate()) {
      return { over: true, result: '1/2-1/2', reason: 'stalemate' };
    }
    if (chess.isDraw()) {
      return { over: true, result: '1/2-1/2', reason: 'draw' };
    }
    if (chess.isThreefoldRepetition()) {
      return { over: true, result: '1/2-1/2', reason: 'threefold repetition' };
    }
    if (chess.isInsufficientMaterial()) {
      return { over: true, result: '1/2-1/2', reason: 'insufficient material' };
    }

    return { over: false };
  }

  /**
   * Finalize a game — returns all moves and events for analysis.
   */
  finalizeGame(gameId: string): {
    moves: GameMove[];
    clientEvents: ClientEvent[];
  } | null {
    const state = this.games.get(gameId);
    if (!state) return null;
    return { moves: [...state.moves], clientEvents: [...state.clientEvents] };
  }

  /**
   * Remove a game from memory (after persisting to DB).
   */
  removeGame(gameId: string): void {
    this.games.delete(gameId);
  }

  private countBlurEvents(
    state: GameState,
    playerId: string,
    windowStart: number,
    windowEnd: number
  ): number {
    return state.clientEvents.filter(
      (e) =>
        e.playerId === playerId &&
        (e.eventType === 'tabBlur' || e.eventType === 'windowHidden') &&
        e.ts >= windowStart &&
        e.ts <= windowEnd
    ).length;
  }
}
