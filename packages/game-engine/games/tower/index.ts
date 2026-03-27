import { BaseGame, BetInput, BetResult } from '../../base-game';
import { shuffle } from '@casino/fairness';

export type TowerDifficulty = 'easy' | 'medium' | 'hard' | 'extreme' | 'nightmare';

export interface TowerDifficultyConfig {
  tilesPerFloor: number;
  dangersPerFloor: number;
  safePerFloor: number;
  floors: number;
  probability: number; // chance of picking safe tile per floor
}

export const TOWER_CONFIG: Record<TowerDifficulty, TowerDifficultyConfig> = {
  easy: { tilesPerFloor: 4, dangersPerFloor: 1, safePerFloor: 3, floors: 9, probability: 3 / 4 },
  medium: { tilesPerFloor: 3, dangersPerFloor: 1, safePerFloor: 2, floors: 9, probability: 2 / 3 },
  hard: { tilesPerFloor: 2, dangersPerFloor: 1, safePerFloor: 1, floors: 9, probability: 1 / 2 },
  extreme: { tilesPerFloor: 3, dangersPerFloor: 2, safePerFloor: 1, floors: 9, probability: 1 / 3 },
  nightmare: { tilesPerFloor: 4, dangersPerFloor: 3, safePerFloor: 1, floors: 9, probability: 1 / 4 },
};

export interface TowerParams {
  difficulty: TowerDifficulty;
  revealedTiles?: number[];
}

export interface TowerResult {
  grid: boolean[];
  revealedTiles: number[];
  hitDanger: boolean;
  currentMultiplier: number;
  difficulty: TowerDifficulty;
  tilesPerFloor: number;
  dangersPerFloor: number;
  floors: number;
}

export class TowerGame extends BaseGame {
  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);

    const params = input.gameParams as TowerParams;
    const { difficulty, revealedTiles = [] } = params;

    const config = TOWER_CONFIG[difficulty];
    if (!config) throw new Error(`Invalid difficulty: ${difficulty}`);

    const grid = this.generateGrid(config, input.seedData);
    const hitDanger = revealedTiles.some(tile => grid[tile]);

    // Each revealed safe tile = one floor cleared (player picks one tile per floor)
    const safeFloorsCleared = revealedTiles.filter(t => !grid[t]).length;
    const multiplier = this.calculateMultiplier(config, safeFloorsCleared);

    const won = !hitDanger && safeFloorsCleared > 0;
    const finalMultiplier = won ? multiplier : 0;

    const payout = this.calculatePayout(input.amount, finalMultiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: TowerResult = {
      grid,
      revealedTiles,
      hitDanger,
      currentMultiplier: multiplier,
      difficulty,
      tilesPerFloor: config.tilesPerFloor,
      dangersPerFloor: config.dangersPerFloor,
      floors: config.floors,
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

  generateGrid(config: TowerDifficultyConfig, seedData: any): boolean[] {
    const { tilesPerFloor, dangersPerFloor, floors } = config;
    const towerSeedData = { ...seedData, cursor: 3 };
    const totalTiles = floors * tilesPerFloor;
    const tiles = Array(totalTiles).fill(false);

    for (let floor = 0; floor < floors; floor++) {
      // Create per-floor positions array [0, 1, 2, ...] 
      const positions = Array.from({ length: tilesPerFloor }, (_, i) => i);
      const shuffled = shuffle(positions, { ...towerSeedData, nonce: towerSeedData.nonce + floor });

      // First N positions in shuffled result are danger
      for (let d = 0; d < dangersPerFloor; d++) {
        tiles[floor * tilesPerFloor + shuffled[d]] = true;
      }
    }

    return tiles;
  }

  calculateMultiplier(config: TowerDifficultyConfig, safeFloorsCleared: number): number {
    if (safeFloorsCleared === 0) return 1;

    const { probability } = config;
    // Multiplier based on inverse probability: (1/p)^n
    let multiplier = Math.pow(1 / probability, safeFloorsCleared);

    // Apply house edge (e.g. 1% house edge → multiply by 0.99)
    multiplier *= (1 - this.config.houseEdge / 100);

    return parseFloat(multiplier.toFixed(4));
  }

  /**
   * Get the multiplier table for a given difficulty (for frontend display)
   */
  static getMultiplierTable(difficulty: TowerDifficulty, houseEdge: number = 1): number[] {
    const config = TOWER_CONFIG[difficulty];
    const houseEdgeMultiplier = 1 - houseEdge / 100; // e.g. 1% → 0.99
    const table: number[] = [];
    for (let i = 1; i <= config.floors; i++) {
      const raw = Math.pow(1 / config.probability, i);
      const adjusted = raw * houseEdgeMultiplier;
      table.push(parseFloat(adjusted.toFixed(4)));
    }
    return table;
  }
}
