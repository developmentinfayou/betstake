import { BaseGame, BetInput, BetResult } from '../../base-game';
import { shuffle, generateFloat } from '@casino/fairness';

export interface MinesParams {
  gridSize: 16 | 25 | 36; // 4x4, 5x5, 6x6
  minesCount: number;
  revealedTiles?: number[]; // For manual mode progressive reveal
  selectedTiles?: number[]; // For auto-bet mode
}

export interface MinesResult {
  grid: boolean[]; // true = mine, false = safe
  revealedTiles: number[];
  hitMine: boolean;
  currentMultiplier: number;
}

/**
 * Mines Game
 * Click tiles to avoid mines, each safe tile increases multiplier
 */
export class MinesGame extends BaseGame {
  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const params = input.gameParams as MinesParams;
    const { gridSize = 25, minesCount, revealedTiles = [], selectedTiles = [] } = params;
    
    // Determine mode: autobet uses selectedTiles, manual uses revealedTiles
    const isAutoBet = selectedTiles.length > 0;
    const tilesToReveal = isAutoBet ? selectedTiles : revealedTiles;

    if (minesCount >= gridSize || minesCount < 1) {
      throw new Error('Invalid mines count');
    }

    if (tilesToReveal.length === 0) {
      throw new Error('No tiles to reveal');
    }

    // Generate provably fair grid
    const grid = this.generateGrid(gridSize, minesCount, input.seedData);

    // Check results
    const hitMine = tilesToReveal.some(tile => grid[tile]);
    const safeTilesRevealed = tilesToReveal.filter(tile => !grid[tile]).length;
    
    // AutoBet: win only if ALL selected tiles are safe
    // Manual: win if any safe tiles revealed
    const won = isAutoBet 
      ? !hitMine && safeTilesRevealed === tilesToReveal.length
      : !hitMine && safeTilesRevealed > 0;
    
    const multiplier = won ? this.calculateMultiplier(gridSize, minesCount, safeTilesRevealed) : 0;
    const finalMultiplier = won ? multiplier * (1 - this.config.houseEdge / 100) : 0;

    const payout = this.calculatePayout(input.amount, finalMultiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: MinesResult = {
      grid,
      revealedTiles: tilesToReveal,
      hitMine,
      currentMultiplier: multiplier,
    };

    return {
      multiplier: finalMultiplier,
      payout,
      profit,
      won,
      gameData: params,
      result,
    };
  }

  private generateGrid(gridSize: number, minesCount: number, seedData: any): boolean[] {
    // Use proper cursor for Mines (3 increments as per Stake)
    const minesSeedData = { ...seedData, cursor: 3 };
    
    // Create array with mines (true) and safe tiles (false)
    const tiles = Array(gridSize).fill(false);
    for (let i = 0; i < minesCount; i++) {
      tiles[i] = true;
    }

    // Shuffle using provably fair RNG with proper cursor
    return shuffle(tiles, minesSeedData);
  }

  private calculateMultiplier(gridSize: number, minesCount: number, safeTilesRevealed: number): number {
    if (safeTilesRevealed === 0) return 1;

    const safeTiles = gridSize - minesCount;
    let multiplier = 1;

    for (let i = 0; i < safeTilesRevealed; i++) {
      const remainingSafe = safeTiles - i;
      const remainingTotal = gridSize - i;
      const probability = remainingSafe / remainingTotal;
      
      // Apply house edge
      const adjustedProbability = probability * (1 - this.config.houseEdge / 100);
      multiplier *= (1 / adjustedProbability);
    }

    return parseFloat(multiplier.toFixed(4));
  }

  /**
   * Check jackpot conditions
   */
  checkJackpot(result: MinesResult): boolean {
    // Random chance on each tile reveal
    const randomChance = Math.random() < 0.0001; // 0.01%
    
    if (randomChance) return true;

    // Hit mine on first tile (bad luck jackpot)
    if (result.revealedTiles.length === 1 && result.hitMine) {
      return Math.random() < 0.001; // 0.1%
    }

    return false;
  }
}
