import { generateFloat, generateServerSeed, hashServerSeed, generateClientSeed } from '@casino/fairness';
import { LudoMode, LudoColor, LudoGameState, LudoPlayer, LudoMove, ValidMove } from './types';
import { LudoBoard } from './board';
import { LudoRules } from './rules';

export class LudoGame {
  /**
   * Initialize new game
   */
  static initializeGame(
    players: Array<{ userId: string; username: string }>,
    mode: LudoMode,
    serverSeed?: string
  ): LudoGameState {
    const seed = serverSeed || generateServerSeed();
    const colors = this.assignColors(mode);
    
    const ludoPlayers: LudoPlayer[] = players.map((p, i) => {
      const teamId = mode === LudoMode.TWO_V_TWO ? Math.floor(i / 2) : undefined;
      return LudoBoard.initializePlayer(p.userId, p.username, colors[i], teamId);
    });

    // Generate client seeds for each player
    const clientSeeds: Record<string, string> = {};
    players.forEach(p => {
      clientSeeds[p.userId] = generateClientSeed();
    });

    return {
      players: ludoPlayers,
      currentTurnIndex: 0,
      diceResult: null,
      moveHistory: [],
      serverSeed: seed,
      serverSeedHash: hashServerSeed(seed),
      clientSeeds,
      nonce: 0
    };
  }

  /**
   * Assign colors based on mode
   */
  private static assignColors(mode: LudoMode): LudoColor[] {
    switch (mode) {
      case LudoMode.ONE_V_ONE:
        return [LudoColor.RED, LudoColor.BLUE];
      case LudoMode.TWO_V_TWO:
        return [LudoColor.RED, LudoColor.GREEN, LudoColor.BLUE, LudoColor.YELLOW];
      case LudoMode.FOUR_PLAYER:
        return [LudoColor.RED, LudoColor.BLUE, LudoColor.GREEN, LudoColor.YELLOW];
    }
  }

  /**
   * Roll dice using provably fair RNG
   */
  static rollDice(gameState: LudoGameState): number {
    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    const combinedClientSeed = this.combineClientSeeds(gameState.clientSeeds);

    const float = generateFloat({
      serverSeed: gameState.serverSeed,
      clientSeed: combinedClientSeed,
      nonce: gameState.nonce
    });

    gameState.nonce++;
    const result = Math.floor(float * 6) + 1; // 1-6
    gameState.diceResult = result;

    return result;
  }

  /**
   * Combine all player client seeds
   */
  private static combineClientSeeds(clientSeeds: Record<string, string>): string {
    return Object.values(clientSeeds).join(':');
  }

  /**
   * Get valid moves for current player
   */
  static getValidMoves(gameState: LudoGameState): ValidMove[] {
    if (!gameState.diceResult) return [];

    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    return LudoRules.getValidMoves(currentPlayer, gameState.diceResult, gameState.players);
  }

  /**
   * Execute move
   */
  static executeMove(
    gameState: LudoGameState,
    tokenId: number
  ): { success: boolean; captured?: { playerId: string; tokenId: number } } {
    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    const diceResult = gameState.diceResult!;

    // Validate move
    if (!LudoRules.isValidMove(currentPlayer, tokenId, diceResult, gameState.players)) {
      return { success: false };
    }

    const token = currentPlayer.tokens[tokenId];
    const oldPos = token.position;
    const newPos = token.position === -1 ? 0 : LudoBoard.calculateNewPosition(token.position, diceResult);

    // Check for capture
    const captureTarget = LudoBoard.findCaptureTarget(
      gameState.players,
      currentPlayer.color,
      newPos,
      currentPlayer.teamId
    );

    // Execute capture
    if (captureTarget) {
      const targetPlayer = gameState.players.find(p => p.userId === captureTarget.playerId)!;
      targetPlayer.tokens[captureTarget.tokenId].position = -1; // Send back home
    }

    // Move token
    token.position = newPos;
    if (newPos === 57) {
      token.isFinished = true;
    }

    // Record move
    const move: LudoMove = {
      playerId: currentPlayer.userId,
      tokenId,
      from: oldPos,
      to: newPos,
      diceRoll: diceResult,
      nonce: gameState.nonce - 1,
      captured: captureTarget,
      timestamp: Date.now()
    };
    gameState.moveHistory.push(move);

    // Check win condition
    this.checkWinCondition(gameState);

    // Next turn
    const rolledSix = diceResult === 6;
    if (!rolledSix) {
      gameState.currentTurnIndex = LudoRules.getNextPlayerIndex(
        gameState.currentTurnIndex,
        gameState.players.length,
        false
      );
    }

    gameState.diceResult = null;

    return { success: true, captured: captureTarget };
  }

  /**
   * Check win condition
   */
  private static checkWinCondition(gameState: LudoGameState): void {
    for (const player of gameState.players) {
      if (LudoBoard.hasPlayerWon(player)) {
        gameState.winner = player.userId;
        return;
      }
    }

    // Check team win (2v2)
    if (gameState.players[0].teamId !== undefined) {
      for (let teamId = 0; teamId < 2; teamId++) {
        if (LudoBoard.hasTeamWon(gameState.players, teamId)) {
          gameState.winningTeam = teamId;
          return;
        }
      }
    }
  }

  /**
   * Calculate payout
   */
  static calculatePayout(
    mode: LudoMode,
    betAmount: number,
    totalPlayers: number
  ): { winnerPayout: number; houseEdge: number } {
    const totalPot = betAmount * totalPlayers;
    
    const houseEdgePercent = mode === LudoMode.FOUR_PLAYER ? 3 : 2;
    const houseEdge = totalPot * (houseEdgePercent / 100);
    const winnerPayout = totalPot - houseEdge;

    return { winnerPayout, houseEdge };
  }

  /**
   * Auto-select move (for timeout)
   */
  static autoSelectMove(gameState: LudoGameState): number | null {
    const validMoves = this.getValidMoves(gameState);
    if (validMoves.length === 0) return null;

    // Prioritize: capture > advance furthest > move from home
    const captureMove = validMoves.find(m => m.canCapture);
    if (captureMove) return captureMove.tokenId;

    const advanceMove = validMoves.reduce((best, current) => 
      current.to > best.to ? current : best
    );
    return advanceMove.tokenId;
  }

  /**
   * Verify dice roll
   */
  static verifyDiceRoll(
    serverSeed: string,
    clientSeeds: Record<string, string>,
    nonce: number
  ): number {
    const combinedClientSeed = this.combineClientSeeds(clientSeeds);
    const float = generateFloat({ serverSeed, clientSeed: combinedClientSeed, nonce });
    return Math.floor(float * 6) + 1;
  }
}

export * from './types';
export * from './board';
export * from './rules';
