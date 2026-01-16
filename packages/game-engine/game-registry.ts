import { BaseGame, GameConfig } from './base-game';
import { DiceGame } from './games/dice';
import { LimboGame } from './games/limbo';
import { MinesGame } from './games/mines';
import { PlinkoGame } from './games/plinko';
import { RouletteGame } from './games/roulette';
import { KenoGame } from './games/keno';
import { WheelGame } from './games/wheel';
import { CoinFlipGame } from './games/coinflip';
import { RushGame } from './games/rush';
import { BalloonGame } from './games/balloon';
import { SoloCrashGame } from './games/solocrash';
import { FastParityGame } from './games/fastparity';
import { TowerGame } from './games/tower';
import { StairsGame } from './games/stairs';
import { HiLoGame } from './games/hilo';
import { BlackjackGame } from './games/blackjack';

/**
 * Game Registry - manages all available games
 */
export class GameRegistry {
  private games: Map<string, typeof BaseGame> = new Map();
  private configs: Map<string, GameConfig> = new Map();

  constructor() {
    this.registerDefaultGames();
  }

  /**
   * Register all default games
   */
  private registerDefaultGames() {
    const defaultConfig: GameConfig = {
      houseEdge: 1,
      minBet: { BTC: 0.00001, ETH: 0.0001, USDT: 1, USD: 1 },
      maxBet: { BTC: 1, ETH: 10, USDT: 10000, USD: 10000 },
      maxWin: { BTC: 10, ETH: 100, USDT: 100000, USD: 100000 },
    };

    this.register('DICE', DiceGame, defaultConfig);
    this.register('LIMBO', LimboGame, defaultConfig);
    this.register('MINES', MinesGame, defaultConfig);
    this.register('PLINKO', PlinkoGame, defaultConfig);
    this.register('ROULETTE', RouletteGame, defaultConfig);
    this.register('KENO', KenoGame, defaultConfig);
    this.register('WHEEL', WheelGame, defaultConfig);
    this.register('COINFLIP', CoinFlipGame, defaultConfig);
    this.register('RUSH', RushGame, defaultConfig);
    this.register('BALLOON', BalloonGame, defaultConfig);
    this.register('SOLOCRASH', SoloCrashGame, defaultConfig);
    this.register('FASTPARITY', FastParityGame, defaultConfig);
    this.register('TOWER', TowerGame, defaultConfig);
    this.register('STAIRS', StairsGame, defaultConfig);
    this.register('HILO', HiLoGame, defaultConfig);
    this.register('BLACKJACK', BlackjackGame, defaultConfig);
  }

  /**
   * Register a game
   */
  register(gameType: string, gameClass: typeof BaseGame, config: GameConfig) {
    this.games.set(gameType, gameClass);
    this.configs.set(gameType, config);
  }

  /**
   * Get game instance
   */
  getGame(gameType: string): BaseGame {
    const GameClass = this.games.get(gameType);
    const config = this.configs.get(gameType);

    if (!GameClass || !config) {
      throw new Error(`Game ${gameType} not found`);
    }

    return new GameClass(config);
  }

  /**
   * Update game config
   */
  updateConfig(gameType: string, config: Partial<GameConfig>) {
    const existingConfig = this.configs.get(gameType);
    if (!existingConfig) {
      throw new Error(`Game ${gameType} not found`);
    }

    this.configs.set(gameType, { ...existingConfig, ...config });
  }

  /**
   * Get all registered games
   */
  getAllGames(): string[] {
    return Array.from(this.games.keys());
  }

  /**
   * Check if game exists
   */
  hasGame(gameType: string): boolean {
    return this.games.has(gameType);
  }
}

// Singleton instance
export const gameRegistry = new GameRegistry();
