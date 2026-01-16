import { BaseGame, BetInput, BetResult } from '../../base-game';
import { generateFloats } from '@casino/fairness';
import crypto from 'crypto';

export type PlinkoRisk = 'low' | 'medium' | 'high' | 'lightning-low' | 'lightning-medium' | 'lightning-high';

export interface PlinkoParams {
  risk: PlinkoRisk;
  rows: 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
  superMode?: boolean;
  payoutSeed?: string;
}

export interface PlinkoResult {
  path: number[];
  finalSlot: number;
  multiplier: number;
  payoutSeed?: string;
  goldenCoins?: number[];
  shuffledMultipliers?: number[];
  goldenPegs?: Array<{ row: number; position: number; multiplier: number }>;
  deadZones?: number[];
  goldenPegHits?: Array<{ row: number; position: number; multiplier: number }>;
  finalGoldenMultiplier?: number;
}

/**
 * Plinko Game
 * Ball drops through pegs, lands in multiplier slot
 */
export class PlinkoGame extends BaseGame {
  // Lightning mode multiplier pools
  private lightningMultipliers = {
    'lightning-low': [2, 3, 4, 5, 6, 8, 10],
    'lightning-medium': [5, 8, 10, 12, 15, 20, 25, 30],
    'lightning-high': [10, 15, 20, 30, 40, 50, 80, 100]
  };

  // Golden peg count based on rows
  private goldenPegCount: Record<number, number> = {
    8: 3, 9: 3, 10: 4, 11: 4, 12: 5, 13: 5, 14: 6, 15: 7, 16: 8
  };

  // Dead zone count based on risk
  private deadZoneCount = {
    'lightning-low': 2,
    'lightning-medium': 3,
    'lightning-high': 4
  };

  // Multiplier tables for each risk level and row count
  private multipliers: Record<PlinkoRisk, Record<number, number[]>> = {
    low: {
      8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
      9: [5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6],
      10: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
      11: [8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4],
      12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
      13: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1],
      14: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
      15: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
      16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    },
    medium: {
      8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
      9: [18, 4, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4, 18],
      10: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
      11: [24, 6, 3, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3, 6, 24],
      12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
      13: [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 13, 43],
      14: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
      15: [88, 18, 11, 5, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 5, 11, 18, 88],
      16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    },
    high: {
      8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
      9: [43, 7, 2, 0.6, 0.2, 0.2, 0.6, 2, 7, 43],
      10: [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
      11: [120, 14, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14, 120],
      12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
      13: [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260],
      14: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
      15: [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620],
      16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
    },
  };

  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const params = input.gameParams as PlinkoParams;
    const { risk, rows, superMode, payoutSeed } = params;

    const isLightningMode = risk.startsWith('lightning-');

    // Generate path using provably fair RNG
    const plinkoSeedData = { ...input.seedData, cursor: 0 };
    const floats = generateFloats(plinkoSeedData, rows);
    const path = floats.map(f => (f < 0.5 ? 0 : 1));

    // Calculate final slot
    const finalSlot = path.reduce((sum, dir) => sum + dir, 0);

    // Get multipliers (shuffled if super mode)
    let multiplierTable = this.multipliers[risk.replace('lightning-', '') as 'low' | 'medium' | 'high'][rows];
    let goldenCoins: number[] | undefined;
    let finalPayoutSeed: string | undefined;
    let goldenPegs: Array<{ row: number; position: number; multiplier: number }> | undefined;
    let deadZones: number[] | undefined;
    let goldenPegHits: Array<{ row: number; position: number; multiplier: number }> | undefined;
    let finalGoldenMultiplier = 1;

    if (superMode || isLightningMode) {
      finalPayoutSeed = payoutSeed || this.generatePayoutSeed();
      
      if (isLightningMode) {
        // Generate golden pegs and dead zones for lightning mode
        goldenPegs = this.generateGoldenPegs(risk as any, rows, finalPayoutSeed);
        deadZones = this.generateDeadZones(risk as any, rows, finalPayoutSeed);
        
        // Check if ball hit any golden pegs
        goldenPegHits = this.checkGoldenPegHits(path, goldenPegs);
        
        // Calculate golden multiplier
        finalGoldenMultiplier = goldenPegHits.reduce((mult, hit) => mult * hit.multiplier, 1);
      } else {
        // Super mode (non-lightning) - shuffle multipliers
        const shuffled = this.shuffleMultipliers(multiplierTable, finalPayoutSeed);
        multiplierTable = shuffled.multipliers;
        goldenCoins = shuffled.goldenCoins;
      }
    }

    let multiplier = multiplierTable[finalSlot];
    
    // Check if landed in dead zone (lightning mode only)
    if (isLightningMode && deadZones && deadZones.includes(finalSlot)) {
      multiplier = 0; // Dead zone = instant loss
    } else if (isLightningMode) {
      // Apply golden peg multipliers
      multiplier *= finalGoldenMultiplier;
    }
    
    const finalMultiplier = multiplier * (1 - this.config.houseEdge / 100);
    
    const won = finalMultiplier >= 1;
    const payout = this.calculatePayout(input.amount, finalMultiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: PlinkoResult = {
      path,
      finalSlot,
      multiplier: finalMultiplier,
      payoutSeed: finalPayoutSeed,
      goldenCoins,
      shuffledMultipliers: superMode && !isLightningMode ? multiplierTable : undefined,
      goldenPegs,
      deadZones,
      goldenPegHits,
      finalGoldenMultiplier: isLightningMode ? finalGoldenMultiplier : undefined,
    };

    return {
      multiplier: finalMultiplier,
      payout,
      profit,
      won,
      gameData: params,
      result,
    };
  }

  private generatePayoutSeed(): string {
    return crypto.randomBytes(4).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
  }

  private shuffleMultipliers(multipliers: number[], payoutSeed: string): { multipliers: number[], goldenCoins: number[] } {
    const result = [...multipliers];
    const goldenCoins: number[] = [];
    
    // Use payout seed to shuffle
    const hash = crypto.createHash('sha256').update(payoutSeed).digest();
    
    // Fisher-Yates shuffle with payout seed
    for (let i = result.length - 1; i > 0; i--) {
      const byteIndex = (result.length - 1 - i) % hash.length;
      const j = Math.floor((hash[byteIndex] / 255) * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    // Mark top 3 multipliers as golden coins
    const sorted = [...result].map((m, i) => ({ m, i })).sort((a, b) => b.m - a.m);
    for (let i = 0; i < Math.min(3, sorted.length); i++) {
      goldenCoins.push(sorted[i].i);
    }

    return { multipliers: result, goldenCoins };
  }

  private generateGoldenPegs(risk: PlinkoRisk, rows: number, payoutSeed: string): Array<{ row: number; position: number; multiplier: number }> {
    const count = this.goldenPegCount[rows] || 5;
    const multiplierPool = this.lightningMultipliers[risk] || this.lightningMultipliers['lightning-medium'];
    
    const hash = crypto.createHash('sha256').update(payoutSeed + 'golden').digest();
    const goldenPegs: Array<{ row: number; position: number; multiplier: number }> = [];
    
    for (let i = 0; i < count; i++) {
      // Avoid first 2 and last 2 rows
      const row = 2 + (hash[i * 3] % Math.max(1, rows - 4));
      const position = hash[i * 3 + 1] % (row + 2);
      const multiplier = multiplierPool[hash[i * 3 + 2] % multiplierPool.length];
      
      goldenPegs.push({ row, position, multiplier });
    }
    
    return goldenPegs;
  }

  private generateDeadZones(risk: PlinkoRisk, rows: number, payoutSeed: string): number[] {
    const count = this.deadZoneCount[risk] || 3;
    const totalSlots = rows + 1;
    
    const hash = crypto.createHash('sha256').update(payoutSeed + 'dead').digest();
    const deadZones: number[] = [];
    
    for (let i = 0; i < count && i < hash.length; i++) {
      const slot = hash[i] % totalSlots;
      if (!deadZones.includes(slot)) {
        deadZones.push(slot);
      }
    }
    
    return deadZones.sort((a, b) => a - b);
  }

  private checkGoldenPegHits(path: number[], goldenPegs: Array<{ row: number; position: number; multiplier: number }>): Array<{ row: number; position: number; multiplier: number }> {
    const hits: Array<{ row: number; position: number; multiplier: number }> = [];
    let currentPosition = 0;
    
    path.forEach((direction, rowIndex) => {
      // Check if current position matches any golden peg
      const hit = goldenPegs.find(peg => peg.row === rowIndex && peg.position === currentPosition);
      if (hit) {
        hits.push(hit);
      }
      
      // Update position for next row
      currentPosition += direction;
    });
    
    return hits;
  }

  static generateNewPayoutSeed(): string {
    return crypto.randomBytes(4).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
  }

  /**
   * Check jackpot conditions
   */
  checkJackpot(result: PlinkoResult, history: PlinkoResult[]): boolean {
    // Same trajectory multiple times
    const pathStr = result.path.join('');
    const sameTrajectoryCount = history.filter(
      h => h.path.join('') === pathStr
    ).length;

    if (sameTrajectoryCount >= 3) return true;

    return false;
  }
}
