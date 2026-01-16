import { BaseGame, BetInput, BetResult } from '../../base-game';
import { shuffle } from '@casino/fairness';

export type KenoRisk = 'low' | 'medium' | 'high';

export interface KenoParams {
  selectedNumbers: number[]; // 1-40
  risk: KenoRisk;
}

export interface KenoResult {
  drawnNumbers: number[];
  matchedNumbers: number[];
  matchCount: number;
  multiplier: number;
}

/**
 * Keno Game
 * Select numbers, 10 are drawn, win based on matches
 */
export class KenoGame extends BaseGame {
  private multiplierTables: Record<KenoRisk, Record<number, number[]>> = {
    low: {
      1: [0, 3.6],
      2: [0, 1, 4.2],
      3: [0, 1, 2, 5],
      4: [0, 0.5, 2, 6, 12],
      5: [0, 0.5, 1, 3, 10, 25],
      6: [0, 0.5, 1, 2, 4, 15, 50],
      7: [0, 0.5, 1, 1.5, 3, 7, 25, 100],
      8: [0, 0.5, 0.5, 1, 2, 5, 15, 50, 200],
      9: [0, 0.5, 0.5, 1, 2, 4, 10, 30, 100, 500],
      10: [0, 0, 0.5, 1, 2, 3, 7, 20, 50, 200, 1000],
    },
    medium: {
      1: [0, 3.6],
      2: [0, 1, 4.5],
      3: [0, 0.5, 2.5, 7],
      4: [0, 0.5, 1.5, 8, 20],
      5: [0, 0, 1, 4, 15, 50],
      6: [0, 0, 0.5, 2, 7, 30, 100],
      7: [0, 0, 0.5, 1.5, 4, 12, 50, 250],
      8: [0, 0, 0, 1, 3, 8, 30, 100, 500],
      9: [0, 0, 0, 0.5, 2, 5, 20, 60, 250, 1000],
      10: [0, 0, 0, 0.5, 1.5, 4, 12, 40, 150, 500, 2500],
    },
    high: {
      1: [0, 3.6],
      2: [0, 0.5, 5],
      3: [0, 0, 3, 10],
      4: [0, 0, 1, 10, 35],
      5: [0, 0, 0.5, 5, 25, 100],
      6: [0, 0, 0, 2, 12, 60, 250],
      7: [0, 0, 0, 1, 6, 25, 100, 500],
      8: [0, 0, 0, 0.5, 3, 15, 60, 250, 1000],
      9: [0, 0, 0, 0, 2, 8, 35, 150, 500, 2500],
      10: [0, 0, 0, 0, 1, 5, 20, 80, 300, 1000, 5000],
    },
  };

  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const params = input.gameParams as KenoParams;
    const { selectedNumbers, risk } = params;

    // Validate selection
    if (selectedNumbers.length < 1 || selectedNumbers.length > 10) {
      throw new Error('Must select 1-10 numbers');
    }

    if (selectedNumbers.some(n => n < 1 || n > 40)) {
      throw new Error('Numbers must be between 1-40');
    }

    // Generate 10 drawn numbers from 1-40 using proper cursor
    const kenoSeedData = { ...input.seedData, cursor: 2 };
    const allNumbers = Array.from({ length: 40 }, (_, i) => i + 1);
    const shuffled = shuffle(allNumbers, kenoSeedData);
    const drawnNumbers = shuffled.slice(0, 10).sort((a, b) => a - b);

    // Find matches
    const matchedNumbers = selectedNumbers.filter(n => drawnNumbers.includes(n));
    const matchCount = matchedNumbers.length;

    // Get multiplier and apply house edge
    const multiplierTable = this.multiplierTables[risk][selectedNumbers.length];
    const baseMultiplier = multiplierTable[matchCount] || 0;
    const finalMultiplier = baseMultiplier * (1 - this.config.houseEdge / 100);

    const won = finalMultiplier >= 1;
    const payout = this.calculatePayout(input.amount, finalMultiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: KenoResult = {
      drawnNumbers,
      matchedNumbers,
      matchCount,
      multiplier: finalMultiplier,
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

  /**
   * Auto pick random numbers (provably fair)
   * Fills up to 10 total numbers, adding to existing selection
   */
  static autoPick(currentSelection: number[], seedData: any): number[] {
    const maxNumbers = 10;
    const needed = maxNumbers - currentSelection.length;
    
    if (needed <= 0) {
      // If already at max, replace all with new random selection
      const allNumbers = Array.from({ length: 40 }, (_, i) => i + 1);
      const kenoSeedData = { ...seedData, cursor: 2 };
      const shuffled = shuffle(allNumbers, kenoSeedData);
      return shuffled.slice(0, maxNumbers).sort((a, b) => a - b);
    }
    
    // Get available numbers (not already selected)
    const available = Array.from({ length: 40 }, (_, i) => i + 1)
      .filter(n => !currentSelection.includes(n));
    
    const kenoSeedData = { ...seedData, cursor: 2 };
    const shuffled = shuffle(available, kenoSeedData);
    const newPicks = shuffled.slice(0, needed);
    
    return [...currentSelection, ...newPicks].sort((a, b) => a - b);
  }

  /**
   * Check jackpot conditions
   */
  checkJackpot(result: KenoResult, wasAutoPick: boolean): boolean {
    // Hit all 10 numbers
    if (result.matchCount === 10) return true;

    // Auto pick wins with 8+ matches
    if (wasAutoPick && result.matchCount >= 8) return true;

    return false;
  }
}
