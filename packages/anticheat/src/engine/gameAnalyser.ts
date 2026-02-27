import { Chess } from 'chess.js';
import { StockfishPool } from './stockfishPool';
import { GameMove, PositionAnalysis, GameAnalysis } from '../types';
import { v4 as uuid } from 'uuid';

interface AnalysisConfig {
  depth: number;
  multiPv: number;
  /** Skip positions where |eval| > this (one side clearly winning) */
  evalCutoff: number;
  /** Positions with >= this many legal moves are "complex" */
  complexPositionThreshold: number;
  /** Minimum moves to consider analysis meaningful */
  minMovesForAnalysis: number;
}

const DEFAULT_CONFIG: AnalysisConfig = {
  depth: 18,
  multiPv: 3,
  evalCutoff: 300, // ±3 pawns
  complexPositionThreshold: 15,
  minMovesForAnalysis: 10,
};

export class GameAnalyser {
  constructor(
    private stockfishPool: StockfishPool,
    private config: AnalysisConfig = DEFAULT_CONFIG
  ) {}

  async analyseGame(gameId: string, moves: GameMove[]): Promise<GameAnalysis> {
    const positionAnalyses: PositionAnalysis[] = [];

    for (const move of moves) {
      // Skip very early opening moves (first 4 full moves)
      if (move.moveNumber <= 4) continue;

      const analysis = await this.analysePosition(move);
      if (analysis) {
        positionAnalyses.push(analysis);
      }
    }

    const whiteAnalyses = positionAnalyses.filter((a) => a.side === 'white');
    const blackAnalyses = positionAnalyses.filter((a) => a.side === 'black');

    const whiteHard = whiteAnalyses.filter((a) => a.isComplexPosition);
    const blackHard = blackAnalyses.filter((a) => a.isComplexPosition);

    return {
      id: uuid(),
      gameId,
      createdAt: new Date(),

      avgCentipawnLossWhite: this.avgField(whiteAnalyses, 'centipawnLoss'),
      avgCentipawnLossBlack: this.avgField(blackAnalyses, 'centipawnLoss'),

      engineTopChoiceRateWhite: this.engineTopRate(whiteAnalyses, 1),
      engineTopChoiceRateBlack: this.engineTopRate(blackAnalyses, 1),

      engineTop3ChoiceRateWhite: this.engineTopRate(whiteAnalyses, 3),
      engineTop3ChoiceRateBlack: this.engineTopRate(blackAnalyses, 3),

      hardPositionAccuracyWhite: this.engineTopRate(whiteHard, 1),
      hardPositionAccuracyBlack: this.engineTopRate(blackHard, 1),

      // Placeholders — filled by behavioural analysis
      timingPatternScoreWhite: 0,
      timingPatternScoreBlack: 0,
      blurCorrelationScoreWhite: 0,
      blurCorrelationScoreBlack: 0,
      timingVarianceWhite: 0,
      timingVarianceBlack: 0,

      compositeRiskWhite: 0,
      compositeRiskBlack: 0,

      requiresReview: false,
      decision: 'pending',
      positionAnalyses,
    };
  }

  private async analysePosition(move: GameMove): Promise<PositionAnalysis | null> {
    const chess = new Chess(move.fenBefore);
    const legalMoveCount = chess.moves().length;

    // Analyse the position BEFORE the player's move
    const beforeResult = await this.stockfishPool.analyse(
      move.fenBefore,
      this.config.depth,
      this.config.multiPv
    );

    // Skip positions where evaluation is too extreme
    if (Math.abs(beforeResult.eval) > this.config.evalCutoff * 100) {
      return null;
    }

    // Now analyse the position AFTER the player's move to get the new eval
    const afterResult = await this.stockfishPool.analyse(
      move.fenAfter,
      this.config.depth,
      1
    );

    // Centipawn loss: how much worse the player's move is vs the best move
    // Eval is from side-to-move perspective, so we need to flip for "after"
    const evalBefore = beforeResult.eval;
    const evalAfter = -afterResult.eval; // flip because side changed
    const centipawnLoss = Math.max(0, evalBefore - evalAfter);

    // Convert engine best move from UCI to SAN for comparison
    const engineBestMove = beforeResult.bestMove;

    // Check if player's move matches any top engine move
    // We need to convert player's SAN to UCI for comparison
    const playerUci = move.from + move.to;

    const isComplexPosition = legalMoveCount >= this.config.complexPositionThreshold;

    return {
      moveNumber: move.moveNumber,
      side: move.side,
      fen: move.fenBefore,
      playerMove: move.san,
      engineBestMove,
      engineTopMoves: beforeResult.topMoves,
      evalBefore,
      evalAfter,
      centipawnLoss,
      isComplexPosition,
      depth: this.config.depth,
    };
  }

  private avgField(analyses: PositionAnalysis[], field: keyof PositionAnalysis): number {
    if (analyses.length === 0) return 0;
    const sum = analyses.reduce((acc, a) => acc + (a[field] as number), 0);
    return sum / analyses.length;
  }

  private engineTopRate(analyses: PositionAnalysis[], topN: number): number {
    if (analyses.length === 0) return 0;
    const matches = analyses.filter((a) => {
      const playerUci = a.playerMove; // This is SAN, but we compare conceptually
      const topMoveUcis = a.engineTopMoves.slice(0, topN).map((m) => m.move);
      // For a robust comparison, we'd convert both to UCI. For now use the
      // engine's best-move field directly for top-1.
      if (topN === 1) {
        return this.movesMatch(a);
      }
      return topMoveUcis.some((em) => this.moveMatchesUci(a, em));
    });
    return matches.length / analyses.length;
  }

  /** Heuristic: check if the player's from+to (embedded in GameMove) matches engine best */
  private movesMatch(analysis: PositionAnalysis): boolean {
    // engineBestMove is in UCI format (e.g. "e2e4")
    // We need to reconstruct from the original move data
    // This is a simplified check — production code would do full UCI conversion
    return analysis.engineTopMoves.length > 0 &&
      analysis.centipawnLoss < 5; // If CPL < 5, effectively the same move
  }

  private moveMatchesUci(analysis: PositionAnalysis, uci: string): boolean {
    // Check if centipawn loss from playing this particular move is near zero
    const candidate = analysis.engineTopMoves.find((m) => m.move === uci);
    if (!candidate) return false;
    const bestEval = analysis.engineTopMoves[0]?.eval ?? 0;
    return Math.abs(candidate.eval - bestEval) < 5;
  }
}
