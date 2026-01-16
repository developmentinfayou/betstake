import { Jackpot, JackpotStatus, Currency, GameType } from '../schemas';

const jackpotConfigurations = [
  // DICE Jackpots
  {
    gameType: 'DICE',
    currency: 'BTC',
    currentAmount: 0.1,
    minAmount: 0.05,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'roll_specific',
      targets: [77.77, 7.77],
      consecutiveRequired: 1,
      chancePerBet: 0.001
    }
  },
  {
    gameType: 'DICE',
    currency: 'USDT',
    currentAmount: 5000,
    minAmount: 2500,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'roll_specific',
      targets: [77.77, 7.77],
      consecutiveRequired: 2,
      chancePerBet: 0.0005
    }
  },
  
  // LIMBO Jackpots
  {
    gameType: 'LIMBO',
    currency: 'BTC',
    currentAmount: 0.2,
    minAmount: 0.1,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'multiplier_hit',
      targets: [7.77, 77.77],
      consecutiveRequired: 1,
      chancePerBet: 0.001
    }
  },
  
  // CRASH Jackpots (Multiplayer)
  {
    gameType: 'CRASH',
    currency: 'BTC',
    currentAmount: 0.5,
    minAmount: 0.25,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'crash_multiplayer',
      winnerType: 'highest_bettor',
      crashPoints: [7.77, 77.77],
      chancePerRound: 0.01
    }
  },
  
  // MINES Jackpots
  {
    gameType: 'MINES',
    currency: 'BTC',
    currentAmount: 0.15,
    minAmount: 0.075,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'mine_action',
      trigger: 'bomb_hit',
      chancePerAction: 0.005,
      chancePerBet: 0.001
    }
  },
  
  // PLINKO Jackpots
  {
    gameType: 'PLINKO',
    currency: 'BTC',
    currentAmount: 0.12,
    minAmount: 0.06,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'trajectory_repeat',
      consecutiveRequired: 3,
      chancePerBet: 0.001
    }
  },
  
  // ROULETTE Jackpots
  {
    gameType: 'ROULETTE',
    currency: 'BTC',
    currentAmount: 0.3,
    minAmount: 0.15,
    status: JackpotStatus.READY,
    houseEdgePercent: 2.7,
    conditions: {
      type: 'color_sequence',
      colors: ['red', 'black', 'green'],
      consecutiveRequired: 5,
      chancePerBet: 0.001
    }
  },
  
  // FASTPARITY Jackpots
  {
    gameType: 'FASTPARITY',
    currency: 'USDT',
    currentAmount: 10000,
    minAmount: 5000,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'color_win_sequence',
      consecutiveRequired: 7,
      chancePerBet: 0.001
    }
  },
  
  // KENO Jackpots
  {
    gameType: 'KENO',
    currency: 'BTC',
    currentAmount: 0.08,
    minAmount: 0.04,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'number_match',
      perfectMatches: 10,
      chancePerBet: 0.0001
    }
  },
  
  // WHEEL Jackpots
  {
    gameType: 'WHEEL',
    currency: 'BTC',
    currentAmount: 0.1,
    minAmount: 0.05,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'segment_sequence',
      consecutiveRequired: 3,
      chancePerBet: 0.002
    }
  },
  
  // BALLOON Jackpots
  {
    gameType: 'BALLOON',
    currency: 'BTC',
    currentAmount: 0.06,
    minAmount: 0.03,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'multiplier_hit',
      targets: [1.77, 7.77, 77.77],
      difficulty: 'all',
      chancePerBet: 0.001
    }
  },
  
  // COINFLIP Jackpots
  {
    gameType: 'COINFLIP',
    currency: 'BTC',
    currentAmount: 0.04,
    minAmount: 0.02,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'flip_sequence',
      sides: ['heads', 'tails'],
      consecutiveRequired: 10,
      chancePerBet: 0.001
    }
  },
  
  // RUSH Jackpots
  {
    gameType: 'RUSH',
    currency: 'BTC',
    currentAmount: 0.07,
    minAmount: 0.035,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'multiplier_hit',
      targets: [1.77, 7.77, 77.77],
      chancePerCross: 0.005,
      chancePerBet: 0.001
    }
  },
  
  // TOWER Jackpots
  {
    gameType: 'TOWER',
    currency: 'BTC',
    currentAmount: 0.09,
    minAmount: 0.045,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'level_reach',
      maxLevel: 25,
      chancePerLevel: 0.01,
      chancePerBet: 0.001
    }
  },
  
  // HILO Jackpots
  {
    gameType: 'HILO',
    currency: 'BTC',
    currentAmount: 0.05,
    minAmount: 0.025,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'card_sequence',
      consecutiveCorrect: 15,
      chancePerBet: 0.001
    }
  },
  
  // BLACKJACK Jackpots
  {
    gameType: 'BLACKJACK',
    currency: 'BTC',
    currentAmount: 0.11,
    minAmount: 0.055,
    status: JackpotStatus.READY,
    houseEdgePercent: 0.5,
    conditions: {
      type: 'blackjack_special',
      handTypes: ['natural_blackjack', 'five_card_charlie'],
      chancePerHand: 0.01
    }
  },
  
  // STAIRS Jackpots
  {
    gameType: 'STAIRS',
    currency: 'BTC',
    currentAmount: 0.08,
    minAmount: 0.04,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'stair_climb',
      maxStairs: 20,
      chancePerStair: 0.005,
      chancePerBet: 0.001
    }
  },
  
  // KENO Jackpots
  {
    gameType: 'KENO',
    currency: 'BTC',
    currentAmount: 0.08,
    minAmount: 0.04,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'number_match',
      specificNumbers: true,
      autoPickWins: true,
      consecutiveRequired: 3,
      chancePerBet: 0.0001
    }
  },
  
  // WHEEL Jackpots
  {
    gameType: 'WHEEL',
    currency: 'BTC',
    currentAmount: 0.1,
    minAmount: 0.05,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'segment_sequence',
      consecutiveRequired: 3,
      chancePerBet: 0.002
    }
  },
  
  // BALLOON Jackpots
  {
    gameType: 'BALLOON',
    currency: 'BTC',
    currentAmount: 0.06,
    minAmount: 0.03,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'multiplier_hit',
      targets: [1.77, 7.77, 77.77],
      difficulty: 'all',
      pumpSequence: true,
      chancePerBet: 0.001
    }
  },
  
  // COINFLIP Jackpots
  {
    gameType: 'COINFLIP',
    currency: 'BTC',
    currentAmount: 0.04,
    minAmount: 0.02,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'flip_sequence',
      sides: ['heads', 'tails'],
      consecutiveRequired: 10,
      seriesMode: true,
      chancePerBet: 0.001
    }
  },
  
  // RUSH Jackpots
  {
    gameType: 'RUSH',
    currency: 'BTC',
    currentAmount: 0.07,
    minAmount: 0.035,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'multiplier_hit',
      targets: [1.77, 7.77, 77.77],
      chancePerCross: 0.005,
      chancePerCrash: 0.01,
      chancePerBet: 0.001
    }
  },
  
  // TOWER Jackpots
  {
    gameType: 'TOWER',
    currency: 'BTC',
    currentAmount: 0.09,
    minAmount: 0.045,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'level_reach',
      maxLevel: 25,
      chancePerLevel: 0.01,
      chancePerBet: 0.001
    }
  },
  
  // HILO Jackpots
  {
    gameType: 'HILO',
    currency: 'BTC',
    currentAmount: 0.05,
    minAmount: 0.025,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'card_sequence',
      consecutiveCorrect: 15,
      chancePerBet: 0.001
    }
  },
  
  // BLACKJACK Jackpots
  {
    gameType: 'BLACKJACK',
    currency: 'BTC',
    currentAmount: 0.11,
    minAmount: 0.055,
    status: JackpotStatus.READY,
    houseEdgePercent: 0.5,
    conditions: {
      type: 'blackjack_special',
      handTypes: ['natural_blackjack', 'five_card_charlie'],
      chancePerHand: 0.01
    }
  },
  
  // STAIRS Jackpots
  {
    gameType: 'STAIRS',
    currency: 'BTC',
    currentAmount: 0.08,
    minAmount: 0.04,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'stair_climb',
      maxStairs: 20,
      chancePerStair: 0.005,
      chancePerBet: 0.001
    }
  },
  
  // TRENBALL Jackpots (Multiplayer)
  {
    gameType: 'TRENBALL',
    currency: 'BTC',
    currentAmount: 0.25,
    minAmount: 0.125,
    status: JackpotStatus.READY,
    houseEdgePercent: 1,
    conditions: {
      type: 'trenball_multiplayer',
      winnerType: 'distribute_by_ratio',
      colors: ['crash', 'red', 'green', 'moon'],
      consecutiveRequired: 5,
      chancePerRound: 0.02
    }
  },
  
  // LUDO Jackpots (PVP)
  {
    gameType: 'LUDO',
    currency: 'BTC',
    currentAmount: 0.15,
    minAmount: 0.075,
    status: JackpotStatus.READY,
    houseEdgePercent: 2,
    conditions: {
      type: 'pvp_game',
      winConditions: ['perfect_game', 'quick_win'],
      chancePerGame: 0.05
    }
  },
  
  // CHESS Jackpots (PVP)
  {
    gameType: 'CHESS',
    currency: 'BTC',
    currentAmount: 0.2,
    minAmount: 0.1,
    status: JackpotStatus.READY,
    houseEdgePercent: 2,
    conditions: {
      type: 'pvp_game',
      winConditions: ['checkmate_under_10_moves', 'brilliant_move'],
      chancePerGame: 0.03
    }
  }
];

export const seedJackpotConfigurations = async () => {
  console.log('🎰 Seeding jackpot configurations...');
  
  for (const config of jackpotConfigurations) {
    await Jackpot.findOneAndUpdate(
      { gameType: config.gameType, currency: config.currency },
      config,
      { upsert: true, new: true }
    );
  }
  
  console.log(`✅ Seeded ${jackpotConfigurations.length} jackpot configurations`);
};