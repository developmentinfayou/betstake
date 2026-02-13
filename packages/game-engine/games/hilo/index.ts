import { BaseGame, BetInput, BetResult } from '../../base-game';
import { generateInt } from '@casino/fairness';

export type HiLoChoice = 'higher' | 'lower' | 'skip';

export interface HiLoParams {
  choice: HiLoChoice;
  currentCard?: number;
  cardHistory?: number[];
  choiceHistory?: HiLoChoice[];
}

export interface HiLoResult {
  currentCard: number;
  nextCard: number;
  won: boolean;
  cardHistory: number[];
  currentMultiplier: number;
  nextMultipliers: { higher: number; lower: number; skip: number };
  suit?: string;
}

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

export class HiLoGame extends BaseGame {
  /**
   * Calculate the probability-based multiplier for a given card and choice.
   * Cards are 1(Ace)-13(King). With 13 possible outcomes:
   * - "higher" (>= current): favorable = (13 - current + 1) = 14 - current
   * - "lower"  (<= current): favorable = current
   * - "skip": always wins, multiplier = 1 (no payout change)
   */
  private getCardMultiplier(cardValue: number, choice: HiLoChoice): number {
    if (choice === 'skip') return 1;

    let favorableOutcomes: number;
    if (choice === 'higher') {
      // Cards >= current (e.g., current=2 → 2,3,...,13 = 12 outcomes)
      favorableOutcomes = 14 - cardValue;
    } else {
      // Cards <= current (e.g., current=12 → 1,2,...,12 = 12 outcomes)
      favorableOutcomes = cardValue;
    }

    // Probability = favorable / 13, fair multiplier = 13 / favorable
    const fairMultiplier = 13 / favorableOutcomes;
    return parseFloat((fairMultiplier * (1 - this.config.houseEdge / 100)).toFixed(4));
  }

  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);

    const params = input.gameParams as HiLoParams;
    const { choice, currentCard, cardHistory = [], choiceHistory = [] } = params;

    // Use proper cursor for HiLo (13 increments as per Stake)
    const hiloSeedData = { ...input.seedData, cursor: 13 };

    const nextCard = generateInt(hiloSeedData, 1, 13);
    const current = currentCard || generateInt({ ...hiloSeedData, nonce: hiloSeedData.nonce + 1 }, 1, 13);

    // Generate suit for visual purposes
    const suitIndex = generateInt({ ...hiloSeedData, nonce: hiloSeedData.nonce + 2 }, 0, 3);
    const suit = suits[suitIndex];

    let won = false;
    if (choice === 'higher') {
      won = nextCard >= current;
    } else if (choice === 'lower') {
      won = nextCard <= current;
    } else if (choice === 'skip') {
      won = true;
    }

    // Compound multiplier: product of all individual card multipliers in the chain
    const newHistory = [...cardHistory, current];
    const newChoiceHistory = [...choiceHistory, choice];
    const compoundMultiplier = this.calculateCompoundMultiplier(newHistory, newChoiceHistory);

    const finalMultiplier = won ? compoundMultiplier : 0;
    const payout = this.calculatePayout(input.amount, finalMultiplier);
    const profit = this.calculateProfit(input.amount, payout);

    // Show next card's multiplier options so frontend can display them
    const nextMultipliers = {
      higher: this.getCardMultiplier(nextCard, 'higher'),
      lower: this.getCardMultiplier(nextCard, 'lower'),
      skip: 1,
    };

    const result: HiLoResult = {
      currentCard: current,
      nextCard,
      won,
      cardHistory: newHistory,
      currentMultiplier: compoundMultiplier,
      nextMultipliers,
      suit,
    };

    return {
      multiplier: finalMultiplier,
      payout,
      profit,
      won,
      gameData: { ...params, choiceHistory: newChoiceHistory },
      result,
    };
  }

  /**
   * Calculate compound multiplier from the full chain of cards and choices.
   * Each step multiplies: (13 / favorableOutcomes) × (1 - houseEdge)
   * Skip steps contribute 1x (no multiplier change).
   */
  private calculateCompoundMultiplier(cardHistory: number[], choiceHistory: HiLoChoice[]): number {
    let multiplier = 1;

    for (let i = 0; i < cardHistory.length; i++) {
      const card = cardHistory[i];
      const choice = choiceHistory[i] || 'skip';
      multiplier *= this.getCardMultiplier(card, choice);
    }

    return parseFloat(multiplier.toFixed(4));
  }
}
