import { Currency } from './types';

/**
 * Format currency amount with proper decimals
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const decimals = {
    BTC: 8,
    ETH: 6,
    LTC: 6,
    USDT: 2,
    USD: 2,
    EUR: 2,
  };

  return amount.toFixed(decimals[currency] || 2);
}

/**
 * Convert crypto to fiat equivalent
 */
export function convertToFiat(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: Record<string, number>
): number {
  const key = `${fromCurrency}_${toCurrency}`;
  const rate = rates[key] || 1;
  return amount * rate;
}

/**
 * Calculate profit percentage
 */
export function calculateProfitPercentage(profit: number, wagered: number): number {
  if (wagered === 0) return 0;
  return (profit / wagered) * 100;
}

/**
 * Generate shareable game URL
 */
export function generateShareUrl(gameType: string, betId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/game/${gameType}?bet=${betId}`;
}

/**
 * Validate bet amount
 */
export function validateBetAmount(
  amount: number,
  min: number,
  max: number
): { valid: boolean; error?: string } {
  if (amount < min) {
    return { valid: false, error: `Minimum bet is ${min}` };
  }
  if (amount > max) {
    return { valid: false, error: `Maximum bet is ${max}` };
  }
  return { valid: true };
}

/**
 * Calculate rakeback amount
 */
export function calculateRakeback(
  wagered: number,
  houseEdge: number,
  rakebackPercent: number
): number {
  const houseProfit = wagered * (houseEdge / 100);
  return houseProfit * (rakebackPercent / 100);
}

/**
 * Calculate VIP level from XP
 */
export function calculateVipLevel(xp: number): number {
  // Example: 1000 XP per level
  return Math.floor(xp / 1000) + 1;
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(endDate: Date): string {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
