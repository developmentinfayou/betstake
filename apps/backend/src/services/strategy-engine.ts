import { Strategy, IStrategy } from '@casino/database';
import { StrategyConditionBlock, ConditionAction } from '@casino/shared';

/**
 * Session state tracked during an autobet run with a strategy
 */
export interface StrategySessionState {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  currentStreak: number;       // count of consecutive same-result outcomes
  streakType: 'wins' | 'losses' | null;
  totalProfit: number;         // net profit/loss since session start
  currentBalance: number;
  initialAmount: number;       // base bet amount for reset
  currentAmount: number;       // current bet amount
  // Track which 'first_streak_of' conditions have already fired
  firedFirstStreaks: Set<string>;
}

export interface ActionResult {
  action: ConditionAction;
  newAmount?: number;
  shouldStop?: boolean;
}

const MIN_BET = 0.01;

/**
 * Strategy Engine — evaluates condition blocks against session state
 */
export class StrategyEngine {

  /**
   * Seed preset strategies into DB if they don't exist
   */
  static async seedPresets(): Promise<void> {
    const existing = await Strategy.countDocuments({ isPreset: true });
    if (existing >= 4) {
      console.log('[Strategy] Presets already seeded');
      return;
    }

    // Clear old presets and re-seed
    await Strategy.deleteMany({ isPreset: true });

    const presets: Array<{ name: string; conditions: StrategyConditionBlock[] }> = [
      {
        name: 'Martingale',
        conditions: [
          {
            id: 'c1', type: 'bet',
            betTrigger: { frequency: 'every', value: 1, target: 'losses' },
            action: 'increase_bet_amount', actionValue: 100,
          },
          {
            id: 'c2', type: 'bet',
            betTrigger: { frequency: 'every', value: 1, target: 'wins' },
            action: 'reset_bet_amount',
          },
        ],
      },
      {
        name: 'Delayed Martingale',
        conditions: [
          {
            id: 'c1', type: 'bet',
            betTrigger: { frequency: 'first_streak_of', value: 2, target: 'losses' },
            action: 'increase_bet_amount', actionValue: 100,
          },
          {
            id: 'c2', type: 'bet',
            betTrigger: { frequency: 'every', value: 1, target: 'wins' },
            action: 'reset_bet_amount',
          },
        ],
      },
      {
        name: 'Paroli',
        conditions: [
          {
            id: 'c1', type: 'bet',
            betTrigger: { frequency: 'every', value: 1, target: 'wins' },
            action: 'increase_bet_amount', actionValue: 100,
          },
          {
            id: 'c2', type: 'bet',
            betTrigger: { frequency: 'first_streak_of', value: 3, target: 'wins' },
            action: 'reset_bet_amount',
          },
          {
            id: 'c3', type: 'bet',
            betTrigger: { frequency: 'every', value: 1, target: 'losses' },
            action: 'reset_bet_amount',
          },
        ],
      },
      {
        name: "D'Alembert",
        conditions: [
          {
            id: 'c1', type: 'bet',
            betTrigger: { frequency: 'every', value: 1, target: 'losses' },
            action: 'add_to_bet_amount', actionValue: 1,
          },
          {
            id: 'c2', type: 'bet',
            betTrigger: { frequency: 'every', value: 1, target: 'wins' },
            action: 'subtract_from_bet_amount', actionValue: 1,
          },
        ],
      },
    ];

    for (const preset of presets) {
      await Strategy.create({
        userId: 'system',
        name: preset.name,
        conditions: preset.conditions,
        isPreset: true,
      });
    }

    console.log('[Strategy] ✅ Seeded 4 preset strategies');
  }

  /**
   * Get all strategies for a user (presets + their custom ones)
   */
  static async getStrategiesForUser(userId: string): Promise<IStrategy[]> {
    return Strategy.find({
      $or: [
        { isPreset: true },
        { userId },
      ],
    }).sort({ isPreset: -1, createdAt: 1 });
  }

  /**
   * Get a single strategy by ID
   */
  static async getStrategy(id: string): Promise<IStrategy | null> {
    return Strategy.findById(id);
  }

  /**
   * Create a custom strategy
   */
  static async createStrategy(userId: string, name: string, conditions: StrategyConditionBlock[]): Promise<IStrategy> {
    return Strategy.create({ userId, name, conditions, isPreset: false });
  }

  /**
   * Update a custom strategy (only owner)
   */
  static async updateStrategy(id: string, userId: string, name: string, conditions: StrategyConditionBlock[]): Promise<IStrategy | null> {
    return Strategy.findOneAndUpdate(
      { _id: id, userId, isPreset: false },
      { name, conditions },
      { new: true }
    );
  }

  /**
   * Delete a custom strategy (only owner, not presets)
   */
  static async deleteStrategy(id: string, userId: string): Promise<boolean> {
    const result = await Strategy.deleteOne({ _id: id, userId, isPreset: false });
    return result.deletedCount > 0;
  }

  /**
   * Create initial session state
   */
  static createSessionState(initialAmount: number, currentBalance: number): StrategySessionState {
    return {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      currentStreak: 0,
      streakType: null,
      totalProfit: 0,
      currentBalance,
      initialAmount,
      currentAmount: initialAmount,
      firedFirstStreaks: new Set(),
    };
  }

  /**
   * Update session state after a bet result
   */
  static updateSessionState(state: StrategySessionState, won: boolean, profit: number, newBalance: number): void {
    state.totalGames++;
    state.totalProfit += profit;
    state.currentBalance = newBalance;

    if (won) {
      state.totalWins++;
      if (state.streakType === 'wins') {
        state.currentStreak++;
      } else {
        state.streakType = 'wins';
        state.currentStreak = 1;
        // Reset fired first-streak trackers for losses when streak type changes
        state.firedFirstStreaks.forEach(key => {
          if (key.includes(':losses')) state.firedFirstStreaks.delete(key);
        });
      }
    } else {
      state.totalLosses++;
      if (state.streakType === 'losses') {
        state.currentStreak++;
      } else {
        state.streakType = 'losses';
        state.currentStreak = 1;
        state.firedFirstStreaks.forEach(key => {
          if (key.includes(':wins')) state.firedFirstStreaks.delete(key);
        });
      }
    }
  }

  /**
   * Evaluate all conditions in a strategy against the current session state.
   * Returns the new bet amount and whether to stop.
   * Conditions are evaluated top-down; multiple can fire.
   */
  static evaluateConditions(
    conditions: StrategyConditionBlock[],
    state: StrategySessionState,
  ): { newAmount: number; shouldStop: boolean } {
    let amount = state.currentAmount;
    let shouldStop = false;

    for (const condition of conditions) {
      if (shouldStop) break;

      const triggered = this.isConditionTriggered(condition, state);
      if (!triggered) continue;

      // Apply the action
      const result = this.applyAction(condition.action, condition.actionValue, amount, state.initialAmount);
      amount = result.newAmount;
      if (result.shouldStop) shouldStop = true;
    }

    // Clamp to minimum bet
    if (amount < MIN_BET && !shouldStop) {
      amount = MIN_BET;
    }

    return { newAmount: amount, shouldStop };
  }

  /**
   * Check if a single condition's trigger is satisfied
   */
  private static isConditionTriggered(condition: StrategyConditionBlock, state: StrategySessionState): boolean {
    if (condition.type === 'bet' && condition.betTrigger) {
      return this.isBetTriggerSatisfied(condition, state);
    }
    if (condition.type === 'profit' && condition.profitTrigger) {
      return this.isProfitTriggerSatisfied(condition, state);
    }
    return false;
  }

  /**
   * Evaluate a bet-type trigger
   */
  private static isBetTriggerSatisfied(condition: StrategyConditionBlock, state: StrategySessionState): boolean {
    const trigger = condition.betTrigger!;
    const { frequency, value, target } = trigger;

    // 'bets' target fires on every bet regardless of win/loss
    const currentMatchesTarget = target === 'bets' || state.streakType === target;
    if (!currentMatchesTarget) return false;

    switch (frequency) {
      case 'every':
        // Fire every N of the target type
        const count = target === 'bets' ? state.totalGames : (target === 'wins' ? state.totalWins : state.totalLosses);
        return value > 0 && count % value === 0;

      case 'every_streak_of':
        // Fire every time streak reaches exactly N of the target type
        return state.currentStreak === value;

      case 'first_streak_of': {
        // Fire only the FIRST time a streak of N is reached (per streak occurrence)
        const key = `${condition.id}:${target}`;
        if (state.currentStreak === value && !state.firedFirstStreaks.has(key)) {
          state.firedFirstStreaks.add(key);
          return true;
        }
        return false;
      }

      case 'streak_greater_than':
        return state.currentStreak > value;

      case 'streak_lower_than':
        return state.currentStreak < value && state.currentStreak > 0;

      default:
        return false;
    }
  }

  /**
   * Evaluate a profit-type trigger
   */
  private static isProfitTriggerSatisfied(condition: StrategyConditionBlock, state: StrategySessionState): boolean {
    const trigger = condition.profitTrigger!;
    const { source, operator, value } = trigger;

    let sourceValue: number;
    switch (source) {
      case 'balance':
        sourceValue = state.currentBalance;
        break;
      case 'profit':
        sourceValue = state.totalProfit;
        break;
      case 'loss':
        sourceValue = state.totalProfit < 0 ? Math.abs(state.totalProfit) : 0;
        break;
      default:
        return false;
    }

    switch (operator) {
      case 'greater_than':
        return sourceValue > value;
      case 'greater_than_or_equal':
        return sourceValue >= value;
      case 'less_than':
        return sourceValue < value;
      case 'less_than_or_equal':
        return sourceValue <= value;
      default:
        return false;
    }
  }

  /**
   * Apply an action and return the new bet amount
   */
  private static applyAction(
    action: ConditionAction,
    actionValue: number | undefined,
    currentAmount: number,
    initialAmount: number,
  ): { newAmount: number; shouldStop: boolean } {
    const val = actionValue || 0;

    switch (action) {
      case 'increase_bet_amount':
        // Increase by percentage
        return { newAmount: currentAmount * (1 + val / 100), shouldStop: false };

      case 'decrease_bet_amount':
        // Decrease by percentage
        return { newAmount: currentAmount * (1 - val / 100), shouldStop: false };

      case 'add_to_bet_amount':
        // Add absolute value
        return { newAmount: currentAmount + val, shouldStop: false };

      case 'subtract_from_bet_amount':
        // Subtract absolute value
        return { newAmount: Math.max(MIN_BET, currentAmount - val), shouldStop: false };

      case 'set_bet_amount':
        // Set to exact value
        return { newAmount: Math.max(MIN_BET, val), shouldStop: false };

      case 'reset_bet_amount':
        // Reset to initial amount
        return { newAmount: initialAmount, shouldStop: false };

      case 'stop_autobet':
        return { newAmount: currentAmount, shouldStop: true };

      default:
        return { newAmount: currentAmount, shouldStop: false };
    }
  }
}