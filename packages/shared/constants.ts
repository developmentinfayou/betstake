export const COLORS = {
  primary: '#FF0DB7',
  secondary: '#FFC100',
  special: '#73FFD7',
  alt: '#9D73FF',
  gradientMain: {
    from: '#C20DFF',
    to: '#00C3FF',
  },
  gradientAlt: {
    from: '#FF0D11',
    to: '#FF6A00',
  },
};

export const DEFAULT_HOUSE_EDGE = 1; // 1%

export const BET_PRESETS = [10, 50, 100, 500, 1000];

export const HOTKEYS = {
  BET: 'Space',
  HALF: 'Q',
  DOUBLE: 'W',
  MAX: 'E',
  AUTO: 'A',
};

export const STRATEGY_TYPES = {
  MARTINGALE: 'martingale',
  DELAYED_MARTINGALE: 'delayed_martingale',
  REVERSE_MARTINGALE: 'reverse_martingale',
  PAROLI: 'paroli',
  DALEMBERT: 'dalembert',
  CUSTOM: 'custom',
};

export const JACKPOT_MIN_BET = {
  BTC: 0.00001,
  ETH: 0.0001,
  LTC: 0.001,
  USDT: 1,
  USD: 1,
  EUR: 1,
};
