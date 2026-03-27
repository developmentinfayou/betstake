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
  multiplierTable: number[];
  colorTable: string[];
}

// Color constants for multiplier tiers
const COLORS = {
  ZERO: '#374151',     // gray - loss
  BASE: '#3B82F6',     // blue - 1.18x (low risk base)
  LOW: '#10B981',      // green - 1.48x
  MID_LOW: '#F59E0B',  // yellow/amber - 1.68x
  MID: '#F97316',      // orange - 1.97x
  HIGH: '#8B5CF6',     // purple - 2.96x
  HIGHER: '#EC4899',   // pink - 3.95x+
  JACKPOT: '#EF4444',  // red - jackpot (high risk)
};

/**
 * Get color for a given multiplier value
 */
function getMultiplierColor(multiplier: number): string {
  if (multiplier === 0) return COLORS.ZERO;
  if (multiplier <= 1.18) return COLORS.BASE;
  if (multiplier <= 1.48) return COLORS.LOW;
  if (multiplier <= 1.78) return COLORS.MID_LOW;
  if (multiplier <= 1.97) return COLORS.MID;
  if (multiplier <= 2.96) return COLORS.HIGH;
  if (multiplier <= 4.94) return COLORS.HIGHER;
  return COLORS.JACKPOT;
}

/**
 * Wheel Game (Stake.com Model)
 * Spin wheel with different risk levels and segment counts.
 * House edge is baked into the multiplier values (~2-2.6%).
 * 0x segments = full loss. Multiplier is paid in full on win.
 */
export class WheelGame extends BaseGame {
  /**
   * Stake.com-accurate multiplier tables.
   * 
   * Low Risk:  20% zero, 10% 1.48x, 70% 1.18x  (EV ≈ 0.974)
   * Medium:    50% zero, tiered multipliers       (EV ≈ 0.976)
   * High:      (N-1) zero, 1 jackpot = N×0.98     (EV = 0.98)
   */
  private segmentMultipliers: Record<WheelRisk, Record<number, number[]>> = {
    low: {
      // 20% zero, 10% 1.48x, 70% 1.18x
      10: [
        0, 1.18, 1.18, 1.48, 1.18, 1.18, 0, 1.18, 1.18, 1.18,
      ],
      20: [
        0, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 0, 1.18, 1.18,
        1.18, 1.18, 1.48, 1.18, 0, 1.18, 1.18, 1.18, 0, 1.18,
      ],
      30: [
        0, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0,
        1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18,
        1.18, 1.48, 1.18, 1.18, 1.18, 0, 1.18, 1.18, 0, 1.18,
      ],
      40: [
        0, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0,
        1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18,
        1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18, 1.18,
        1.18, 1.48, 1.18, 1.18, 1.18, 1.18, 0, 1.18, 0, 1.18,
      ],
      50: [
        0, 1.18, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18,
        0, 1.18, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18,
        0, 1.18, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18,
        0, 1.18, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 1.18, 1.18,
        0, 1.18, 1.18, 1.18, 1.48, 1.18, 1.18, 0, 1.18, 0,
      ],
    },
    medium: {
      // 50% zero, tiered multipliers (EV ≈ 0.976)
      10: [
        0, 1.97, 0, 1.48, 0, 2.96, 0, 1.97, 0, 1.97,
      ],
      20: [
        0, 1.48, 0, 1.97, 0, 1.97, 0, 2.96, 0, 1.97,
        0, 1.48, 0, 1.97, 0, 1.78, 0, 1.97, 0, 1.97,
      ],
      30: [
        0, 1.48, 0, 1.97, 0, 1.48, 0, 1.97, 0, 2.96,
        0, 1.48, 0, 1.97, 0, 1.68, 0, 1.48, 0, 1.97,
        0, 3.95, 0, 1.48, 0, 1.97, 0, 1.48, 0, 1.97,
      ],
      40: [
        0, 1.48, 0, 1.97, 0, 1.48, 0, 1.97, 0, 1.48,
        0, 2.96, 0, 1.48, 0, 1.97, 0, 1.68, 0, 1.97,
        0, 1.48, 0, 1.97, 0, 1.48, 0, 1.97, 0, 1.48,
        0, 3.95, 0, 1.48, 0, 1.97, 0, 1.68, 0, 1.97,
      ],
      50: [
        0, 1.48, 0, 1.97, 0, 1.48, 0, 1.97, 0, 1.48,
        0, 2.96, 0, 1.48, 0, 1.97, 0, 1.68, 0, 1.97,
        0, 1.48, 0, 1.97, 0, 4.94, 0, 1.48, 0, 1.97,
        0, 1.48, 0, 1.97, 0, 2.96, 0, 1.48, 0, 1.97,
        0, 1.68, 0, 1.48, 0, 1.97, 0, 1.68, 0, 1.48,
      ],
    },
    high: {
      // (N-1) zero, 1 jackpot = N × 0.98 (EV = 0.98)
      10: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 9.80,
      ],
      20: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 19.60,
      ],
      30: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 29.40,
      ],
      40: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 39.20,
      ],
      50: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 49.00,
      ],
    },
  };

  /**
   * Get multiplier table for a given risk and segment count.
   * Exported so frontend can display badges.
   */
  static getMultiplierTable(risk: WheelRisk, segments: number): number[] {
    const game = new WheelGame({
      houseEdge: 1,
      minBet: {},
      maxBet: {},
      maxWin: {},
    });
    return game.segmentMultipliers[risk]?.[segments] || [];
  }

  /**
   * Get the color table for a given risk and segment count.
   */
  static getColorTable(risk: WheelRisk, segments: number): string[] {
    const multipliers = WheelGame.getMultiplierTable(risk, segments);
    return multipliers.map(m => getMultiplierColor(m));
  }

  /**
   * Get unique multipliers with counts and colors (for badge display).
   */
  static getMultiplierBadges(risk: WheelRisk, segments: number): Array<{
    multiplier: number;
    count: number;
    color: string;
  }> {
    const multipliers = WheelGame.getMultiplierTable(risk, segments);
    const map = new Map<number, number>();

    for (const m of multipliers) {
      map.set(m, (map.get(m) || 0) + 1);
    }

    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([multiplier, count]) => ({
        multiplier,
        count,
        color: getMultiplierColor(multiplier),
      }));
  }

  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);

    const params = input.gameParams as WheelParams;
    const { risk, segments } = params;

    // Generate winning segment (provably fair)
    const segment = generateInt(input.seedData, 0, segments - 1);

    // Get multiplier for segment
    const multipliers = this.segmentMultipliers[risk][segments];
    const multiplier = multipliers[segment];

    // Color for the winning segment
    const color = getMultiplierColor(multiplier);

    // Full multiplier tables for frontend rendering
    const colorTable = multipliers.map(m => getMultiplierColor(m));

    // House edge is already baked into the multiplier values
    const finalMultiplier = multiplier;

    const won = finalMultiplier > 0;
    const payout = this.calculatePayout(input.amount, finalMultiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: WheelResult = {
      segment,
      multiplier: finalMultiplier,
      color,
      multiplierTable: multipliers,
      colorTable,
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
