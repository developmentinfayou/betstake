import { Wallet, Currency, Transaction } from '@casino/database';
import Decimal from 'decimal.js';
import mongoose from 'mongoose';

/**
 * Wallet Service - manages user balances
 */
export class WalletService {
  /**
   * Get or create wallet for user
   */
  static async getWallet(userId: string, currency: Currency) {
    let wallet = await Wallet.findOne({ userId, currency });

    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        currency,
        balance: 0,
        lockedBalance: 0,
      });
    }

    return wallet;
  }

  /**
   * Debit balance and lock funds (atomic, within transaction)
   */
  static async debitAndLockBalance(
    session: mongoose.ClientSession,
    userId: string,
    currency: Currency,
    amount: number
  ) {
    const amountDecimal = new Decimal(amount);
    const wallet = await Wallet.findOne({ userId, currency }).session(session);
    if (!wallet) throw new Error(`Wallet not found for ${currency}`);

    const currentBalance = new Decimal(wallet.balance);
    const currentLocked = new Decimal(wallet.lockedBalance);
    if (currentBalance.lessThan(amountDecimal)) throw new Error('Insufficient balance');

    const newBalance = currentBalance.minus(amountDecimal);
    const newLocked = currentLocked.plus(amountDecimal);

    wallet.balance = newBalance.toNumber();
    wallet.lockedBalance = newLocked.toNumber();
    await wallet.save({ session });

    await Transaction.create([{
      userId,
      walletId: wallet._id,
      amount: amountDecimal.toNumber(),
      type: 'bet-reserve',
      beforeAmount: currentBalance.toNumber(),
      afterAmount: newBalance.toNumber(),
      meta: { currency },
    }], { session });

    return wallet;
  }

  /**
   * Credit payout and unlock funds (atomic, within transaction)
   */
  static async creditAndUnlockBalance(
    session: mongoose.ClientSession,
    userId: string,
    walletId: string,
    currency: Currency,
    betAmount: number,
    payoutAmount: number
  ) {
    const betDecimal = new Decimal(betAmount);
    const payoutDecimal = new Decimal(payoutAmount);
    const wallet = await Wallet.findById(walletId).session(session);
    if (!wallet) throw new Error('Wallet not found');

    const currentBalance = new Decimal(wallet.balance);
    const currentLocked = new Decimal(wallet.lockedBalance);
    const newBalance = currentBalance.plus(payoutDecimal);
    const newLocked = currentLocked.minus(betDecimal);

    wallet.balance = newBalance.toNumber();
    wallet.lockedBalance = newLocked.toNumber();
    await wallet.save({ session });

    await Transaction.create([{
      userId,
      walletId,
      amount: payoutDecimal.toNumber(),
      type: 'payout',
      beforeAmount: currentBalance.toNumber(),
      afterAmount: newBalance.toNumber(),
      meta: { currency, betAmount, payoutAmount },
    }], { session });

    return wallet;
  }

  /**
   * Release locked balance on loss (atomic, within transaction)
   */
  static async releaseLockOnLoss(
    session: mongoose.ClientSession,
    userId: string,
    walletId: string,
    currency: Currency,
    amount: number
  ) {
    const amountDecimal = new Decimal(amount);
    const wallet = await Wallet.findById(walletId).session(session);
    if (!wallet) throw new Error('Wallet not found');

    const currentBalance = new Decimal(wallet.balance);
    const currentLocked = new Decimal(wallet.lockedBalance);
    const newLocked = currentLocked.minus(amountDecimal);
    if (newLocked.lessThan(0)) throw new Error('Invalid locked balance state');

    wallet.lockedBalance = newLocked.toNumber();
    await wallet.save({ session });

    await Transaction.create([{
      userId,
      walletId,
      amount: amountDecimal.negated().toNumber(),
      type: 'bet-loss',
      beforeAmount: currentBalance.toNumber(),
      afterAmount: currentBalance.toNumber(),
      meta: { currency, lostAmount: amount },
    }], { session });

    return wallet;
  }

  /**
   * Get all wallets for user
   */
  static async getAllWallets(userId: string) {
    return Wallet.find({ userId });
  }

  /**
   * Add balance
   */
  static async addBalance(userId: string, currency: Currency, amount: number) {
    const wallet = await this.getWallet(userId, currency);
    wallet.balance += amount;
    return wallet.save();
  }

  /**
   * Subtract balance
   */
  static async subtractBalance(userId: string, currency: Currency, amount: number) {
    const wallet = await this.getWallet(userId, currency);

    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    wallet.balance -= amount;
    return wallet.save();
  }

  /**
   * Lock balance (for pending bets)
   */
  static async lockBalance(userId: string, currency: Currency, amount: number) {
    const wallet = await this.getWallet(userId, currency);

    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    wallet.balance -= amount;
    wallet.lockedBalance += amount;
    return wallet.save();
  }

  /**
   * Unlock balance (after bet completion)
   */
  static async unlockBalance(userId: string, currency: Currency, amount: number) {
    const wallet = await this.getWallet(userId, currency);
    wallet.lockedBalance -= amount;
    return wallet.save();
  }

  /**
   * Get available balance
   */
  static async getAvailableBalance(userId: string, currency: Currency): Promise<number> {
    const wallet = await this.getWallet(userId, currency);
    return wallet.balance;
  }

  /**
   * Debit balance (no transaction)
   */
  static async debitBalance(userId: string, currency: Currency, amount: number) {
    const wallet = await this.getWallet(userId, currency);
    if (wallet.balance < amount) throw new Error('Insufficient balance');
    
    wallet.balance -= amount;
    return wallet.save();
  }

  /**
   * Credit balance (no transaction)
   */
  static async creditBalance(userId: string, walletId: string, currency: Currency, amount: number) {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new Error('Wallet not found');
    
    wallet.balance += amount;
    return wallet.save();
  }

  /**
   * Debit balance with session support
   */
  static async debitBalanceWithSession(userId: string, currency: Currency, amount: number, session: mongoose.ClientSession) {
    const wallet = await Wallet.findOne({ userId, currency }).session(session);
    if (!wallet) {
      // Create wallet if it doesn't exist
      const [newWallet] = await Wallet.create([{
        userId,
        currency,
        balance: 0,
        lockedBalance: 0,
      }], { session });
      throw new Error('Insufficient balance');
    }
    
    if (wallet.balance < amount) throw new Error('Insufficient balance');
    
    wallet.balance -= amount;
    await wallet.save({ session });
    return wallet;
  }

  /**
   * Credit balance with session support
   */
  static async creditBalanceWithSession(userId: string, currency: Currency, amount: number, session: mongoose.ClientSession) {
    const wallet = await Wallet.findOne({ userId, currency }).session(session);
    if (!wallet) {
      const [newWallet] = await Wallet.create([{
        userId,
        currency,
        balance: amount,
        lockedBalance: 0,
      }], { session });
      return newWallet;
    }
    
    wallet.balance += amount;
    await wallet.save({ session });
    return wallet;
  }

  /**
   * Get wallet with session support
   */
  static async getWalletWithSession(userId: string, currency: Currency, session: mongoose.ClientSession) {
    let wallet = await Wallet.findOne({ userId, currency }).session(session);
    
    if (!wallet) {
      const [newWallet] = await Wallet.create([{
        userId,
        currency,
        balance: 0,
        lockedBalance: 0,
      }], { session });
      return newWallet;
    }
    
    return wallet;
  }
}
