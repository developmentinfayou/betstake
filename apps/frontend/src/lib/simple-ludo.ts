// Simple Ludo Game Logic
export class SimpleLudoGame {
  static initializeGame(players: Array<{ userId: string; username: string }>) {
    const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
    
    return {
      players: players.map((p, i) => ({
        userId: p.userId,
        username: p.username,
        color: colors[i],
        tokens: [
          { id: 0, position: -1, isFinished: false },
          { id: 1, position: -1, isFinished: false },
          { id: 2, position: -1, isFinished: false },
          { id: 3, position: -1, isFinished: false }
        ]
      })),
      currentTurnIndex: 0,
      diceResult: null,
      winner: null,
      gameStatus: 'playing'
    };
  }

  static rollDice() {
    return Math.floor(Math.random() * 6) + 1; // 1-6
  }

  static getValidMoves(player: any, diceResult: number) {
    const validMoves = [];

    for (let i = 0; i < player.tokens.length; i++) {
      const token = player.tokens[i];
      
      if (token.isFinished) continue;

      // Token at home - can only move on 6
      if (token.position === -1) {
        if (diceResult === 6) {
          validMoves.push({
            tokenId: i,
            from: -1,
            to: 0,
            canCapture: false
          });
        }
        continue;
      }

      // Token on board
      const newPos = token.position + diceResult;
      
      // Can't overshoot finish line
      if (newPos > 57) continue;

      validMoves.push({
        tokenId: i,
        from: token.position,
        to: newPos,
        canCapture: false // Simplified - no capture logic
      });
    }

    return validMoves;
  }

  static makeMove(gameState: any, tokenId: number) {
    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    const diceResult = gameState.diceResult;
    
    // Validate move
    const validMoves = this.getValidMoves(currentPlayer, diceResult);
    const move = validMoves.find(m => m.tokenId === tokenId);
    
    if (!move) {
      return { success: false, message: 'Invalid move' };
    }

    // Execute move
    const token = currentPlayer.tokens[tokenId];
    token.position = move.to;
    
    if (token.position === 57) {
      token.isFinished = true;
    }

    // Check win condition
    const allFinished = currentPlayer.tokens.every(t => t.isFinished);
    if (allFinished) {
      gameState.winner = currentPlayer.userId;
      gameState.gameStatus = 'finished';
    }

    // Next turn logic
    const rolledSix = diceResult === 6;
    if (!rolledSix && !gameState.winner) {
      gameState.currentTurnIndex = (gameState.currentTurnIndex + 1) % gameState.players.length;
    }

    gameState.diceResult = null;

    return { 
      success: true, 
      extraTurn: rolledSix && !gameState.winner,
      gameWon: !!gameState.winner
    };
  }

  static getCurrentPlayer(gameState: any) {
    return gameState.players[gameState.currentTurnIndex];
  }

  static isGameFinished(gameState: any) {
    return gameState.gameStatus === 'finished';
  }
}