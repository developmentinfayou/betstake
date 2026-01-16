import { BaseGame, BetInput, BetResult } from '../../base-game';
import { generateFloat, applyHouseEdge } from '@casino/fairness';

export interface DiceParams {
  mode?: 'classic' | 'ultimate';
  target?: number;
  isOver?: boolean;
  rangeStart?: number;
  rangeEnd?: number;
  rollInside?: boolean;
}

export interface DiceResult {
  roll: number;
  won: boolean;
  target?: number;
  isOver?: boolean;
  rangeStart?: number;
  rangeEnd?: number;
  rollInside?: boolean;
}

/**
 * Dice Game
 * Roll a number between 0-100, bet over or under target
 */
export class DiceGame extends BaseGame {
  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const params = input.gameParams as DiceParams;
    const mode = params.mode || 'classic';

    const float = generateFloat(input.seedData);
    const roll = Math.floor(float * 10001) / 100;

    let won: boolean;
    let winChance: number;

    if (mode === 'ultimate') {
      const { rangeStart = 25, rangeEnd = 75, rollInside = true } = params;
      const inRange = roll >= rangeStart && roll <= rangeEnd;
      won = rollInside ? inRange : !inRange;
      winChance = rollInside ? (rangeEnd - rangeStart) : (100 - (rangeEnd - rangeStart));
    } else {
      const { target = 50, isOver = true } = params;
      won = isOver ? roll > target : roll < target;
      winChance = isOver ? (100 - target) : target;
    }

    const baseMultiplier = 99 / winChance;
    const multiplier = won ? baseMultiplier * (1 - this.config.houseEdge / 100) : 0;

    const payout = this.calculatePayout(input.amount, multiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: DiceResult = {
      roll,
      won,
      ...(mode === 'classic' ? { target: params.target, isOver: params.isOver } : {}),
      ...(mode === 'ultimate' ? { rangeStart: params.rangeStart, rangeEnd: params.rangeEnd, rollInside: params.rollInside } : {}),
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

  /**
   * Check jackpot conditions for dice
   */
  checkJackpot(result: DiceResult, streak: number): boolean {
    // Roll exactly 77.77 or 7.77
    if (result.roll === 77.77 || result.roll === 7.77) {
      return true;
    }

    // Win/lose streak conditions
    if (streak >= 10) {
      return true;
    }

    return false;
  }
}
