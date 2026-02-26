import { Rakeback, User, Bet, UserSettings, RakebackConfig, IRakebackTier, UserStats, Currency } from '@casino/database';
import { WalletService } from './wallet-service';
import mongoose from 'mongoose';

export class RakebackService {
  /**
   * Determine user's rakeback tier based on total wagered
   */
  private static async getUserTier(userId: string, currency: string): Promise<{ tier: IRakebackTier; config: any } | null> {
    const config = await RakebackConfig.findOne({ currency, enabled: true });
    if (!config || !config.tiers.length) return null;

    // Get user's total wagered from stats
    const stats = await UserStats.findOne({ userId });
    const totalWagered = stats?.totalWagered || 0;

    // Find highest applicable tier (sorted descending by minWagered)
    const sortedTiers = [...config.tiers].sort((a, b) => b.minWagered - a.minWagered);
    const tier = sortedTiers.find(t => totalWagered >= t.minWagered);

    if (!tier) {
      // Below all tiers — use lowest
      const lowestTier = config.tiers.reduce((min, t) => t.minWagered < min.minWagered ? t : min);
      return { tier: lowestTier, config };
    }

    return { tier, config };
  }

  /**
   * Calculate rakeback for user using admin-configured tiers
   */
  static async calculateRakeback(userId: string, currency: string, period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
    }

    // Get config-aware tier info
    const tierInfo = await this.getUserTier(userId, currency);

    // Load admin config for eligible games filter
    const config = tierInfo?.config;
    const eligibleGames = config?.eligibleGames?.length
      ? { gameType: { $in: config.eligibleGames } }
      : {};

    // Get user's bets in period (filtered by eligible games)
    const bets = await Bet.find({
      userId,
      currency,
      createdAt: { $gte: startDate, $lt: now },
      isDemo: false,
      ...eligibleGames,
    });

    const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const houseEdge = bets.reduce((sum, bet) => sum + (bet.amount - bet.payout), 0);

    // Use tier percentage from admin config, or fallback to hardcoded defaults
    let rakebackPercent: number;
    let tierName: string;

    if (tierInfo) {
      rakebackPercent = tierInfo.tier.percentage;
      tierName = tierInfo.tier.name;
    } else {
      // Fallback: no config exists, use basic defaults
      const user = await User.findById(userId);
      rakebackPercent = 5; // 5% default
      if (user?.isVip) rakebackPercent = 7;
      if (user?.isPremium) rakebackPercent = 10;
      tierName = 'Default';
    }

    // Apply contributionPercent from config (% of house edge that goes to rakeback)
    const contributionPct = config?.contributionPercent || 100;
    const effectiveHouseEdge = houseEdge * (contributionPct / 100);
    const rakebackAmount = effectiveHouseEdge * (rakebackPercent / 100);

    return {
      totalWagered,
      houseEdge,
      rakebackPercent,
      rakebackAmount,
      tierName,
      period,
    };
  }

  /**
   * Opt user in/out of rakeback
   */
  static async setRakebackOptIn(userId: string, optIn: boolean) {
    await UserSettings.findOneAndUpdate(
      { userId },
      { rakebackOptIn: optIn },
      { upsert: true }
    );

    return { success: true, optIn };
  }

  /**
   * Check if user is opted in
   */
  static async isOptedIn(userId: string): Promise<boolean> {
    const settings = await UserSettings.findOne({ userId });
    return settings?.rakebackOptIn || false;
  }

  /**
   * Generate rakeback for opted-in users
   */
  static async generateRakeback(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const optedInUsers = await UserSettings.find({ rakebackOptIn: true });

    for (const userSettings of optedInUsers) {
      const currencies = ['BTC', 'ETH', 'LTC', 'USDT', 'USD', 'EUR'];

      for (const currency of currencies) {
        const rakeback = await this.calculateRakeback(
          userSettings.userId.toString(),
          currency,
          period
        );

        if (rakeback.rakebackAmount > 0) {
          await Rakeback.create({
            userId: userSettings.userId,
            currency,
            amount: rakeback.rakebackAmount,
            claimed: false
          });
        }
      }
    }
  }

  /**
   * Claim rakeback with admin-configured limits
   */
  static async claimRakeback(userId: string, currency: string) {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const unclaimedRakeback = await Rakeback.find({
          userId,
          currency,
          claimed: false
        }).session(session);

        if (unclaimedRakeback.length === 0) {
          throw new Error('No rakeback to claim');
        }

        let totalAmount = unclaimedRakeback.reduce((sum, rb) => sum + rb.amount, 0);

        // Enforce min/max from admin config
        const config = await RakebackConfig.findOne({ currency, enabled: true });
        if (config) {
          if (totalAmount < (config.minClaimAmount || 0)) {
            throw new Error(`Minimum claim amount is ${config.minClaimAmount} ${currency}`);
          }
          if (config.maxClaimAmount && totalAmount > config.maxClaimAmount) {
            totalAmount = config.maxClaimAmount; // Cap at max
          }
        }

        // Credit wallet
        await WalletService.creditBalanceWithSession(userId, currency as Currency, totalAmount, session);

        // Mark as claimed
        await Rakeback.updateMany(
          { userId, currency, claimed: false },
          { claimed: true, claimedAt: new Date() },
          { session }
        );

        return {
          success: true,
          amount: totalAmount,
          currency,
          count: unclaimedRakeback.length
        };
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get user's rakeback history
   */
  static async getRakebackHistory(userId: string, limit = 50) {
    return Rakeback.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Get unclaimed rakeback by currency
   */
  static async getUnclaimedRakeback(userId: string) {
    const unclaimed = await Rakeback.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), claimed: false } },
      { $group: { _id: '$currency', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    return unclaimed.reduce((acc, item) => {
      acc[item._id] = { amount: item.total, count: item.count };
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);
  }
}