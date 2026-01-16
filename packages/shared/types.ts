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
  onWin: {
    reset: boolean;
    increaseBy?: number; // percentage
    decreaseBy?: number;
  };
  onLoss: {
    reset: boolean;
    increaseBy?: number;
    decreaseBy?: number;
  };
  stopOnProfit?: number;
  stopOnLoss?: number;
}

export interface StrategyCondition {
  type: 'bet' | 'profit' | 'loss' | 'streak';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  action: 'increase' | 'decrease' | 'reset' | 'stop';
  actionValue?: number;
}

export interface Strategy {
  id: string;
  title: string;
  gameType: GameType;
  conditions: StrategyCondition[];
  isPublic: boolean;
  commission?: number;
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
