import { GameConfig, Currency } from '../schemas';

const gameConfigurations = [
  {
    gameType: 'DICE',
    houseEdge: 1.0,
    minBet: {
      BTC: 0.00000001,
      ETH: 0.000001,
      LTC: 0.00001,
      USDT: 0.01,
      USD: 0.01,
      EUR: 0.01
    },
    maxBet: {
      BTC: 1.0,
      ETH: 10.0,
      LTC: 100.0,
      USDT: 50000.0,
      USD: 50000.0,
      EUR: 50000.0
    },
    maxWin: {
      BTC: 10.0,
      ETH: 100.0,
      LTC: 1000.0,
      USDT: 500000.0,
      USD: 500000.0,
      EUR: 500000.0
    },
    isEnabled: true,
    config: {
      ultimateMode: true,
      maxMultiplier: 9900,
      minMultiplier: 1.0102
    }
  },
  {
    gameType: 'LIMBO',
    houseEdge: 1.0,
    minBet: {
      BTC: 0.00000001,
      ETH: 0.000001,
      LTC: 0.00001,
      USDT: 0.01,
      USD: 0.01,
      EUR: 0.01
    },
    maxBet: {
      BTC: 1.0,
      ETH: 10.0,
      LTC: 100.0,
      USDT: 50000.0,
      USD: 50000.0,
      EUR: 50000.0
    },
    maxWin: {
      BTC: 10.0,
      ETH: 100.0,
      LTC: 1000.0,
      USDT: 500000.0,
      USD: 500000.0,
      EUR: 500000.0
    },
    isEnabled: true,
    config: {
      maxMultiplier: 1000000,
      minMultiplier: 1.01
    }
  },
  {
    gameType: 'CRASH',
    houseEdge: 1.0,
    minBet: {
      BTC: 0.00000001,
      ETH: 0.000001,
      LTC: 0.00001,
      USDT: 0.01,
      USD: 0.01,
      EUR: 0.01
    },
    maxBet: {
      BTC: 0.1,
      ETH: 1.0,
      LTC: 10.0,
      USDT: 5000.0,
      USD: 5000.0,
      EUR: 5000.0
    },
    maxWin: {
      BTC: 5.0,
      ETH: 50.0,
      LTC: 500.0,
      USDT: 250000.0,
      USD: 250000.0,
      EUR: 250000.0
    },
    isEnabled: true,
    config: {
      maxMultiplier: 10000,
      roundDuration: 30000,
      multiplayer: true
    }
  },
  {
    gameType: 'MINES',
    houseEdge: 1.0,
    minBet: {
      BTC: 0.00000001,
      ETH: 0.000001,
      LTC: 0.00001,
      USDT: 0.01,
      USD: 0.01,
      EUR: 0.01
    },
    maxBet: {
      BTC: 1.0,
      ETH: 10.0,
      LTC: 100.0,
      USDT: 50000.0,
      USD: 50000.0,
      EUR: 50000.0
    },
    maxWin: {
      BTC: 10.0,
      ETH: 100.0,
      LTC: 1000.0,
      USDT: 500000.0,
      USD: 500000.0,
      EUR: 500000.0
    },
    isEnabled: true,
    config: {
      gridSize: 25,
      maxMines: 24,
      minMines: 1
    }
  },
  {
    gameType: 'PLINKO',
    houseEdge: 1.0,
    minBet: {
      BTC: 0.00000001,
      ETH: 0.000001,
      LTC: 0.00001,
      USDT: 0.01,
      USD: 0.01,
      EUR: 0.01
    },
    maxBet: {
      BTC: 1.0,
      ETH: 10.0,
      LTC: 100.0,
      USDT: 50000.0,
      USD: 50000.0,
      EUR: 50000.0
    },
    maxWin: {
      BTC: 10.0,
      ETH: 100.0,
      LTC: 1000.0,
      USDT: 500000.0,
      USD: 500000.0,
      EUR: 500000.0
    },
    isEnabled: true,
    config: {
      rows: [8, 9, 10, 11, 12, 13, 14, 15, 16],
      risks: ['low', 'medium', 'high'],
      superMode: true
    }
  },
  {
    gameType: 'ROULETTE',
    houseEdge: 2.7,
    minBet: {
      BTC: 0.00000001,
      ETH: 0.000001,
      LTC: 0.00001,
      USDT: 0.01,
      USD: 0.01,
      EUR: 0.01
    },
    maxBet: {
      BTC: 1.0,
      ETH: 10.0,
      LTC: 100.0,
      USDT: 50000.0,
      USD: 50000.0,
      EUR: 50000.0
    },
    maxWin: {
      BTC: 35.0,
      ETH: 350.0,
      LTC: 3500.0,
      USDT: 1750000.0,
      USD: 1750000.0,
      EUR: 1750000.0
    },
    isEnabled: true,
    config: {
      type: 'european',
      numbers: 37,
      multiplayer: true
    }
  },
  {
    gameType: 'FASTPARITY',
    houseEdge: 1.0,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 50000.0, USD: 50000.0, EUR: 50000.0 },
    maxWin: { BTC: 10.0, ETH: 100.0, LTC: 1000.0, USDT: 500000.0, USD: 500000.0, EUR: 500000.0 },
    isEnabled: true,
    config: { colors: ['red', 'black', 'green'], numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }
  },
  {
    gameType: 'KENO',
    houseEdge: 1.0,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 50000.0, USD: 50000.0, EUR: 50000.0 },
    maxWin: { BTC: 10.0, ETH: 100.0, LTC: 1000.0, USDT: 500000.0, USD: 500000.0, EUR: 500000.0 },
    isEnabled: true,
    config: { risks: ['low', 'bit', 'medium', 'high'], maxNumbers: 10, totalNumbers: 40 }
  },
  {
    gameType: 'WHEEL',
    houseEdge: 1.0,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 50000.0, USD: 50000.0, EUR: 50000.0 },
    maxWin: { BTC: 10.0, ETH: 100.0, LTC: 1000.0, USDT: 500000.0, USD: 500000.0, EUR: 500000.0 },
    isEnabled: true,
    config: { risks: ['low', 'medium', 'high'], segments: [10, 20, 30, 40, 50] }
  },
  {
    gameType: 'BALLOON',
    houseEdge: 1.0,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 50000.0, USD: 50000.0, EUR: 50000.0 },
    maxWin: { BTC: 10.0, ETH: 100.0, LTC: 1000.0, USDT: 500000.0, USD: 500000.0, EUR: 500000.0 },
    isEnabled: true,
    config: { difficulties: ['simple', 'easy', 'medium', 'hard', 'expert'], pumpModes: ['random', 'specific', 'both'] }
  },
  {
    gameType: 'COINFLIP',
    houseEdge: 1.0,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 50000.0, USD: 50000.0, EUR: 50000.0 },
    maxWin: { BTC: 10.0, ETH: 100.0, LTC: 1000.0, USDT: 500000.0, USD: 500000.0, EUR: 500000.0 },
    isEnabled: true,
    config: { modes: ['normal', 'series'], sides: ['heads', 'tails'] }
  },
  {
    gameType: 'RUSH',
    houseEdge: 1.0,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 50000.0, USD: 50000.0, EUR: 50000.0 },
    maxWin: { BTC: 10.0, ETH: 100.0, LTC: 1000.0, USDT: 500000.0, USD: 500000.0, EUR: 500000.0 },
    isEnabled: true,
    config: { difficulties: ['easy', 'medium', 'hard', 'expert'] }
  },
  {
    gameType: 'TRENBALL',
    houseEdge: 1.0,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 0.1, ETH: 1.0, LTC: 10.0, USDT: 5000.0, USD: 5000.0, EUR: 5000.0 },
    maxWin: { BTC: 5.0, ETH: 50.0, LTC: 500.0, USDT: 250000.0, USD: 250000.0, EUR: 250000.0 },
    isEnabled: true,
    config: { bets: ['crash', 'red', 'green', 'moon'], multiplayer: true }
  },
  {
    gameType: 'TOWER',
    houseEdge: 1.0,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 50000.0, USD: 50000.0, EUR: 50000.0 },
    maxWin: { BTC: 10.0, ETH: 100.0, LTC: 1000.0, USDT: 500000.0, USD: 500000.0, EUR: 500000.0 },
    isEnabled: true,
    config: { maxLevel: 25, difficulties: ['easy', 'medium', 'hard'] }
  },
  {
    gameType: 'HILO',
    houseEdge: 1.0,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 50000.0, USD: 50000.0, EUR: 50000.0 },
    maxWin: { BTC: 10.0, ETH: 100.0, LTC: 1000.0, USDT: 500000.0, USD: 500000.0, EUR: 500000.0 },
    isEnabled: true,
    config: { maxCards: 52, jokers: false }
  },
  {
    gameType: 'BLACKJACK',
    houseEdge: 0.5,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 50000.0, USD: 50000.0, EUR: 50000.0 },
    maxWin: { BTC: 10.0, ETH: 100.0, LTC: 1000.0, USDT: 500000.0, USD: 500000.0, EUR: 500000.0 },
    isEnabled: true,
    config: { decks: 6, dealerStandsOn17: true, doubleAfterSplit: true }
  },
  {
    gameType: 'STAIRS',
    houseEdge: 1.0,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 50000.0, USD: 50000.0, EUR: 50000.0 },
    maxWin: { BTC: 10.0, ETH: 100.0, LTC: 1000.0, USDT: 500000.0, USD: 500000.0, EUR: 500000.0 },
    isEnabled: true,
    config: { maxStairs: 20, difficulties: ['easy', 'medium', 'hard'] }
  },
  {
    gameType: 'LUDO',
    houseEdge: 2.0,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 0.1, ETH: 1.0, LTC: 10.0, USDT: 1000.0, USD: 1000.0, EUR: 1000.0 },
    maxWin: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 10000.0, USD: 10000.0, EUR: 10000.0 },
    isEnabled: true,
    config: { modes: ['1v1', '2v2', '1v1v1v1'], maxRollTime: 30, maxPlayTime: 300, antiCheat: true }
  },
  {
    gameType: 'CHESS',
    houseEdge: 2.0,
    minBet: { BTC: 0.00000001, ETH: 0.000001, LTC: 0.00001, USDT: 0.01, USD: 0.01, EUR: 0.01 },
    maxBet: { BTC: 0.1, ETH: 1.0, LTC: 10.0, USDT: 1000.0, USD: 1000.0, EUR: 1000.0 },
    maxWin: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 10000.0, USD: 10000.0, EUR: 10000.0 },
    isEnabled: true,
    config: { timeControls: ['5+0', '10+0', '15+10', '30+0'], antiCheat: true, moveRecording: true }
  }UR: 1000.0 },
    maxWin: { BTC: 1.0, ETH: 10.0, LTC: 100.0, USDT: 10000.0, USD: 10000.0, EUR: 10000.0 },
    isEnabled: true,
    config: { timeControls: ['5+0', '10+0', '15+10', '30+0'], antiCheat: true, moveRecording: true }
  }
];

export const seedGameConfigurations = async () => {
  console.log('🌱 Seeding game configurations...');
  
  for (const config of gameConfigurations) {
    await GameConfig.findOneAndUpdate(
      { gameType: config.gameType },
      config,
      { upsert: true, new: true }
    );
  }
  
  console.log(`✅ Seeded ${gameConfigurations.length} game configurations`);
};