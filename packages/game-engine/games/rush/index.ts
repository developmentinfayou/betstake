import { generateFloat } from '@casino/fairness';
import { BaseGame, BetInput, BetResult } from '../../base-game';

export * from './constants';

/**
 * Generates the hidden crash point for a Rush session based on the Stake.com algorithm.
 * Uses 0.99 house edge. Same provably fair logic as standard sequential Crash game.
 */
export function generateCrashPoint(seedData: { serverSeed: string; clientSeed: string; nonce: number }): number {
  const float = generateFloat(seedData);

  // Exact match with CrashGame formula and verifyCrash (1% house edge)
  const houseEdgeFraction = 0.01;
  const houseEdgeMultiplier = 1 - houseEdgeFraction;
  const crashPoint = Math.max(1.01, (99 * houseEdgeMultiplier) / (100 * float));

  return Math.min(parseFloat(crashPoint.toFixed(2)), 10000);
}

export class RushGame extends BaseGame {
  play(input: BetInput): BetResult {
    throw new Error('Rush is now an interactive session-based game and cannot be played directly via play(). Use the session API endpoints.');
  }
}
