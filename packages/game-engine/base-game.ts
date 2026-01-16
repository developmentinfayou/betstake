import { SeedData } from '@casino/fairness';

/**
 * Base interface for all casino games
 */
export interface GameConfig {
  houseEdge: number;
  minBet: Record<string, number>;
  maxBet: Record<string, number>;
  maxWin: Record<string, number>;
}

export interface BetInput {
  amount: number;
  currency: string;
  seedData: SeedData;
  gameParams: any;
}

export interface BetResult {
  multiplier: number;
  payout: number;
  profit: number;
  won: boolean;
  gameData: any;
  result: any;
}

export abstract class BaseGame {
  protected config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  abstract play(input: BetInput): BetResult;

  protected calculatePayout(amount: number, multiplier: number): number {
    return amount * multiplier;
  }

  protected calculateProfit(amount: number, payout: number): number {
    return payout - amount;
  }

  validateBet(amount: number, currency: string): void {
    const minBet = this.config.minBet[currency] || 0;
    const maxBet = this.config.maxBet[currency] || Infinity;

    if (amount < minBet) {
      throw new Error(`Bet amount below minimum: ${minBet} ${currency}`);
    }

    if (amount > maxBet) {
      throw new Error(`Bet amount exceeds maximum: ${maxBet} ${currency}`);
    }
  }
}
