import { SeedPair, Bet } from '@casino/database';
import mongoose from 'mongoose';
import { generateServerSeed, hashServerSeed, generateClientSeed } from './rng';

/**
 * Seed Manager - handles seed pair lifecycle
 */

export class SeedManager {
  /**
   * Create initial seed pair for user
   */
  static async createSeedPair(userId: string, clientSeed?: string) {
    const serverSeed = generateServerSeed();
    const serverSeedHash = hashServerSeed(serverSeed);
    const finalClientSeed = clientSeed || generateClientSeed();

    return SeedPair.create({
      userId,
      serverSeed,
      serverSeedHash,
      clientSeed: finalClientSeed,
      nonce: 0,
      isActive: true,
      revealed: false,
    });
  }

  /**
   * Get active seed pair for user
   */
  static async getActiveSeedPair(userId: string) {
    let seedPair = await SeedPair.findOne({ userId, isActive: true });

    if (!seedPair) {
      seedPair = await this.createSeedPair(userId);
    }

    return seedPair;
  }

  /**
   * Reserve seed for bet (atomic nonce increment within transaction)
   * MUST be called inside a Prisma transaction
   */
  static async reserveSeedForBet(
    session: mongoose.ClientSession,
    userId: string
  ) {
    const seed = await SeedPair.findOne({ userId, isActive: true }).session(session);

    if (!seed) {
      throw new Error('No active seed pair found');
    }

    const currentNonce = seed.nonce;
    seed.nonce += 1;
    await seed.save({ session });

    return {
      seedPairId: seed._id.toString(),
      serverSeed: seed.serverSeed,
      clientSeed: seed.clientSeed,
      nonce: currentNonce,
      serverSeedHash: seed.serverSeedHash,
    };
  }

  /**
   * Increment nonce after bet
   */
  static async incrementNonce(seedPairId: string) {
    return SeedPair.findByIdAndUpdate(seedPairId, { $inc: { nonce: 1 } }, { new: true });
  }

  /**
   * Lock seed for active game session
   */
  static async lockSeedForGame(userId: string, gameSessionId: string) {
    const seedPair = await SeedPair.findOne({ userId, isActive: true });
    if (!seedPair) throw new Error('No active seed pair found');
    
    seedPair.activeGameSession = gameSessionId;
    await seedPair.save();
    return seedPair;
  }

  /**
   * Unlock seed after game session ends
   */
  static async unlockSeedAfterGame(gameSessionId: string) {
    await SeedPair.updateOne(
      { activeGameSession: gameSessionId },
      { $unset: { activeGameSession: 1 } }
    );
  }

  /**
   * Check if user has active game session
   */
  static async hasActiveGameSession(userId: string): Promise<boolean> {
    const seedPair = await SeedPair.findOne({ 
      userId, 
      isActive: true, 
      activeGameSession: { $exists: true } 
    });
    return !!seedPair;
  }

  /**
   * Rotate to new seed pair (reveals old server seed)
   */
  static async rotateSeedPair(userId: string, newClientSeed?: string) {
    // Check for active game session
    const hasActiveGame = await this.hasActiveGameSession(userId);
    if (hasActiveGame) {
      throw new Error('Cannot rotate seed during active game session');
    }

    const currentSeed = await SeedPair.findOne({ userId, isActive: true });

    if (currentSeed) {
      const computedHash = hashServerSeed(currentSeed.serverSeed);
      if (computedHash !== currentSeed.serverSeedHash) {
        throw new Error('Server seed hash mismatch - integrity violation');
      }
    }

    // Deactivate current seed pair and reveal server seed
    await SeedPair.updateMany(
      { userId, isActive: true },
      {
        isActive: false,
        revealed: true,
        revealedAt: new Date(),
      }
    );

    // Create new seed pair
    return this.createSeedPair(userId, newClientSeed);
  }

  /**
   * Update client seed (rotates seed pair)
   */
  static async updateClientSeed(userId: string, newClientSeed: string) {
    return this.rotateSeedPair(userId, newClientSeed);
  }

  /**
   * Get seed pair by ID with verification data
   */
  static async getSeedPairForVerification(seedPairId: string) {
    const seedPair = await SeedPair.findById(seedPairId);
    if (!seedPair) return null;

    const bets = await Bet.find({ seedPairId })
      .sort({ createdAt: 1 })
      .limit(100);

    return { ...seedPair.toObject(), bets };
  }

  /**
   * Get total bets on current seed pair
   */
  static async getBetCount(seedPairId: string) {
    return Bet.countDocuments({ seedPairId });
  }

  /**
   * Reserve seed for bet (no transaction)
   */
  static async reserveSeedForBetNoTx(userId: string) {
    const seed = await SeedPair.findOne({ userId, isActive: true });
    if (!seed) throw new Error('No active seed pair found');

    const currentNonce = seed.nonce;
    seed.nonce += 1;
    await seed.save();

    return {
      seedPairId: seed._id.toString(),
      serverSeed: seed.serverSeed,
      clientSeed: seed.clientSeed,
      nonce: currentNonce,
      serverSeedHash: seed.serverSeedHash,
    };
  }
}
