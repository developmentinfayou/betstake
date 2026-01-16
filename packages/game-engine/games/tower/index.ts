import { BaseGame, BetInput, BetResult } from '../../base-game';
import { shuffle } from '@casino/fairness';

export interface TowerParams {
  floors: 8 | 10 | 12 | 15;
  revealedTiles?: number[];
}

export interface TowerResult {
  grid: boolean[];
  revealedTiles: number[];
  hitDanger: boolean;
  currentMultiplier: number;
}

export class TowerGame extends BaseGame {
  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const params = input.gameParams as TowerParams;
    const { floors, revealedTiles = [] } = params;

    const grid = this.generateGrid(floors, input.seedData);
    const hitDanger = revealedTiles.some(tile => grid[tile]);
    const safeFloorsCleared = Math.floor(revealedTiles.filter(t => !grid[t]).length / 3);
    const multiplier = this.calculateMultiplier(floors, safeFloorsCleared);

    const won = !hitDanger && safeFloorsCleared > 0;
    const finalMultiplier = won ? multiplier : 0;

    const payout = this.calculatePayout(input.amount, finalMultiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: TowerResult = {
      grid,
      revealedTiles,
      hitDanger,
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

  private generateGrid(floors: number, seedData: any): boolean[] {
    // Use proper cursor for Tower (similar to Mines)
    const towerSeedData = { ...seedData, cursor: 3 };
    const totalTiles = floors * 3;
    const tiles = Array(totalTiles).fill(false);
    
    for (let floor = 0; floor < floors; floor++) {
      const dangerPositions = shuffle([0, 1, 2], { ...towerSeedData, nonce: towerSeedData.nonce + floor });
      tiles[floor * 3 + dangerPositions[0]] = true;
      tiles[floor * 3 + dangerPositions[1]] = true;
    }
    
    return tiles;
  }

  private calculateMultiplier(floors: number, safeFloorsCleared: number): number {
    if (safeFloorsCleared === 0) return 1;

    let multiplier = 1;
    for (let i = 0; i < safeFloorsCleared; i++) {
      multiplier *= 1.5;
    }

    return parseFloat((multiplier * 0.99).toFixed(4));
  }
}
