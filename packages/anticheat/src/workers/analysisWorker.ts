import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { StockfishPool } from '../engine/stockfishPool';
import { GameAnalyser } from '../engine/gameAnalyser';
import { BehaviourAnalyser } from '../analysis/behaviourAnalyser';
import { RiskScorer } from '../analysis/riskScorer';
import {
  AnalysisJobPayload,
  GameMove,
  ClientEvent,
  GameAnalysis,
  AccountAntiCheatStats,
} from '../types';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const STOCKFISH_PATH = process.env.STOCKFISH_PATH || 'stockfish';
const POOL_SIZE = parseInt(process.env.STOCKFISH_POOL_SIZE || '2', 10);
const QUEUE_NAME = 'anticheat:analysis';

/**
 * In production, replace these stubs with real DB/Redis calls.
 */
interface DataStore {
  getGameMoves(gameId: string): Promise<GameMove[]>;
  getClientEvents(gameId: string): Promise<ClientEvent[]>;
  getPlayerRating(playerId: string): Promise<number>;
  getPlayerIdsForGame(gameId: string): Promise<{ whitePlayerId: string; blackPlayerId: string }>;
  saveGameAnalysis(analysis: GameAnalysis): Promise<void>;
  getAccountStats(playerId: string): Promise<AccountAntiCheatStats | null>;
  saveAccountStats(stats: AccountAntiCheatStats): Promise<void>;
  freezeGamePayout(gameId: string, reason: string): Promise<void>;
  flagGameForReview(gameId: string, reason: string): Promise<void>;
  getStakeAmount(gameId: string): Promise<number>;
}

async function createWorker(dataStore: DataStore) {
  const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
  const stockfishPool = new StockfishPool(POOL_SIZE, STOCKFISH_PATH);
  await stockfishPool.init();

  const gameAnalyser = new GameAnalyser(stockfishPool);
  const behaviourAnalyser = new BehaviourAnalyser();
  const riskScorer = new RiskScorer();

  const worker = new Worker<AnalysisJobPayload>(
    QUEUE_NAME,
    async (job: Job<AnalysisJobPayload>) => {
      const { gameId, priority, stakeAmount } = job.data;
      console.log(`[AntiCheat] Analysing game ${gameId} (priority: ${priority})`);

      try {
        // 1. Fetch game data
        const moves = await dataStore.getGameMoves(gameId);
        const clientEvents = await dataStore.getClientEvents(gameId);
        const { whitePlayerId, blackPlayerId } = await dataStore.getPlayerIdsForGame(gameId);

        if (moves.length < 10) {
          console.log(`[AntiCheat] Game ${gameId} too short for analysis (${moves.length} moves)`);
          return;
        }

        // 2. Run engine analysis
        const analysis = await gameAnalyser.analyseGame(gameId, moves);

        // 3. Compute behavioural metrics for each side
        const whiteMoves = moves.filter((m) => m.side === 'white');
        const blackMoves = moves.filter((m) => m.side === 'black');

        const whiteTiming = behaviourAnalyser.analyseTimingPatterns(whiteMoves);
        const blackTiming = behaviourAnalyser.analyseTimingPatterns(blackMoves);

        analysis.timingPatternScoreWhite = whiteTiming.timingPatternScore;
        analysis.timingPatternScoreBlack = blackTiming.timingPatternScore;
        analysis.timingVarianceWhite = whiteTiming.timingVariance;
        analysis.timingVarianceBlack = blackTiming.timingVariance;

        // 4. Compute blur correlation
        const whitePositions = analysis.positionAnalyses.filter((p) => p.side === 'white');
        const blackPositions = analysis.positionAnalyses.filter((p) => p.side === 'black');

        analysis.blurCorrelationScoreWhite = behaviourAnalyser.analyseBlurCorrelation(
          whiteMoves,
          clientEvents.filter((e) => e.playerId === whitePlayerId),
          whitePositions
        );
        analysis.blurCorrelationScoreBlack = behaviourAnalyser.analyseBlurCorrelation(
          blackMoves,
          clientEvents.filter((e) => e.playerId === blackPlayerId),
          blackPositions
        );

        // 5. Compute composite risk scores
        const whiteRating = await dataStore.getPlayerRating(whitePlayerId);
        const blackRating = await dataStore.getPlayerRating(blackPlayerId);

        analysis.compositeRiskWhite = riskScorer.computeRisk(analysis, 'white', whiteRating);
        analysis.compositeRiskBlack = riskScorer.computeRisk(analysis, 'black', blackRating);

        // 6. Decide flags
        const whiteDecision = riskScorer.decide(analysis.compositeRiskWhite);
        const blackDecision = riskScorer.decide(analysis.compositeRiskBlack);

        const flagReasons: string[] = [];
        if (whiteDecision === 'flagged') flagReasons.push(`white:${whiteDecision}`);
        if (blackDecision === 'flagged') flagReasons.push(`black:${blackDecision}`);
        if (whiteDecision === 'suspicious') flagReasons.push(`white:${whiteDecision}`);
        if (blackDecision === 'suspicious') flagReasons.push(`black:${blackDecision}`);

        analysis.requiresReview =
          whiteDecision === 'flagged' || blackDecision === 'flagged';
        analysis.autoFlagReason = flagReasons.length > 0 ? flagReasons.join(', ') : undefined;

        if (analysis.requiresReview) {
          analysis.decision = 'pending';
        } else if (whiteDecision === 'suspicious' || blackDecision === 'suspicious') {
          analysis.decision = 'suspicious';
        } else {
          analysis.decision = 'clean';
        }

        // 7. Persist analysis
        await dataStore.saveGameAnalysis(analysis);

        // 8. Update account rolling stats
        for (const { playerId, side } of [
          { playerId: whitePlayerId, side: 'white' as const },
          { playerId: blackPlayerId, side: 'black' as const },
        ]) {
          const existing = await dataStore.getAccountStats(playerId);
          const defaults: AccountAntiCheatStats = {
            playerId,
            gamesAnalysed: 0,
            rollingAvgACPL: side === 'white' ? analysis.avgCentipawnLossWhite : analysis.avgCentipawnLossBlack,
            rollingEngineTopRate: side === 'white' ? analysis.engineTopChoiceRateWhite : analysis.engineTopChoiceRateBlack,
            rollingTimingScore: side === 'white' ? analysis.timingPatternScoreWhite : analysis.timingPatternScoreBlack,
            rollingBlurScore: side === 'white' ? analysis.blurCorrelationScoreWhite : analysis.blurCorrelationScoreBlack,
            rollingCompositeRisk: side === 'white' ? analysis.compositeRiskWhite : analysis.compositeRiskBlack,
            recentGameScores: [],
            flagCount: 0,
            lastUpdated: new Date(),
          };

          const stats = existing || defaults;
          const score = side === 'white' ? analysis.compositeRiskWhite : analysis.compositeRiskBlack;
          const acpl = side === 'white' ? analysis.avgCentipawnLossWhite : analysis.avgCentipawnLossBlack;
          const engineTop = side === 'white' ? analysis.engineTopChoiceRateWhite : analysis.engineTopChoiceRateBlack;
          const timing = side === 'white' ? analysis.timingPatternScoreWhite : analysis.timingPatternScoreBlack;
          const blur = side === 'white' ? analysis.blurCorrelationScoreWhite : analysis.blurCorrelationScoreBlack;

          const updated = riskScorer.updateAccountStats(
            stats,
            gameId,
            score,
            acpl,
            engineTop,
            timing,
            blur
          );

          await dataStore.saveAccountStats(updated);

          // 9. Auto-flag account if warranted
          if (riskScorer.shouldAutoFlag(updated)) {
            await dataStore.flagGameForReview(gameId, `Account ${playerId} auto-flagged (rolling risk)`);
          }
        }

        // 10. Enforcement: freeze payouts for high-risk money games
        if (stakeAmount > 0 && analysis.requiresReview) {
          await dataStore.freezeGamePayout(
            gameId,
            `Auto-held: ${analysis.autoFlagReason}`
          );
        }

        console.log(
          `[AntiCheat] Game ${gameId} analysis complete. ` +
          `White risk: ${analysis.compositeRiskWhite.toFixed(3)}, ` +
          `Black risk: ${analysis.compositeRiskBlack.toFixed(3)}, ` +
          `Decision: ${analysis.decision}`
        );
      } catch (error) {
        console.error(`[AntiCheat] Error analysing game ${gameId}:`, error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 2,
      limiter: {
        max: 10,
        duration: 60000, // Max 10 jobs per minute
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`[AntiCheat] Job ${job.id} completed for game ${job.data.gameId}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[AntiCheat] Job ${job?.id} failed:`, err.message);
  });

  console.log(`[AntiCheat] Analysis worker started (pool: ${POOL_SIZE}, queue: ${QUEUE_NAME})`);
  return worker;
}

// Export for use when wiring up a real DataStore
export { createWorker, DataStore, QUEUE_NAME };
