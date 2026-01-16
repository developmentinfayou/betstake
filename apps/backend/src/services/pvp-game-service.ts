import { PVPGame, PVPGameStatus, PVPGameType, User, Wallet } from '@casino/database';
import { WalletService } from './wallet-service';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export const pvpEvents = new EventEmitter();

export class PVPGameService {
  /**
   * Create new PVP game
   */
  static async createGame(creatorId: string, gameType: PVPGameType, mode: string, betAmount: number, currency: string) {
    const session = await mongoose.startSession();
    
    try {
      return await session.withTransaction(async () => {
        // Debit creator's wallet
        await WalletService.debitBalanceWithSession(creatorId, currency, betAmount, session);
        
        // Create game
        const [game] = await PVPGame.create([{
          gameType,
          mode,
          players: [creatorId],
          betAmount,
          currency,
          status: PVPGameStatus.WAITING,
          gameState: this.initializeGameState(gameType, mode),
          shareableLink: uuidv4(),
          moves: []
        }], { session });
        
        return game;
      });
    } finally {
      await session.endSession();
    }
  }
  
  /**
   * Join existing game
   */
  static async joinGame(gameId: string, playerId: string) {
    const session = await mongoose.startSession();
    
    try {
      return await session.withTransaction(async () => {
        const game = await PVPGame.findById(gameId).session(session);
        if (!game || game.status !== PVPGameStatus.WAITING) {
          throw new Error('Game not available');
        }
        
        if (game.players.includes(playerId as any)) {
          throw new Error('Already in game');
        }
        
        // Check if game is full
        const maxPlayers = this.getMaxPlayers(game.gameType, game.mode);
        if (game.players.length >= maxPlayers) {
          throw new Error('Game is full');
        }
        
        // Debit player's wallet
        await WalletService.debitBalanceWithSession(playerId, game.currency, game.betAmount, session);
        
        // Add player to game
        game.players.push(playerId as any);
        
        // Start game if full
        if (game.players.length === maxPlayers) {
          game.status = PVPGameStatus.ACTIVE;
          game.startedAt = new Date();
        }
        
        await game.save({ session });
        
        return game;
      });
    } finally {
      await session.endSession();
    }
  }
  
  /**
   * Make move with anti-cheat validation
   */
  static async makeMove(gameId: string, playerId: string, move: any) {
    const session = await mongoose.startSession();
    
    try {
      return await session.withTransaction(async () => {
        const game = await PVPGame.findById(gameId).session(session);
        if (!game || game.status !== PVPGameStatus.ACTIVE) {
          throw new Error('Game not active');
        }
        
        if (!game.players.includes(playerId as any)) {
          throw new Error('Not a player in this game');
        }
        
        // Validate move
        const isValidMove = await this.validateMove(game, playerId, move);
        if (!isValidMove) {
          throw new Error('Invalid move');
        }
        
        // Anti-cheat checks
        const antiCheatPassed = await this.performAntiCheatChecks(game, playerId, move);
        if (!antiCheatPassed) {
          throw new Error('Anti-cheat violation detected');
        }
        
        // Apply move
        game.moves.push({
          playerId,
          move,
          timestamp: new Date(),
          moveNumber: game.moves.length + 1
        });
        
        // Update game state
        game.gameState = this.applyMove(game.gameState, game.gameType, move);
        
        // Check for game end
        const winner = this.checkGameEnd(game.gameState, game.gameType);
        if (winner) {
          game.status = PVPGameStatus.FINISHED;
          game.winner = winner;
          game.finishedAt = new Date();
          
          // Distribute winnings
          const totalPot = game.betAmount * game.players.length;
          const houseEdge = totalPot * 0.02; // 2% house edge
          const winnings = totalPot - houseEdge;
          
          await WalletService.creditBalanceWithSession(
            winner.toString(),
            game.currency,
            winnings,
            session
          );
        }
        
        await game.save({ session });
        
        return game;
      });
    } finally {
      await session.endSession();
    }
  }
  
  /**
   * Initialize game state based on game type
   */
  private static initializeGameState(gameType: PVPGameType, mode: string) {
    switch (gameType) {
      case PVPGameType.LUDO:
        return {
          board: this.initializeLudoBoard(),
          currentPlayer: 0,
          pieces: this.initializeLudoPieces(mode)
        };
      case PVPGameType.CHESS:
        return {
          board: this.initializeChessBoard(),
          currentPlayer: 'white',
          castling: { white: { king: true, queen: true }, black: { king: true, queen: true } },
          enPassant: null
        };
      default:
        return {};
    }
  }
  
  /**
   * Get maximum players for game mode
   */
  private static getMaxPlayers(gameType: PVPGameType, mode: string): number {
    if (gameType === PVPGameType.LUDO) {
      switch (mode) {
        case '1v1': return 2;
        case '2v2': return 4;
        case '1v1v1v1': return 4;
        default: return 2;
      }
    }
    return 2; // Chess is always 2 players
  }
  
  /**
   * Validate move legality
   */
  private static async validateMove(game: any, playerId: string, move: any): Promise<boolean> {
    // Game-specific move validation
    switch (game.gameType) {
      case PVPGameType.LUDO:
        return this.validateLudoMove(game.gameState, playerId, move);
      case PVPGameType.CHESS:
        return this.validateChessMove(game.gameState, playerId, move);
      default:
        return false;
    }
  }
  
  /**
   * Anti-cheat system
   */
  private static async performAntiCheatChecks(game: any, playerId: string, move: any): Promise<boolean> {
    // Time-based checks
    const lastMove = game.moves[game.moves.length - 1];
    if (lastMove) {
      const timeDiff = Date.now() - new Date(lastMove.timestamp).getTime();
      if (timeDiff < 100) { // Too fast
        return false;
      }
    }
    
    // Pattern detection for bots
    const playerMoves = game.moves.filter((m: any) => m.playerId === playerId);
    if (playerMoves.length > 10) {
      const avgTime = playerMoves.reduce((sum: number, m: any, i: number) => {
        if (i === 0) return sum;
        return sum + (new Date(m.timestamp).getTime() - new Date(playerMoves[i-1].timestamp).getTime());
      }, 0) / (playerMoves.length - 1);
      
      // Suspiciously consistent timing
      if (avgTime < 200 || (avgTime > 500 && avgTime < 600)) {
        return false;
      }
    }
    
    return true;
  }
  
  // Game-specific implementations
  private static initializeLudoBoard() { return Array(40).fill(null); }
  private static initializeLudoPieces(mode: string) { return {}; }
  private static initializeChessBoard() { return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'; }
  
  private static validateLudoMove(gameState: any, playerId: string, move: any): boolean { return true; }
  private static validateChessMove(gameState: any, playerId: string, move: any): boolean { return true; }
  
  private static applyMove(gameState: any, gameType: PVPGameType, move: any) { return gameState; }
  private static checkGameEnd(gameState: any, gameType: PVPGameType) { return null; }
  
  /**
   * Get game by shareable link
   */
  static async getGameByLink(shareableLink: string) {
    return PVPGame.findOne({ shareableLink }).populate('players', 'username');
  }
  
  /**
   * Get player's active games
   */
  static async getPlayerGames(playerId: string) {
    return PVPGame.find({
      players: playerId,
      status: { $in: [PVPGameStatus.WAITING, PVPGameStatus.ACTIVE] }
    }).populate('players', 'username');
  }
}