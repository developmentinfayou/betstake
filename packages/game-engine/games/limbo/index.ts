import { BaseGame, BetInput, BetResult } from '../../base-game';
import { generateFloat, applyHouseEdge } from '@casino/fairness';

export interface LimboParams {
  targetMultiplier: number;
}

export interface LimboResult {
  result: number;
  target: number;
  won: boolean;
}

/**
 * Limbo Game
 * Predict if result will be above target multiplier
 */
export class LimboGame extends BaseGame {
  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const params = input.gameParams as LimboParams;
    const { targetMultiplier } = params;

    // Generate result using exponential distribution (Stake formula)
    const float = generateFloat(input.seedData);
    
    // Stake's Limbo formula: (1e8 / (float * 1e8)) * houseEdge
    // Simplified: (1 / float) * houseEdge
    const houseEdge = 1 - (this.config.houseEdge / 100); // 0.99 for 1% house edge
    const floatPoint = (1 / float) * houseEdge;
    
    // Round down to 2 decimals
    const crashPoint = Math.floor(floatPoint * 100) / 100;
    
    // Consolidate all crash points below 1 to 1.00
    const finalResult = Math.max(crashPoint, 1.00);

    const won = finalResult >= targetMultiplier;
    const multiplier = won ? targetMultiplier * houseEdge : 0;

    const payout = this.calculatePayout(input.amount, multiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const limboResult: LimboResult = {
      result: finalResult,
      target: targetMultiplier,
      won,
    };

    return {
      multiplier,
      payout,
      profit,
      won,
      gameData: params,
      result: limboResult,
    };
  }

  /**
   * Check jackpot conditions for limbo
   */
  checkJackpot(result: LimboResult, streak: number): boolean {
    // Hit exactly 7.77x or 77.77x
    if (result.result === 7.77 || result.result === 77.77) {
      return true;
    }

    // Win/lose streak
    if (streak >= 10) {
      return true;
    }

    return false;
  }
}
