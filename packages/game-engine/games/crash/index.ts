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

  /**
   * Determine trenball result from crash point
   * Based on BC.GAME payout structure:
   * - crash: ~50% (payout 49.99x) - When multiplier < 2x
   * - red: ~24% (payout 1.96x)
   * - green: ~24% (payout 2x) 
   * - moon: ~2% (payout 10x) - When multiplier >= 10x
   */
  static getTrenballResult(crashPoint: number): {
    type: 'crash' | 'red' | 'green' | 'moon';
    multiplier: number;
  } {
    // Moon: crash point >= 10x
    if (crashPoint >= 10) {
      return { type: 'moon', multiplier: 10 };
    }

    // Crash: crash point < 2x (crashed before reaching 2x)
    if (crashPoint < 2) {
      return { type: 'crash', multiplier: 49.99 };
    }

    // Green vs Red: determined by crash point decimals
    // Use the second decimal to alternate between red/green
    const decimalPart = Math.floor(crashPoint * 100) % 10;
    const isGreen = decimalPart % 2 === 0;

    return isGreen
      ? { type: 'green', multiplier: 2 }
      : { type: 'red', multiplier: 1.96 };
  }
}
