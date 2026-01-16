import { BaseGame, BetInput, BetResult } from '../../base-game';
import { generateFloat } from '@casino/fairness';

export type BalloonDifficulty = 'simple' | 'easy' | 'medium' | 'hard' | 'expert';
export type BalloonPumpMode = 'random' | 'specific' | 'custom';

export interface BalloonParams {
  difficulty: BalloonDifficulty;
  pumpMode: BalloonPumpMode;
  targetMultiplier?: number;
  targetPumps?: number;
}

export interface BalloonResult {
  pumps: number;
  burstAt: number;
  multiplier: number;
  won: boolean;
}

export class BalloonGame extends BaseGame {
  private difficultySettings: Record<BalloonDifficulty, { maxPumps: number; baseMultiplier: number }> = {
    simple: { maxPumps: 10, baseMultiplier: 0.1 },
    easy: { maxPumps: 20, baseMultiplier: 0.08 },
    medium: { maxPumps: 50, baseMultiplier: 0.05 },
    hard: { maxPumps: 100, baseMultiplier: 0.03 },
    expert: { maxPumps: 200, baseMultiplier: 0.02 },
  };

  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const params = input.gameParams as BalloonParams;
    const { difficulty, pumpMode, targetMultiplier = 1.5, targetPumps = 1 } = params;

    const settings = this.difficultySettings[difficulty];
    const float = generateFloat(input.seedData);
    
    const burstAt = Math.floor(float * settings.maxPumps) + 1;

    let pumps: number;
    if (pumpMode === 'random') {
      const pumpFloat = generateFloat({ ...input.seedData, nonce: input.seedData.nonce + 1 });
      pumps = Math.floor(pumpFloat * burstAt);
    } else if (pumpMode === 'custom') {
      // Convert multiplier to pumps
      const maxMultiplier = 1 + (settings.maxPumps * settings.baseMultiplier);
      const clampedMultiplier = Math.max(1, Math.min(targetMultiplier, maxMultiplier));
      pumps = Math.floor((clampedMultiplier - 1) / settings.baseMultiplier);
    } else {
      // Specific mode - uses pumps directly
      pumps = Math.min(targetPumps, settings.maxPumps);
    }

    const won = pumps < burstAt;
    const multiplier = won ? 1 + (pumps * settings.baseMultiplier) : 0;

    const payout = this.calculatePayout(input.amount, multiplier * 0.99); // 1% house edge
    const profit = this.calculateProfit(input.amount, payout);

    const result: BalloonResult = {
      pumps,
      burstAt,
      multiplier,
      won,
    };

    return {
      multiplier: won ? multiplier * 0.99 : 0,
      payout,
      profit,
      won,
      gameData: params,
      result,
    };
  }
}
