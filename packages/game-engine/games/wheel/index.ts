import { BaseGame, BetInput, BetResult } from '../../base-game';
import { generateInt } from '@casino/fairness';

export type WheelRisk = 'low' | 'medium' | 'high';

export interface WheelParams {
  risk: WheelRisk;
  segments: 10 | 20 | 30 | 40 | 50;
}

export interface WheelResult {
  segment: number;
  multiplier: number;
  color: string;
}

/**
 * Wheel Game (Spin Design)
 * Spin wheel with different risk levels and segment counts
 */
export class WheelGame extends BaseGame {
  private segmentMultipliers: Record<WheelRisk, Record<number, number[]>> = {
    low: {
      10: [1.5, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.5],
      20: [1.5, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.5, 1.5, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.5],
      30: Array(30).fill(1.2).map((v, i) => (i % 10 === 0 ? 1.5 : v)),
      40: Array(40).fill(1.2).map((v, i) => (i % 10 === 0 ? 1.5 : v)),
      50: Array(50).fill(1.2).map((v, i) => (i % 10 === 0 ? 1.5 : v)),
    },
    medium: {
      10: [3, 1.5, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.5, 3],
      20: [5, 2, 1.5, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.5, 2, 5, 2, 1.5, 1.2, 1.2, 1.2, 1.2, 1.5, 2],
      30: Array(30).fill(1.2).map((v, i) => {
        if (i % 15 === 0) return 5;
        if (i % 5 === 0) return 2;
        return v;
      }),
      40: Array(40).fill(1.2).map((v, i) => {
        if (i % 20 === 0) return 5;
        if (i % 5 === 0) return 2;
        return v;
      }),
      50: Array(50).fill(1.2).map((v, i) => {
        if (i % 25 === 0) return 5;
        if (i % 5 === 0) return 2;
        return v;
      }),
    },
    high: {
      10: [10, 2, 1.5, 1.2, 1.2, 1.2, 1.2, 1.5, 2, 10],
      20: [20, 5, 2, 1.5, 1.2, 1.2, 1.2, 1.2, 1.5, 2, 5, 20, 5, 2, 1.5, 1.2, 1.2, 1.2, 1.5, 2],
      30: Array(30).fill(1.2).map((v, i) => {
        if (i % 15 === 0) return 20;
        if (i % 5 === 0) return 5;
        if (i % 3 === 0) return 2;
        return v;
      }),
      40: Array(40).fill(1.2).map((v, i) => {
        if (i % 20 === 0) return 20;
        if (i % 5 === 0) return 5;
        if (i % 3 === 0) return 2;
        return v;
      }),
      50: Array(50).fill(1.2).map((v, i) => {
        if (i % 25 === 0) return 20;
        if (i % 5 === 0) return 5;
        if (i % 3 === 0) return 2;
        return v;
      }),
    },
  };

  private colors = ['#FF0DB7', '#FFC100', '#73FFD7', '#9D73FF'];

  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const params = input.gameParams as WheelParams;
    const { risk, segments } = params;

    // Generate winning segment
    const segment = generateInt(input.seedData, 0, segments - 1);

    // Get multiplier for segment
    const multipliers = this.segmentMultipliers[risk][segments];
    const multiplier = multipliers[segment];

    // Assign color
    const color = this.colors[segment % this.colors.length];

    // Apply house edge to multiplier
    const finalMultiplier = multiplier * (1 - this.config.houseEdge / 100);
    
    const won = finalMultiplier >= 1;
    const payout = this.calculatePayout(input.amount, finalMultiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: WheelResult = {
      segment,
      multiplier,
      color,
    };

    return {
      multiplier: finalMultiplier,
      payout,
      profit,
      won,
      gameData: params,
      result: {
        ...result,
        multiplier: finalMultiplier,
      },
    };
  }

  /**
   * Check jackpot conditions
   */
  checkJackpot(result: WheelResult, history: WheelResult[]): boolean {
    // Same segment 3 times in a row
    const sameSegmentStreak = history.filter(h => h.segment === result.segment).length;
    if (sameSegmentStreak >= 3) return true;

    // Same color 5 times in a row
    const sameColorStreak = history.filter(h => h.color === result.color).length;
    if (sameColorStreak >= 5) return true;

    return false;
  }
}
