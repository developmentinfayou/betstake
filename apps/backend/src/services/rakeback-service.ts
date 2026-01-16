import { Rakeback, User, Bet, UserSettings } from '@casino/database';
import { WalletService } from './wallet-service';
import mongoose from 'mongoose';

export class RakebackService {
  /**
   * Calculate rakeback for user
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
    
    // Get user's bets in period
    const bets = await Bet.find({
      userId,
      currency,
      createdAt: { $gte: startDate, $lt: now },
      isDemo: false
    });
    
    const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const houseEdge = bets.reduce((sum, bet) => sum + (bet.amount - bet.payout), 0);
    
    // Rakeback percentage (configurable per user/VIP level)
    const user = await User.findById(userId);
    let rakebackPercent = 0.1; // 0.1% default
    
    if (user?.isVip) rakebackPercent = 0.15;
    if (user?.isPremium) rakebackPercent = 0.2;
    
    const rakebackAmount = houseEdge * (rakebackPercent / 100);
    
    return {
      totalWagered,
      houseEdge,
      rakebackPercent,
      rakebackAmount,
      period
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
   * Claim rakeback
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
        
        const totalAmount = unclaimedRakeback.reduce((sum, rb) => sum + rb.amount, 0);
        
        // Credit wallet
        await WalletService.creditBalanceWithSession(userId, currency, totalAmount, session);
        
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