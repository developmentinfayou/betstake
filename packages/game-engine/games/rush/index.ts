import { BaseGame, BetInput, BetResult } from '../../base-game';
import { generateFloat } from '@casino/fairness';

export type RushDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface RushParams {
  difficulty: RushDifficulty;
  targetMultiplier: number;
}

export interface RushResult {
  crashPoint: number;
  targetMultiplier: number;
  won: boolean;
}

export class RushGame extends BaseGame {
  private difficultyRanges: Record<RushDifficulty, { min: number; max: number }> = {
    easy: { min: 1.5, max: 5 },
    medium: { min: 1.2, max: 10 },
    hard: { min: 1.1, max: 50 },
    expert: { min: 1.01, max: 100 },
  };

  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const params = input.gameParams as RushParams;
    const { difficulty, targetMultiplier } = params;

    const range = this.difficultyRanges[difficulty];
    
    if (targetMultiplier < range.min || targetMultiplier > range.max) {
      throw new Error(`Target multiplier must be between ${range.min}x and ${range.max}x for ${difficulty} difficulty`);
    }

    const float = generateFloat(input.seedData);
    const crashPoint = this.calculateCrashPoint(float, difficulty);

    const won = crashPoint >= targetMultiplier;
    const multiplier = won ? targetMultiplier * 0.99 : 0; // 1% house edge

    const payout = this.calculatePayout(input.amount, multiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: RushResult = {
      crashPoint,
      targetMultiplier,
      won,
    };

    return {
      multiplier,
      payout,
      profit,
      won,
      gameData: params,
      result,
    };
  }

  private calculateCrashPoint(float: number, difficulty: RushDifficulty): number {
    const range = this.difficultyRanges[difficulty];
    
    const e = Math.pow(2, 32);
    const h = Math.floor((1 - float) * e);
    
    let crashPoint = Math.max(1, (0.99 * e) / h);
    
    crashPoint = Math.min(crashPoint, range.max);
    crashPoint = Math.max(crashPoint, range.min);
    
    return parseFloat(crashPoint.toFixed(2));
  }
}
