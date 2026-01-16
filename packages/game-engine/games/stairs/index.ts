import { BaseGame, BetInput, BetResult } from '../../base-game';
import { shuffle } from '@casino/fairness';

export interface StairsParams {
  steps: 8 | 10 | 12 | 15;
  revealedTiles?: number[];
}

export interface StairsResult {
  grid: boolean[];
  revealedTiles: number[];
  hitDanger: boolean;
  currentMultiplier: number;
}

export class StairsGame extends BaseGame {
  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const params = input.gameParams as StairsParams;
    const { steps, revealedTiles = [] } = params;

    const grid = this.generateGrid(steps, input.seedData);
    const hitDanger = revealedTiles.some(tile => grid[tile]);
    const safeStepsCleared = revealedTiles.filter(t => !grid[t]).length;
    const multiplier = this.calculateMultiplier(steps, safeStepsCleared);

    const won = !hitDanger && safeStepsCleared > 0;
    const finalMultiplier = won ? multiplier : 0;

    const payout = this.calculatePayout(input.amount, finalMultiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: StairsResult = {
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

  private generateGrid(steps: number, seedData: any): boolean[] {
    // Use proper cursor for Stairs (similar to Mines)
    const stairsSeedData = { ...seedData, cursor: 3 };
    const totalTiles = steps * 2;
    const tiles = Array(totalTiles).fill(false);
    
    for (let step = 0; step < steps; step++) {
      const dangerPosition = shuffle([0, 1], { ...stairsSeedData, nonce: stairsSeedData.nonce + step })[0];
      tiles[step * 2 + dangerPosition] = true;
    }
    
    return tiles;
  }

  private calculateMultiplier(steps: number, safeStepsCleared: number): number {
    if (safeStepsCleared === 0) return 1;

    let multiplier = 1;
    for (let i = 0; i < safeStepsCleared; i++) {
      multiplier *= 1.4;
    }

    return parseFloat((multiplier * 0.99).toFixed(4));
  }
}
