import {
  GameAnalysis,
  RiskWeights,
  RiskThresholds,
  RiskDecision,
  AccountAntiCheatStats,
} from '../types';

const DEFAULT_WEIGHTS: RiskWeights = {
  acpl: 0.30,
  engineTopRate: 0.25,
  timingPattern: 0.15,
  blurCorrelation: 0.15,
  hardPositionAccuracy: 0.15,
};

const DEFAULT_THRESHOLDS: RiskThresholds = {
  low: 0.35,
  high: 0.70,
};

/** Rating-band ACPL baselines (approximate) */
const ACPL_BASELINES: Record<string, { mean: number; stdDev: number }> = {
  '800': { mean: 120, stdDev: 40 },
  '1000': { mean: 90, stdDev: 35 },
  '1200': { mean: 65, stdDev: 25 },
  '1400': { mean: 45, stdDev: 18 },
  '1600': { mean: 32, stdDev: 14 },
  '1800': { mean: 22, stdDev: 10 },
  '2000': { mean: 16, stdDev: 7 },
  '2200': { mean: 12, stdDev: 5 },
  '2400': { mean: 9, stdDev: 4 },
  '2600': { mean: 7, stdDev: 3 },
};

/** Engine top-move match baselines by rating */
const ENGINE_TOP_BASELINES: Record<string, { mean: number; stdDev: number }> = {
  '800': { mean: 0.30, stdDev: 0.10 },
  '1000': { mean: 0.35, stdDev: 0.10 },
  '1200': { mean: 0.40, stdDev: 0.10 },
  '1400': { mean: 0.48, stdDev: 0.08 },
  '1600': { mean: 0.55, stdDev: 0.08 },
  '1800': { mean: 0.62, stdDev: 0.07 },
  '2000': { mean: 0.68, stdDev: 0.06 },
  '2200': { mean: 0.73, stdDev: 0.05 },
  '2400': { mean: 0.78, stdDev: 0.04 },
  '2600': { mean: 0.82, stdDev: 0.04 },
};

export class RiskScorer {
  constructor(
    private weights: RiskWeights = DEFAULT_WEIGHTS,
    private thresholds: RiskThresholds = DEFAULT_THRESHOLDS
  ) {}

  /**
   * Compute composite risk score for one side of a game.
   * Returns 0..1 where higher = more suspicious.
   */
  computeRisk(
    analysis: GameAnalysis,
    side: 'white' | 'black',
    playerRating: number = 1200
  ): number {
    const acpl = side === 'white' ? analysis.avgCentipawnLossWhite : analysis.avgCentipawnLossBlack;
    const engineTop = side === 'white' ? analysis.engineTopChoiceRateWhite : analysis.engineTopChoiceRateBlack;
    const hardAcc = side === 'white' ? analysis.hardPositionAccuracyWhite : analysis.hardPositionAccuracyBlack;
    const timing = side === 'white' ? analysis.timingPatternScoreWhite : analysis.timingPatternScoreBlack;
    const blur = side === 'white' ? analysis.blurCorrelationScoreWhite : analysis.blurCorrelationScoreBlack;

    const acplZ = this.zScore(acpl, 'acpl', playerRating);
    const engineTopZ = this.zScore(engineTop, 'engineTop', playerRating);
    const hardAccZ = this.zScore(hardAcc, 'engineTop', playerRating); // Use same baseline

    const score =
      this.weights.acpl * this.sigmoidNorm(acplZ) +
      this.weights.engineTopRate * this.sigmoidNorm(engineTopZ) +
      this.weights.hardPositionAccuracy * this.sigmoidNorm(hardAccZ) +
      this.weights.timingPattern * timing +
      this.weights.blurCorrelation * blur;

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Compute Z-score relative to rating-band baseline.
   * For ACPL, lower is suspicious (better than expected) → we return negative Z as positive suspicion.
   * For engine match rate, higher is suspicious.
   */
  private zScore(value: number, metric: 'acpl' | 'engineTop', rating: number): number {
    const ratingBucket = this.nearestBucket(rating);

    if (metric === 'acpl') {
      const baseline = ACPL_BASELINES[ratingBucket] || ACPL_BASELINES['1200'];
      // Lower ACPL than expected = suspicious → invert Z
      return (baseline.mean - value) / baseline.stdDev;
    } else {
      const baseline = ENGINE_TOP_BASELINES[ratingBucket] || ENGINE_TOP_BASELINES['1200'];
      // Higher engine match rate than expected = suspicious
      return (value - baseline.mean) / baseline.stdDev;
    }
  }

  /** Convert Z-score to 0..1 via sigmoid, centered at Z=0 */
  private sigmoidNorm(z: number): number {
    // Only positive Z is suspicious
    if (z <= 0) return 0;
    // Sigmoid that maps Z=2 → ~0.73, Z=3 → ~0.88, Z=4 → ~0.95
    return 1 / (1 + Math.exp(-1.5 * (z - 1.5)));
  }

  private nearestBucket(rating: number): string {
    const buckets = Object.keys(ACPL_BASELINES).map(Number).sort((a, b) => a - b);
    let closest = buckets[0];
    for (const b of buckets) {
      if (Math.abs(b - rating) < Math.abs(closest - rating)) closest = b;
    }
    return String(closest);
  }

  decide(score: number): RiskDecision {
    if (score < this.thresholds.low) return 'clean';
    if (score >= this.thresholds.high) return 'flagged';
    return 'suspicious';
  }

  /**
   * Update rolling account stats with a new game's score.
   * Uses exponential moving average with configurable window.
   */
  updateAccountStats(
    existing: AccountAntiCheatStats,
    gameId: string,
    newScore: number,
    newACPL: number,
    newEngineTop: number,
    newTiming: number,
    newBlur: number,
    windowSize: number = 30
  ): AccountAntiCheatStats {
    const alpha = 2 / (windowSize + 1);

    const updated: AccountAntiCheatStats = {
      ...existing,
      gamesAnalysed: existing.gamesAnalysed + 1,
      rollingAvgACPL: existing.rollingAvgACPL * (1 - alpha) + newACPL * alpha,
      rollingEngineTopRate: existing.rollingEngineTopRate * (1 - alpha) + newEngineTop * alpha,
      rollingTimingScore: existing.rollingTimingScore * (1 - alpha) + newTiming * alpha,
      rollingBlurScore: existing.rollingBlurScore * (1 - alpha) + newBlur * alpha,
      rollingCompositeRisk: existing.rollingCompositeRisk * (1 - alpha) + newScore * alpha,
      lastUpdated: new Date(),
    };

    // Keep last N game scores
    updated.recentGameScores = [
      ...existing.recentGameScores,
      { gameId, score: newScore, timestamp: Date.now() },
    ].slice(-windowSize);

    // Detect sudden performance jumps
    if (existing.gamesAnalysed > 5) {
      const avgRecent = updated.recentGameScores
        .slice(-5)
        .reduce((a, b) => a + b.score, 0) / Math.min(5, updated.recentGameScores.length);
      const avgOlder = existing.rollingCompositeRisk;

      if (avgRecent - avgOlder > 0.3) {
        updated.flagCount = existing.flagCount + 1;
      }
    }

    return updated;
  }

  /** Check if an account's rolling stats warrant auto-flagging */
  shouldAutoFlag(stats: AccountAntiCheatStats): boolean {
    return (
      stats.rollingCompositeRisk >= this.thresholds.high ||
      stats.flagCount >= 3 ||
      (stats.gamesAnalysed > 10 && stats.rollingEngineTopRate > 0.85)
    );
  }
}
