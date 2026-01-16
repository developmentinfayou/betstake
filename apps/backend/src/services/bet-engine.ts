import { Bet, BetStatus, GameType, Currency, UserStats, Wallet, Transaction } from '@casino/database';
import mongoose from 'mongoose';
import { gameRegistry } from '@casino/game-engine';
import { SeedManager } from '@casino/fairness';
import { verifyGame } from '@casino/fairness/verifier';
import { WalletService } from './wallet-service';
import { JackpotService } from './jackpot-service';
import { EventEmitter } from 'events';

export const betEvents = new EventEmitter();

export interface PlaceBetInput {
  userId: string;
  gameType: GameType;
  currency: Currency;
  amount: number;
  gameParams: any;
  isDemo?: boolean;
  isAutoBet?: boolean;
  strategyId?: string;
}

/**
 * Bet Engine - handles all bet processing with MongoDB transactions
 */
export class BetEngine {
  /**
   * Place a bet (without transactions for compatibility)
   */
  static async placeBet(input: PlaceBetInput) {
    const { userId, gameType, currency, amount, gameParams, isDemo, isAutoBet, strategyId } = input;

    if (!isDemo && amount <= 0) {
      throw new Error('Bet amount must be positive');
    }

    try {
      // Get seed data
      const seedData = await SeedManager.reserveSeedForBetNoTx(userId);

      let wallet = null;
      if (!isDemo) {
        // Debit wallet balance
        wallet = await WalletService.debitBalance(userId, currency, amount);
      }

      // Play the game
      const game = gameRegistry.getGame(gameType);
      const result = game.play({
        amount,
        currency,
        seedData: {
          serverSeed: seedData.serverSeed,
          clientSeed: seedData.clientSeed,
          nonce: seedData.nonce,
        },
        gameParams,
      });

      const status = result.won ? BetStatus.WON : BetStatus.LOST;

      // Create bet record
      const bet = await Bet.create({
        userId,
        gameType,
        currency,
        amount,
        multiplier: result.multiplier,
        payout: result.payout,
        profit: result.profit,
        status,
        seedPairId: seedData.seedPairId,
        nonce: seedData.nonce,
        gameData: gameParams,
        result: result.result,
        isDemo: isDemo || false,
        isAutoBet: isAutoBet || false,
        strategyId,
      });

      if (!isDemo) {
        // Add to jackpot pool
        await JackpotService.addToPool(gameType, currency, amount);
        
        // Credit winnings if won
        if (result.won && result.payout > 0) {
          await WalletService.addBalance(userId, currency, result.payout);
        }

        // Check jackpot conditions
        await JackpotService.checkJackpotConditions(
          bet._id.toString(),
          gameType,
          currency,
          amount,
          result.result
        );

        // Update user stats
        await UserStats.findOneAndUpdate(
          { userId },
          {
            $inc: {
              totalWagered: amount,
              totalProfit: result.profit,
              totalWins: result.won ? 1 : 0,
              totalLosses: result.won ? 0 : 1,
            },
            $setOnInsert: { userId }
          },
          { upsert: true }
        );

        // Get updated wallet
        wallet = await WalletService.getWallet(userId, currency);
      }

      // Emit events
      setImmediate(() => {
        betEvents.emit('bet-placed', {
          userId,
          betId: bet._id.toString(),
          gameType,
          amount,
          multiplier: result.multiplier,
          won: result.won,
        });

        betEvents.emit('user-activity', {
          user_id: userId,
          activity: 'bet_placed',
          brief_desc: `Placed ${amount} ${currency} bet on ${gameType}`,
          severity: 'info',
          meta_data: { betId: bet._id.toString(), gameType, amount, won: result.won },
        });
      });

      return {
        bet,
        result,
        wallet,
      };
    } catch (error) {
      console.error('Bet placement error:', error);
      throw error;
    }
  }

  /**
   * Get bet history
   */
  static async getBetHistory(userId: string, limit = 50, offset = 0) {
    return Bet.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('seedPairId', 'serverSeedHash clientSeed nonce revealed serverSeed');
  }

  /**
   * Get bet by ID
   */
  static async getBetById(betId: string) {
    return Bet.findById(betId)
      .populate('seedPairId')
      .populate('userId', 'username');
  }

  /**
   * Get all bets (for leaderboard)
   */
  static async getAllBets(limit = 50, offset = 0) {
    return Bet.find({ isDemo: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('userId', 'username');
  }

  /**
   * Get high roller bets
   */
  static async getHighRollers(currency: Currency, limit = 50) {
    return Bet.find({ currency, isDemo: false })
      .sort({ amount: -1 })
      .limit(limit)
      .populate('userId', 'username');
  }

  /**
   * Get big wins
   */
  static async getBigWins(currency: Currency, limit = 50) {
    return Bet.find({ currency, status: BetStatus.WON, isDemo: false })
      .sort({ payout: -1 })
      .limit(limit)
      .populate('userId', 'username');
  }

  /**
   * Get lucky wins (highest multiplier)
   */
  static async getLuckyWins(limit = 50) {
    return Bet.find({ status: BetStatus.WON, isDemo: false })
      .sort({ multiplier: -1 })
      .limit(limit)
      .populate('userId', 'username');
  }

  /**
   * Verify bet - reconstruct result from seed data
   */
  static async verifyBet(betId: string) {
    const bet = await Bet.findById(betId).populate('seedPairId');
    if (!bet) throw new Error('Bet not found');

    const seedPair = bet.seedPairId as any;
    if (!seedPair.revealed) {
      return {
        canVerify: false,
        message: 'Server seed not revealed yet. Rotate your seed pair to verify past bets.',
      };
    }

    const verification = verifyGame({
      serverSeed: seedPair.serverSeed,
      clientSeed: seedPair.clientSeed,
      nonce: bet.nonce,
      gameType: bet.gameType,
      gameParams: bet.gameData,
    });

    return {
      canVerify: true,
      bet: {
        id: bet._id,
        gameType: bet.gameType,
        amount: bet.amount,
        multiplier: bet.multiplier,
        payout: bet.payout,
        result: bet.result,
      },
      seedData: {
        serverSeed: seedPair.serverSeed,
        serverSeedHash: seedPair.serverSeedHash,
        clientSeed: seedPair.clientSeed,
        nonce: bet.nonce,
      },
      verification,
      matches: JSON.stringify(bet.result) === JSON.stringify(verification.result),
    };
  }
}
