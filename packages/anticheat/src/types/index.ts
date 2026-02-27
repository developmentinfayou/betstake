
// ─── Game Core ───────────────────────────────────────────────
export interface Game {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string;
  stakeAmount: number;
  currency: string;
  isRanked: boolean;
  tournamentId?: string;
  result: '1-0' | '0-1' | '1/2-1/2' | 'void' | '*';
  createdAt: Date;
  endedAt?: Date;
  // Provably fair fields
  serverSeedHash: string;
  serverSeed?: string; // revealed after game
  clientSeedWhite: string;
  clientSeedBlack: string;
  rngTranscript: RngOutcome[];
}

// ─── Move Log ────────────────────────────────────────────────
export interface GameMove {
  id: string;
  gameId: string;
  moveNumber: number;
  side: 'white' | 'black';
  san: string;
  from: string;
  to: string;
  fenBefore: string;
  fenAfter: string;
  serverTimestamp: number;
  clientElapsedMs: number;
  clientTabFocused: boolean;
  blurEventsDuringThink: number;
  clientSequenceId: number;
}

// ─── Client Behaviour Events ─────────────────────────────────
export type ClientEventType =
  | 'tabBlur'
  | 'tabFocus'
  | 'windowHidden'
  | 'windowVisible'
  | 'disconnect'
  | 'reconnect';

export interface ClientEvent {
  id: string;
  gameId: string;
  playerId: string;
  eventType: ClientEventType;
  ts: number;
  moveNumber?: number;
}

// ─── Engine Analysis Results ─────────────────────────────────
export interface PositionAnalysis {
  moveNumber: number;
  side: 'white' | 'black';
  fen: string;
  playerMove: string;
  engineBestMove: string;
  engineTopMoves: EngineCandidate[];
  evalBefore: number; // centipawns
  evalAfter: number;
  centipawnLoss: number;
  isComplexPosition: boolean;
  depth: number;
}

export interface EngineCandidate {
  move: string;
  eval: number; // centipawns
  rank: number;
}

// ─── Game Analysis (Anti-Cheat Metrics) ──────────────────────
export interface GameAnalysis {
  id: string;
  gameId: string;
  createdAt: Date;
  // Engine metrics
  avgCentipawnLossWhite: number;
  avgCentipawnLossBlack: number;
  engineTopChoiceRateWhite: number;
  engineTopChoiceRateBlack: number;
  engineTop3ChoiceRateWhite: number;
  engineTop3ChoiceRateBlack: number;
  hardPositionAccuracyWhite: number;
  hardPositionAccuracyBlack: number;
  // Behavioural metrics
  timingPatternScoreWhite: number;
  timingPatternScoreBlack: number;
  blurCorrelationScoreWhite: number;
  blurCorrelationScoreBlack: number;
  timingVarianceWhite: number;
  timingVarianceBlack: number;
  // Composite
  compositeRiskWhite: number;
  compositeRiskBlack: number;
  autoFlagReason?: string;
  requiresReview: boolean;
  decision: 'pending' | 'clean' | 'suspicious' | 'cheater';
  // Raw data
  positionAnalyses: PositionAnalysis[];
}

// ─── Per-Account Rolling Stats ───────────────────────────────
export interface AccountAntiCheatStats {
  playerId: string;
  gamesAnalysed: number;
  rollingAvgACPL: number;
  rollingEngineTopRate: number;
  rollingTimingScore: number;
  rollingBlurScore: number;
  rollingCompositeRisk: number;
  recentGameScores: { gameId: string; score: number; timestamp: number }[];
  flagCount: number;
  lastUpdated: Date;
}

// ─── Risk Scoring ────────────────────────────────────────────
export interface RiskWeights {
  acpl: number;
  engineTopRate: number;
  timingPattern: number;
  blurCorrelation: number;
  hardPositionAccuracy: number;
}

export interface RiskThresholds {
  low: number;   // below = clean
  high: number;  // above = auto-flag
}

export type RiskDecision = 'clean' | 'suspicious' | 'flagged';

// ─── Provably Fair ───────────────────────────────────────────
export interface ProvablyFairSeed {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}

export interface RngOutcome {
  purpose: 'colour' | 'chess960' | 'tiebreaker' | 'prizeDraw';
  nonce: number;
  derivedHash: string;
  result: string | number;
}

export interface ProvablyFairVerification {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  expectedHash: string;
  computedHash: string;
  match: boolean;
  derivedOutcome: string | number;
}

// ─── Admin Review ────────────────────────────────────────────
export interface AdminReviewAction {
  gameId: string;
  adminId: string;
  action: 'markClean' | 'markSuspicious' | 'markCheater' | 'voidGame' | 'banAccount';
  targetPlayerId?: string;
  reason: string;
  timestamp: Date;
}

// ─── Enforcement ─────────────────────────────────────────────
export interface EnforcementAction {
  type: 'freezePayout' | 'voidGame' | 'refundOpponent' | 'banAccount' | 'watchlist';
  gameId: string;
  playerId: string;
  reason: string;
  automated: boolean;
  timestamp: Date;
}

// ─── Queue Job Payloads ──────────────────────────────────────
export interface AnalysisJobPayload {
  gameId: string;
  priority: 'high' | 'normal' | 'low';
  stakeAmount: number;
}

export interface MoveValidationResult {
  valid: boolean;
  san?: string;
  fenAfter?: string;
  error?: string;
}
