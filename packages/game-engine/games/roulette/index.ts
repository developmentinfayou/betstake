import { BaseGame, BetInput, BetResult } from '../../base-game';
import { generateInt } from '@casino/fairness';

export type RouletteColor = 'red' | 'black' | 'green';
export type RouletteBetType = 
  | 'straight' | 'split' | 'street' | 'corner' | 'line'
  | 'dozen' | 'column' | 'red' | 'black' | 'even' | 'odd'
  | 'low' | 'high' | 'zero' | 'neighbors' | 'orphans' | 'thirds';

export interface RouletteBet {
  type: RouletteBetType;
  numbers: number[];
  amount: number;
}

export interface RouletteParams {
  bets: RouletteBet[];
}

export interface RouletteResult {
  number: number;
  color: RouletteColor;
  winningBets: RouletteBet[];
  totalPayout: number;
}

/**
 * Roulette Game (European - single zero)
 */
export class RouletteGame extends BaseGame {
  private redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  private blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

  play(input: BetInput): BetResult {
    const params = input.gameParams as RouletteParams;
    
    // Validate total bet amount
    const totalBetAmount = params.bets.reduce((sum, bet) => sum + bet.amount, 0);
    this.validateBet(totalBetAmount, input.currency);

    // Generate winning number (0-36)
    const winningNumber = generateInt(input.seedData, 0, 36);
    const color = this.getColor(winningNumber);

    // Calculate winnings for each bet
    let totalPayout = 0;
    const winningBets: RouletteBet[] = [];

    for (const bet of params.bets) {
      if (this.isBetWinner(bet, winningNumber)) {
        const multiplier = this.getBetMultiplier(bet.type);
        const payout = bet.amount * multiplier;
        totalPayout += payout;
        winningBets.push(bet);
      }
    }

    const won = totalPayout > 0;
    const profit = totalPayout - totalBetAmount;
    const overallMultiplier = totalBetAmount > 0 ? totalPayout / totalBetAmount : 0;

    const result: RouletteResult = {
      number: winningNumber,
      color,
      winningBets,
      totalPayout,
    };

    return {
      multiplier: overallMultiplier,
      payout: totalPayout,
      profit,
      won,
      gameData: params,
      result,
    };
  }

  private getColor(number: number): RouletteColor {
    if (number === 0) return 'green';
    if (this.redNumbers.includes(number)) return 'red';
    return 'black';
  }

  private isBetWinner(bet: RouletteBet, winningNumber: number): boolean {
    switch (bet.type) {
      case 'straight':
        return bet.numbers.includes(winningNumber);
      case 'red':
        return this.redNumbers.includes(winningNumber);
      case 'black':
        return this.blackNumbers.includes(winningNumber);
      case 'even':
        return winningNumber !== 0 && winningNumber % 2 === 0;
      case 'odd':
        return winningNumber !== 0 && winningNumber % 2 === 1;
      case 'low':
        return winningNumber >= 1 && winningNumber <= 18;
      case 'high':
        return winningNumber >= 19 && winningNumber <= 36;
      case 'dozen':
        return bet.numbers.includes(winningNumber);
      case 'column':
        return bet.numbers.includes(winningNumber);
      default:
        return bet.numbers.includes(winningNumber);
    }
  }

  private getBetMultiplier(betType: RouletteBetType): number {
    const multipliers: Record<RouletteBetType, number> = {
      straight: 36,
      split: 18,
      street: 12,
      corner: 9,
      line: 6,
      dozen: 3,
      column: 3,
      red: 2,
      black: 2,
      even: 2,
      odd: 2,
      low: 2,
      high: 2,
      zero: 36,
      neighbors: 36,
      orphans: 36,
      thirds: 3,
    };

    return multipliers[betType] || 1;
  }

  /**
   * Preset bet patterns
   */
  static getPresetBets(preset: string): number[] {
    const presets: Record<string, number[]> = {
      neighborsOfZero: [0, 2, 3, 12, 15, 19, 25, 26, 28, 32, 35],
      orphans: [1, 6, 9, 14, 17, 20, 31, 34],
      thirds: [5, 8, 10, 11, 13, 16, 23, 24, 27, 30, 33, 36],
      zeroGame: [0, 3, 12, 15, 26, 32, 35],
    };

    return presets[preset] || [];
  }

  /**
   * Check jackpot conditions
   */
  checkJackpot(result: RouletteResult, history: RouletteResult[]): boolean {
    // Color streak (e.g., 7 reds in a row)
    const colorStreak = this.getColorStreak(history);
    if (colorStreak >= 7) return true;

    // Number streak (same number multiple times)
    const numberStreak = history.filter(h => h.number === result.number).length;
    if (numberStreak >= 3) return true;

    return false;
  }

  private getColorStreak(history: RouletteResult[]): number {
    if (history.length === 0) return 0;
    
    const lastColor = history[history.length - 1].color;
    let streak = 1;

    for (let i = history.length - 2; i >= 0; i--) {
      if (history[i].color === lastColor) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
