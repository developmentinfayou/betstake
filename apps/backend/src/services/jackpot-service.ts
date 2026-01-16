import { Jackpot, JackpotWin, JackpotStatus, GameType, Currency, Bet } from '@casino/database';
import { WalletService } from './wallet-service';
import { EventEmitter } from 'events';
import mongoose from 'mongoose';

export const jackpotEvents = new EventEmitter();

/**
 * Jackpot Service - manages jackpot pools and winners with MongoDB
 */
export class JackpotService {
  /**
   * Get or create jackpot for game/currency
   */
  static async getJackpot(gameType?: string, currency?: string) {
    let jackpot = await Jackpot.findOne({
      gameType: gameType || null,
      currency: currency || null,
    });

    if (!jackpot) {
      jackpot = await Jackpot.create({
        gameType: gameType || null,
        currency: currency || null,
        currentAmount: 0,
        minAmount: 100,
        status: JackpotStatus.REFILLING,
        houseEdgePercent: 1,
        conditions: { randomChance: 0.0001, minBet: 0 },
      });
    }

    return jackpot;
  }

  /**
   * Add to jackpot pool from house edge
   */
  static async addToPool(gameType: string, currency: string, betAmount: number) {
    const jackpot = await this.getJackpot(gameType, currency);
    
    const contribution = betAmount * (jackpot.houseEdgePercent / 100) * 0.1;

    const updated = await Jackpot.findByIdAndUpdate(
      jackpot._id,
      { $inc: { currentAmount: contribution } },
      { new: true }
    );

    await this.updateJackpotStatus(updated!._id.toString());
    return updated;
  }

  /**
   * Update jackpot status
   */
  private static async updateJackpotStatus(jackpotId: string) {
    const jackpot = await Jackpot.findById(jackpotId);
    if (!jackpot) return;

    let newStatus = jackpot.status;
    if (jackpot.currentAmount < jackpot.minAmount) {
      newStatus = JackpotStatus.REFILLING;
    } else if (jackpot.currentAmount >= jackpot.minAmount * 5) {
      newStatus = JackpotStatus.MEGA;
    } else {
      newStatus = JackpotStatus.READY;
    }

    if (newStatus !== jackpot.status) {
      await Jackpot.findByIdAndUpdate(jackpotId, { status: newStatus });
    }
  }

  /**
   * Check jackpot conditions for specific games
   */
  static async checkJackpotConditions(betId: string, gameType: string, currency: string, betAmount: number, gameResult: any) {
    const jackpot = await this.getJackpot(gameType, currency);
    
    if (jackpot.status === JackpotStatus.REFILLING) return false;
    if (betAmount < (jackpot.conditions?.minBet || 0)) return false;

    // Game-specific jackpot conditions
    const won = await this.evaluateGameConditions(gameType, gameResult, jackpot.conditions);
    
    if (won) {
      await this.awardJackpot(jackpot._id.toString(), betId);
      return true;
    }

    return false;
  }

  /**
   * Evaluate game-specific jackpot conditions
   */
  private static async evaluateGameConditions(gameType: string, gameResult: any, conditions: any): Promise<boolean> {
    switch (gameType) {
      case 'DICE':
        return this.checkDiceConditions(gameResult, conditions);
      case 'LIMBO':
        return this.checkLimboConditions(gameResult, conditions);
      case 'CRASH':
        return this.checkCrashConditions(gameResult, conditions);
      case 'MINES':
        return this.checkMinesConditions(gameResult, conditions);
      case 'PLINKO':
        return this.checkPlinkoConditions(gameResult, conditions);
      case 'ROULETTE':
        return this.checkRouletteConditions(gameResult, conditions);
      default:
        return Math.random() < (conditions?.chancePerBet || 0.0001);
    }
  }

  private static checkDiceConditions(result: any, conditions: any): boolean {
    const { roll } = result;
    if (conditions.targets?.includes(roll)) return true;
    return Math.random() < (conditions.chancePerBet || 0.001);
  }

  private static checkLimboConditions(result: any, conditions: any): boolean {
    const { multiplier } = result;
    if (conditions.targets?.includes(multiplier)) return true;
    return Math.random() < (conditions.chancePerBet || 0.001);
  }

  private static checkCrashConditions(result: any, conditions: any): boolean {
    const { crashPoint } = result;
    if (conditions.targets?.includes(crashPoint)) return true;
    return Math.random() < (conditions.chancePerBet || 0.001);
  }

  private static checkMinesConditions(result: any, conditions: any): boolean {
    return Math.random() < (conditions.chancePerAction || 0.005);
  }

  private static checkPlinkoConditions(result: any, conditions: any): boolean {
    return Math.random() < (conditions.chancePerBet || 0.001);
  }

  private static checkRouletteConditions(result: any, conditions: any): boolean {
    const { number, color } = result;
    return Math.random() < (conditions.chancePerBet || 0.001);
  }

  /**
   * Award jackpot to winner
   */
  private static async awardJackpot(jackpotId: string, betId: string) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        const jackpot = await Jackpot.findById(jackpotId).session(session);
        const bet = await Bet.findById(betId).session(session);

        if (!jackpot || !bet) return;

        await Jackpot.findByIdAndUpdate(
          jackpotId,
          { status: JackpotStatus.CALCULATING },
          { session }
        );

        await WalletService.creditBalanceWithSession(
          bet.userId.toString(),
          bet.currency,
          jackpot.currentAmount,
          session
        );

        await JackpotWin.create([{
          jackpotId: jackpot._id,
          userId: bet.userId,
          amount: jackpot.currentAmount,
          currency: bet.currency,
        }], { session });

        await Jackpot.findByIdAndUpdate(
          jackpotId,
          {
            currentAmount: 0,
            status: JackpotStatus.REFILLING,
            lastWinnerId: bet.userId,
            lastWinAmount: jackpot.currentAmount,
            lastWinAt: new Date(),
          },
          { session }
        );

        setImmediate(() => {
          jackpotEvents.emit('jackpot-won', {
            userId: bet.userId.toString(),
            amount: jackpot.currentAmount,
            currency: bet.currency,
            gameType: jackpot.gameType,
          });
        });
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get all active jackpots
   */
  static async getAllJackpots() {
    return Jackpot.find().sort({ currentAmount: -1 });
  }

  /**
   * Get jackpot winners
   */
  static async getJackpotWinners(limit = 50) {
    return JackpotWin.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('jackpotId', 'gameType')
      .populate('userId', 'username');
  }
}
