import { AutoBetConfig } from '@casino/shared';

export interface Strategy {
  id: string;
  name: string;
  description: string;
  config: Partial<AutoBetConfig>;
}

/**
 * Strategy Engine - implements predefined betting strategies
 */
export class StrategyEngine {
  private static strategies: Strategy[] = [
    {
      id: 'martingale',
      name: 'Martingale',
      description: 'Double bet after loss, reset after win',
      config: {
        onWin: { reset: true },
        onLoss: { reset: false, increaseBy: 100 }, // Double (100% increase)
      },
    },
    {
      id: 'reverse-martingale',
      name: 'Reverse Martingale',
      description: 'Double bet after win, reset after loss',
      config: {
        onWin: { reset: false, increaseBy: 100 },
        onLoss: { reset: true },
      },
    },
    {
      id: 'paroli',
      name: 'Paroli',
      description: 'Double bet after win, reset after 3 wins',
      config: {
        onWin: { reset: false, increaseBy: 100 },
        onLoss: { reset: true },
        // Note: 3-win reset logic would need custom implementation
      },
    },
    {
      id: 'dalembert',
      name: "D'Alembert",
      description: 'Increase by 10% after loss, decrease by 10% after win',
      config: {
        onWin: { reset: false, increaseBy: -10 }, // Decrease
        onLoss: { reset: false, increaseBy: 10 },
      },
    },
  ];

  /**
   * Get all available strategies
   */
  static getStrategies(): Strategy[] {
    return this.strategies;
  }

  /**
   * Get strategy by ID
   */
  static getStrategy(id: string): Strategy | undefined {
    return this.strategies.find(s => s.id === id);
  }

  /**
   * Apply strategy to AutoBet config
   */
  static applyStrategy(strategyId: string, baseConfig: AutoBetConfig): AutoBetConfig {
    const strategy = this.getStrategy(strategyId);
    if (!strategy) {
      throw new Error(`Strategy ${strategyId} not found`);
    }

    return {
      ...baseConfig,
      ...strategy.config,
    };
  }
}