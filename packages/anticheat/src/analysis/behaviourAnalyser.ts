import { GameMove, ClientEvent, PositionAnalysis } from '../types';

interface BehaviourMetrics {
  timingPatternScore: number;
  blurCorrelationScore: number;
  timingVariance: number;
  meanThinkTime: number;
  suspiciouslyConstantCount: number;
  blurInHardPositionRate: number;
}

export class BehaviourAnalyser {
  /**
   * Analyse timing patterns for one side's moves.
   * Returns 0 for human-like, higher for engine-like.
   */
  analyseTimingPatterns(moves: GameMove[]): BehaviourMetrics {
    if (moves.length < 5) {
      return {
        timingPatternScore: 0,
        blurCorrelationScore: 0,
        timingVariance: 0,
        meanThinkTime: 0,
        suspiciouslyConstantCount: 0,
        blurInHardPositionRate: 0,
      };
    }

    const thinkTimes = moves.map((m) => m.clientElapsedMs);
    const mean = thinkTimes.reduce((a, b) => a + b, 0) / thinkTimes.length;
    const variance =
      thinkTimes.reduce((acc, t) => acc + (t - mean) ** 2, 0) / thinkTimes.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation: low = suspiciously constant
    const cv = mean > 0 ? stdDev / mean : 0;

    // Count moves within a narrow band (e.g., within 500ms of each other)
    const CONSTANT_THRESHOLD_MS = 500;
    let constantCount = 0;
    for (let i = 1; i < thinkTimes.length; i++) {
      if (Math.abs(thinkTimes[i] - thinkTimes[i - 1]) < CONSTANT_THRESHOLD_MS) {
        constantCount++;
      }
    }
    const constantRate = constantCount / (thinkTimes.length - 1);

    // Check for unnaturally regular intervals (bots often think in fixed increments)
    const diffs = [];
    for (let i = 1; i < thinkTimes.length; i++) {
      diffs.push(Math.abs(thinkTimes[i] - thinkTimes[i - 1]));
    }
    const diffVariance =
      diffs.length > 0
        ? diffs.reduce((acc, d) => acc + (d - diffs.reduce((a, b) => a + b, 0) / diffs.length) ** 2, 0) / diffs.length
        : 0;

    // Score: 0-1 where higher = more suspicious
    let timingScore = 0;

    // Low CV is suspicious (too constant)
    if (cv < 0.15) timingScore += 0.4;
    else if (cv < 0.25) timingScore += 0.2;

    // High constant-pair rate is suspicious
    if (constantRate > 0.6) timingScore += 0.3;
    else if (constantRate > 0.4) timingScore += 0.15;

    // Very low diff variance is suspicious
    if (diffVariance < 100000 && moves.length > 10) timingScore += 0.3;
    else if (diffVariance < 500000) timingScore += 0.1;

    return {
      timingPatternScore: Math.min(1, timingScore),
      blurCorrelationScore: 0, // computed separately with position data
      timingVariance: variance,
      meanThinkTime: mean,
      suspiciouslyConstantCount: constantCount,
      blurInHardPositionRate: 0,
    };
  }

  /**
   * Correlate blur events with position difficulty.
   * If a player alt-tabs more in harder positions, that's suspicious.
   */
  analyseBlurCorrelation(
    moves: GameMove[],
    clientEvents: ClientEvent[],
    positionAnalyses: PositionAnalysis[]
  ): number {
    if (moves.length < 5 || positionAnalyses.length < 5) return 0;

    // Build a map of moveNumber -> complexity (is complex or not)
    const complexMap = new Map<number, boolean>();
    for (const pa of positionAnalyses) {
      complexMap.set(pa.moveNumber, pa.isComplexPosition);
    }

    // For each move, count blur events during the think window
    const hardMoves = moves.filter(
      (m) => complexMap.get(m.moveNumber) === true
    );
    const easyMoves = moves.filter(
      (m) => complexMap.get(m.moveNumber) === false
    );

    const avgBlurHard =
      hardMoves.length > 0
        ? hardMoves.reduce((acc, m) => acc + m.blurEventsDuringThink, 0) / hardMoves.length
        : 0;

    const avgBlurEasy =
      easyMoves.length > 0
        ? easyMoves.reduce((acc, m) => acc + m.blurEventsDuringThink, 0) / easyMoves.length
        : 0;

    // If blur rate in hard positions is much higher than easy, suspicious
    if (avgBlurEasy === 0 && avgBlurHard === 0) return 0;
    if (avgBlurEasy === 0 && avgBlurHard > 0) return Math.min(1, avgBlurHard * 0.3);

    const ratio = avgBlurHard / Math.max(avgBlurEasy, 0.01);

    // ratio > 3 is very suspicious, normalize to 0-1
    return Math.min(1, Math.max(0, (ratio - 1) / 4));
  }
}
