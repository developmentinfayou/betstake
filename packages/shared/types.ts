export enum GameType {
  DICE = 'DICE',
  LIMBO = 'LIMBO',
  CRASH = 'CRASH',
  MINES = 'MINES',
  PLINKO = 'PLINKO',
  ROULETTE = 'ROULETTE',
  FASTPARITY = 'FASTPARITY',
  KENO = 'KENO',
  TOWER = 'TOWER',
  HILO = 'HILO',
  BLACKJACK = 'BLACKJACK',
  WHEEL = 'WHEEL',
  BALLOON = 'BALLOON',
  RUSH = 'RUSH',
  COINFLIP = 'COINFLIP',
  TRENBALL = 'TRENBALL',
  STAIRS = 'STAIRS',
  LUDO = 'LUDO',
}

export enum Currency {
  BTC = 'BTC',
  ETH = 'ETH',
  LTC = 'LTC',
  USDT = 'USDT',
  USD = 'USD',
  EUR = 'EUR',
}

export enum BetStatus {
  PENDING = 'PENDING',
  WON = 'WON',
  LOST = 'LOST',
  REFUNDED = 'REFUNDED',
}

export interface AutoBetConfig {
  enabled: boolean;
  numberOfBets: number; // 0 = infinite
  strategyId?: string;
  onWin?: {
    reset: boolean;
    increaseBy?: number; // percentage
    decreaseBy?: number;
  };
  onLoss?: {
    reset: boolean;
    increaseBy?: number;
    decreaseBy?: number;
  };
  stopOnProfit?: number;
  stopOnLoss?: number;
}

// === Strategy Condition Block Types ===

export type BetTriggerFrequency = 'every' | 'every_streak_of' | 'first_streak_of' | 'streak_greater_than' | 'streak_lower_than';
export type BetTriggerTarget = 'wins' | 'losses' | 'bets';
export type ProfitTriggerSource = 'balance' | 'loss' | 'profit';
export type ProfitTriggerOp = 'greater_than' | 'greater_than_or_equal' | 'less_than' | 'less_than_or_equal';
export type ConditionType = 'bet' | 'profit';

export type ConditionAction =
  | 'increase_bet_amount'
  | 'decrease_bet_amount'
  | 'add_to_bet_amount'
  | 'subtract_from_bet_amount'
  | 'set_bet_amount'
  | 'reset_bet_amount'
  | 'stop_autobet';

export interface BetTrigger {
  frequency: BetTriggerFrequency;
  value: number;
  target: BetTriggerTarget;
}

export interface ProfitTrigger {
  source: ProfitTriggerSource;
  operator: ProfitTriggerOp;
  value: number;
}

export interface StrategyConditionBlock {
  id: string;
  type: ConditionType;
  betTrigger?: BetTrigger;
  profitTrigger?: ProfitTrigger;
  action: ConditionAction;
  actionValue?: number;
}

export interface UserStrategy {
  _id?: string;
  userId: string;
  name: string;
  conditions: StrategyConditionBlock[];
  isPreset: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JackpotCondition {
  type: 'value' | 'streak' | 'random' | 'specific';
  params: any;
}

export interface UserSettings {
  animations: boolean;
  hotkeysEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  showMaxBet: boolean;
  instantBet: boolean;
  theatreMode: boolean;
}

export interface LiveStats {
  profit: number;
  wins: number;
  losses: number;
  wagered: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  amount: number;
  currency: Currency;
}

export interface ContestEntry {
  rank: number;
  username: string;
  wagered: number;
  profit: number;
  prize?: number;
}
