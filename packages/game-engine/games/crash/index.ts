import { generateFloat } from '@casino/fairness';

export interface CrashRoundData {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

/**
 * Crash Game (Multiplayer)
 * Multiplier increases until crash point
 */
export class CrashGame {
  /**
   * Generate crash point for round
   */
  static generateCrashPoint(roundData: CrashRoundData): number {
    const float = generateFloat({
      serverSeed: roundData.serverSeed,
      clientSeed: roundData.clientSeed,
      nonce: roundData.nonce,
    });

    // Crash uses: 99 / (100 * float) with house edge
    const houseEdge = 0.01; // 1%
    const crashPoint = (99 * (1 - houseEdge)) / (100 * float);

    // Cap at 10,000x
    return Math.min(parseFloat(crashPoint.toFixed(2)), 10000);
  }

  /**
   * Calculate multiplier at given time
   */
  static getMultiplierAtTime(elapsedMs: number): number {
    // Exponential growth: 1.0x at 0ms, grows over time
    const growthRate = 0.00006; // Adjust for desired speed
    const multiplier = Math.pow(Math.E, growthRate * elapsedMs);
    return parseFloat(multiplier.toFixed(2));
  }

  /**
   * Check if crashed at current multiplier
   */
  static hasCrashed(currentMultiplier: number, crashPoint: number): boolean {
    return currentMultiplier >= crashPoint;
  }

  /**
   * Calculate payout for cashout
   */
  static calculatePayout(betAmount: number, cashoutMultiplier: number): number {
    return betAmount * cashoutMultiplier;
  }

  /**
   * Check jackpot conditions
   */
  static checkJackpot(crashPoint: number, cashoutMultiplier?: number): boolean {
    // Crash at exactly 7.77x or 77.77x
    if (crashPoint === 7.77 || crashPoint === 77.77) {
      return true;
    }

    // Cashout closest to 7.77x
    if (cashoutMultiplier && Math.abs(cashoutMultiplier - 7.77) < 0.01) {
      return true;
    }

    return false;
  }
}
