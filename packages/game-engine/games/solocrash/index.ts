import { BaseGame, BetInput, BetResult } from '../../base-game';
import { generateFloat } from '@casino/fairness';

export type SoloCrashMode = 'quick' | 'custom';

export interface SoloCrashParams {
  mode: SoloCrashMode;
  targetMultiplier?: number;
}

export interface SoloCrashResult {
  crashPoint: number;
  targetMultiplier?: number;
  won: boolean;
}

export class SoloCrashGame extends BaseGame {
  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const params = input.gameParams as SoloCrashParams;
    const { mode, targetMultiplier = 2.0 } = params;

    const float = generateFloat(input.seedData);
    const houseEdge = 0.01;
    const crashPoint = Math.max(1.01, (99 * (1 - houseEdge)) / (100 * float));
    const finalCrashPoint = Math.min(parseFloat(crashPoint.toFixed(2)), 10000);

    let won = false;
    let multiplier = 0;

    if (mode === 'quick') {
      won = finalCrashPoint >= 2.0;
      multiplier = won ? 2.0 * 0.99 : 0;
    } else {
      won = finalCrashPoint >= targetMultiplier;
      multiplier = won ? targetMultiplier * 0.99 : 0;
    }

    const payout = this.calculatePayout(input.amount, multiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: SoloCrashResult = {
      crashPoint: finalCrashPoint,
      targetMultiplier: mode === 'custom' ? targetMultiplier : undefined,
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
}
