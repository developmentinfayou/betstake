import { BaseGame, BetInput, BetResult } from '../../base-game';
import { generateFloat } from '@casino/fairness';

export type CoinSide = 'heads' | 'tails';
export type CoinFlipMode = 'normal' | 'series';

export interface CoinFlipParams {
  choice: CoinSide;
  mode: CoinFlipMode;
  seriesCount?: number;
}

export interface CoinFlipResult {
  result: CoinSide;
  won: boolean;
  seriesResults?: CoinSide[];
  seriesWins?: number;
}

export class CoinFlipGame extends BaseGame {
  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const params = input.gameParams as CoinFlipParams;
    const { choice, mode, seriesCount = 1 } = params;

    if (mode === 'series') {
      return this.playSeries(input, choice, seriesCount);
    }

    const float = generateFloat(input.seedData);
    const result: CoinSide = float < 0.5 ? 'heads' : 'tails';
    const won = result === choice;

    const multiplier = won ? 1.98 : 0; // 2x with 1% house edge
    const payout = this.calculatePayout(input.amount, multiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const gameResult: CoinFlipResult = {
      result,
      won,
    };

    return {
      multiplier,
      payout,
      profit,
      won,
      gameData: params,
      result: gameResult,
    };
  }

  private playSeries(input: BetInput, choice: CoinSide, count: number): BetResult {
    const results: CoinSide[] = [];
    let wins = 0;

    for (let i = 0; i < count; i++) {
      const float = generateFloat({ ...input.seedData, nonce: input.seedData.nonce + i });
      const result: CoinSide = float < 0.5 ? 'heads' : 'tails';
      results.push(result);
      if (result === choice) wins++;
    }

    const winRate = wins / count;
    const multiplier = winRate * 1.98 * count;
    const won = wins > count / 2;

    const payout = this.calculatePayout(input.amount, multiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const gameResult: CoinFlipResult = {
      result: results[results.length - 1],
      won,
      seriesResults: results,
      seriesWins: wins,
    };

    return {
      multiplier,
      payout,
      profit,
      won,
      gameData: input.gameParams,
      result: gameResult,
    };
  }
}
