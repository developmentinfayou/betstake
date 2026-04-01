import { generateFloat } from '@casino/fairness';
import { BaseGame, BetInput, BetResult } from '../../base-game';

export * from './constants';

/**
 * Generates the hidden burst point for a Balloon/Pump session.
 * Uses the same provably fair algorithm as Crash/Rush (1% house edge).
 */
export function generateBurstPoint(seedData: { serverSeed: string; clientSeed: string; nonce: number }): number {
  const float = generateFloat(seedData);

  // Same formula as CrashGame / RushGame (1% house edge)
  const houseEdgeFraction = 0.01;
  const houseEdgeMultiplier = 1 - houseEdgeFraction;
  const burstPoint = Math.max(1.01, (99 * houseEdgeMultiplier) / (100 * float));

  return Math.min(parseFloat(burstPoint.toFixed(2)), 10000);
}

export class BalloonGame extends BaseGame {
  play(input: BetInput): BetResult {
    throw new Error('Balloon/Pump is now an interactive session-based game and cannot be played directly via play(). Use the session API endpoints.');
  }
}
