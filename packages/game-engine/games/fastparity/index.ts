import { BaseGame, BetInput, BetResult } from '../../base-game';
import { generateInt } from '@casino/fairness';

export type ParityColor = 'green' | 'red' | 'violet';
export type ParityBetType = 'number' | 'color' | 'even' | 'odd';

export interface FastParityParams {
  betType: ParityBetType;
  value: number | ParityColor;
}

export interface FastParityResult {
  number: number;
  color: ParityColor;
  won: boolean;
}

export class FastParityGame extends BaseGame {
  private getColor(num: number): ParityColor {
    // Correct color mapping based on images
    if (num === 0 || num === 5) return 'violet';
    if ([1, 3, 7, 9].includes(num)) return 'green';
    return 'red'; // 2, 4, 6, 8
  }

  private getMultiplier(betType: ParityBetType, color: ParityColor): number {
    switch (betType) {
      case 'number':
        return 9; // 9x for number bets (1/10 chance)
      case 'color':
        if (color === 'violet') {
          return 4.5; // 4.5x for violet (2/10 chance)
        }
        return 2; // 2x for green/red (4/10 chance)
      case 'even':
      case 'odd':
        return 2; // 2x for even/odd (5/10 chance)
      default:
        return 0;
    }
  }

  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);

    const params = input.gameParams as FastParityParams;
    const { betType, value } = params;

    const number = generateInt(input.seedData, 0, 9);
    const color = this.getColor(number);

    let won = false;
    switch (betType) {
      case 'number':
        won = number === value;
        break;
      case 'color':
        won = color === value;
        break;
      case 'even':
        won = number % 2 === 0;
        break;
      case 'odd':
        won = number % 2 === 1;
        break;
    }

    const multiplier = won ? this.getMultiplier(betType, color) : 0;
    const payout = this.calculatePayout(input.amount, multiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: FastParityResult = {
      number,
      color,
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

  checkJackpot(result: FastParityResult, streak: number): boolean {
    // Violet number jackpot (0 or 5)
    if (result.color === 'violet') {
      return true;
    }

    // Win streak jackpot
    if (streak >= 10) {
      return true;
    }

    return false;
  }
}