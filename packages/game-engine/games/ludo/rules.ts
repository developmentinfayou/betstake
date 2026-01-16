import { LudoPlayer, LudoToken, ValidMove } from './types';
import { LudoBoard } from './board';

export class LudoRules {
  /**
   * Get all valid moves for current player
   */
  static getValidMoves(
    player: LudoPlayer,
    diceResult: number,
    allPlayers: LudoPlayer[]
  ): ValidMove[] {
    const validMoves: ValidMove[] = [];

    for (const token of player.tokens) {
      if (token.isFinished) continue;

      // Token at home - can only move on 6
      if (token.position === -1) {
        if (diceResult === 6) {
          validMoves.push({
            tokenId: token.id,
            from: -1,
            to: 0,
            canCapture: this.checkCapture(player, 0, allPlayers)
          });
        }
        continue;
      }

      // Token on board
      const newPos = LudoBoard.calculateNewPosition(token.position, diceResult);
      
      // Invalid move (overshooting finish)
      if (newPos === token.position) continue;

      validMoves.push({
        tokenId: token.id,
        from: token.position,
        to: newPos,
        canCapture: this.checkCapture(player, newPos, allPlayers)
      });
    }

    return validMoves;
  }

  /**
   * Check if move results in capture
   */
  private static checkCapture(
    player: LudoPlayer,
    position: number,
    allPlayers: LudoPlayer[]
  ): boolean {
    const target = LudoBoard.findCaptureTarget(
      allPlayers,
      player.color,
      position,
      player.teamId
    );
    return target !== null;
  }

  /**
   * Validate if move is legal
   */
  static isValidMove(
    player: LudoPlayer,
    tokenId: number,
    diceResult: number,
    allPlayers: LudoPlayer[]
  ): boolean {
    const validMoves = this.getValidMoves(player, diceResult, allPlayers);
    return validMoves.some(m => m.tokenId === tokenId);
  }

  /**
   * Check if player gets another turn (rolled 6)
   */
  static getsAnotherTurn(diceResult: number): boolean {
    return diceResult === 6;
  }

  /**
   * Check if player must skip turn (no valid moves)
   */
  static mustSkipTurn(player: LudoPlayer, diceResult: number, allPlayers: LudoPlayer[]): boolean {
    const validMoves = this.getValidMoves(player, diceResult, allPlayers);
    return validMoves.length === 0;
  }

  /**
   * Get next player index
   */
  static getNextPlayerIndex(
    currentIndex: number,
    totalPlayers: number,
    rolledSix: boolean
  ): number {
    if (rolledSix) return currentIndex; // Same player
    return (currentIndex + 1) % totalPlayers;
  }
}
