import mongoose from 'mongoose';

/**
 * Create optimized indexes for casino platform
 * Focuses on high-frequency queries and real-time operations
 */
export const createOptimizedIndexes = async () => {
  const db = mongoose.connection.db;
  
  try {
    // Users collection - Authentication & Profile
    await db.collection('users').createIndexes([
      { key: { username: 1 }, unique: true },
      { key: { email: 1 }, unique: true },
      { key: { role: 1, isVip: 1 } },
      { key: { createdAt: -1 } }
    ]);

    // Bets collection - High frequency queries
    await db.collection('bets').createIndexes([
      { key: { userId: 1, createdAt: -1 } },
      { key: { gameType: 1, createdAt: -1 } },
      { key: { status: 1, amount: -1 } },
      { key: { multiplier: -1 } }, // For leaderboards
      { key: { payout: -1 } }, // For big wins
      { key: { seedPairId: 1, nonce: 1 } } // For verification
    ]);

    // Wallets collection - Financial operations
    await db.collection('wallets').createIndexes([
      { key: { userId: 1, currency: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { balance: -1 } }
    ]);

    // Seed pairs collection - Provably fair
    await db.collection('seedpairs').createIndexes([
      { key: { userId: 1, isActive: 1 } },
      { key: { userId: 1, createdAt: -1 } },
      { key: { revealed: 1, createdAt: -1 } }
    ]);

    // Fast Parity rounds - Real-time game
    await db.collection('fastparityrounds').createIndexes([
      { key: { status: 1, startTime: -1 } },
      { key: { createdAt: -1 } },
      { key: { 'bets.userId': 1 } },
      { key: { number: 1, color: 1 } } // For statistics
    ]);

    // Jackpots collection
    await db.collection('jackpots').createIndexes([
      { key: { gameType: 1, currency: 1 } },
      { key: { status: 1 } },
      { key: { currentAmount: -1 } }
    ]);

    // User stats collection
    await db.collection('userstats').createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { totalProfit: -1 } },
      { key: { totalWagered: -1 } }
    ]);

    // Transactions collection - Financial audit
    await db.collection('transactions').createIndexes([
      { key: { userId: 1, createdAt: -1 } },
      { key: { type: 1, createdAt: -1 } },
      { key: { walletId: 1, createdAt: -1 } }
    ]);

    // Game sessions - Multi-step games
    await db.collection('minessessions').createIndexes([
      { key: { userId: 1, isActive: 1 } },
      { key: { createdAt: -1 } }
    ]);

    await db.collection('towersessions').createIndexes([
      { key: { userId: 1, isActive: 1 } },
      { key: { createdAt: -1 } }
    ]);

    await db.collection('hilosessions').createIndexes([
      { key: { userId: 1, isActive: 1 } },
      { key: { createdAt: -1 } }
    ]);

    // PVP games
    await db.collection('pvpgames').createIndexes([
      { key: { status: 1, gameType: 1 } },
      { key: { players: 1 } },
      { key: { shareableLink: 1 }, unique: true }
    ]);

    // Contests & Competitions
    await db.collection('contests').createIndexes([
      { key: { startAt: 1, endAt: 1 } },
      { key: { type: 1, currency: 1 } }
    ]);

    console.log('✅ All optimized indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
};