import { LudoColor, LudoPlayer, LudoToken } from './types';

/**
 * Ludo Board Path System
 * Each color has: Home (-1) → Path (0-50) → Final Stretch (51-56) → Finished (57)
 * 
 * Main path: 52 squares (shared)
 * Final stretch: 6 squares (color-specific)
 */

// Starting positions on main path for each color
const START_POSITIONS: Record<LudoColor, number> = {
  [LudoColor.RED]: 0,
  [LudoColor.BLUE]: 13,
  [LudoColor.GREEN]: 26,
  [LudoColor.YELLOW]: 39
};

// Safe positions (cannot be captured)
const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

export class LudoBoard {
  /**
   * Initialize player with 4 tokens at home
   */
  static initializePlayer(userId: string, username: string, color: LudoColor, teamId?: number): LudoPlayer {
    return {
      userId,
      username,
      color,
      tokens: Array.from({ length: 4 }, (_, i) => ({
        id: i,
        position: -1,
        isFinished: false
      })),
      teamId,
      isActive: true
    };
  }

  /**
   * Get absolute position on board (0-51 for main path)
   */
  static getAbsolutePosition(color: LudoColor, relativePos: number): number {
    if (relativePos < 0 || relativePos > 56) return relativePos;
    if (relativePos >= 51) return relativePos; // Final stretch
    
    const start = START_POSITIONS[color];
    return (start + relativePos) % 52;
  }

  /**
   * Check if position is safe from capture
   */
  static isSafePosition(absolutePos: number): boolean {
    return SAFE_POSITIONS.includes(absolutePos) || absolutePos >= 51;
  }

  /**
   * Check if token can enter final stretch
   */
  static canEnterFinalStretch(color: LudoColor, currentPos: number, steps: number): boolean {
    const newPos = currentPos + steps;
    const finalStretchEntry = 50;
    
    return currentPos < finalStretchEntry && newPos >= finalStretchEntry;
  }

  /**
   * Calculate new position after dice roll
   */
  static calculateNewPosition(currentPos: number, diceRoll: number): number {
    if (currentPos === -1) return -1; // Still at home
    
    const newPos = currentPos + diceRoll;
    
    // Exact finish required
    if (newPos > 57) return currentPos; // Invalid move
    
    return newPos;
  }

  /**
   * Check if token at position can be captured
   */
  static canCapture(
    attackerColor: LudoColor,
    attackerPos: number,
    defenderColor: LudoColor,
    defenderPos: number,
    defenderTeamId?: number,
    attackerTeamId?: number
  ): boolean {
    // Same team cannot capture
    if (attackerTeamId !== undefined && attackerTeamId === defenderTeamId) {
      return false;
    }

    // Same color cannot capture
    if (attackerColor === defenderColor) return false;

    // Must be on same absolute position
    const attackerAbsPos = this.getAbsolutePosition(attackerColor, attackerPos);
    const defenderAbsPos = this.getAbsolutePosition(defenderColor, defenderPos);
    
    if (attackerAbsPos !== defenderAbsPos) return false;

    // Safe positions cannot be captured
    if (this.isSafePosition(defenderAbsPos)) return false;

    return true;
  }

  /**
   * Find token at position that can be captured
   */
  static findCaptureTarget(
    players: LudoPlayer[],
    attackerColor: LudoColor,
    attackerPos: number,
    attackerTeamId?: number
  ): { playerId: string; tokenId: number } | null {
    const attackerAbsPos = this.getAbsolutePosition(attackerColor, attackerPos);

    for (const player of players) {
      if (player.color === attackerColor) continue;
      if (attackerTeamId !== undefined && player.teamId === attackerTeamId) continue;

      for (const token of player.tokens) {
        if (token.position < 0 || token.isFinished) continue;

        const defenderAbsPos = this.getAbsolutePosition(player.color, token.position);
        
        if (attackerAbsPos === defenderAbsPos && !this.isSafePosition(defenderAbsPos)) {
          return { playerId: player.userId, tokenId: token.id };
        }
      }
    }

    return null;
  }

  /**
   * Check if all tokens are finished
   */
  static hasPlayerWon(player: LudoPlayer): boolean {
    return player.tokens.every(t => t.isFinished);
  }

  /**
   * Check if team has won (2v2 mode)
   */
  static hasTeamWon(players: LudoPlayer[], teamId: number): boolean {
    const teamPlayers = players.filter(p => p.teamId === teamId);
    return teamPlayers.every(p => this.hasPlayerWon(p));
  }
}
