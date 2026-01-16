import { BaseGame, BetInput, BetResult } from '../../base-game';
import { shuffle } from '@casino/fairness';

export interface Card {
  rank: string;
  suit: string;
  value: number;
}

export interface BlackjackParams {
  action: 'deal' | 'hit' | 'stand' | 'double' | 'split';
  handIndex?: number;
}

export interface BlackjackResult {
  dealerHand: Card[];
  playerHands: Card[][];
  dealerTotal: number;
  playerTotals: number[];
  results: Array<{ action: string; multiplier: number; payout: number }>;
}

export class BlackjackGame extends BaseGame {
  private createDeck(seedData: any): Card[] {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];

    for (let i = 0; i < 6; i++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          const value = rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank);
          deck.push({ rank, suit, value });
        }
      }
    }

    // Use proper cursor for Blackjack (13 increments as per Stake)
    const blackjackSeedData = { ...seedData, cursor: 13 };
    return shuffle(deck, blackjackSeedData);
  }

  private calculateTotal(hand: Card[]): number {
    let total = hand.reduce((sum, card) => sum + card.value, 0);
    let aces = hand.filter(card => card.rank === 'A').length;

    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  }

  private isBlackjack(hand: Card[]): boolean {
    return hand.length === 2 && this.calculateTotal(hand) === 21;
  }

  play(input: BetInput): BetResult {
    this.validateBet(input.amount, input.currency);
    
    const deck = this.createDeck(input.seedData);
    const playerHand = [deck[0], deck[2]];
    const dealerHand = [deck[1], deck[3]];

    const playerTotal = this.calculateTotal(playerHand);
    const dealerTotal = this.calculateTotal(dealerHand);

    let multiplier = 0;
    let won = false;

    if (this.isBlackjack(playerHand) && !this.isBlackjack(dealerHand)) {
      multiplier = 2.5;
      won = true;
    } else if (this.isBlackjack(dealerHand) && !this.isBlackjack(playerHand)) {
      multiplier = 0;
      won = false;
    } else if (playerTotal === dealerTotal) {
      multiplier = 1;
      won = false;
    } else if (playerTotal > 21) {
      multiplier = 0;
      won = false;
    } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
      multiplier = 2;
      won = true;
    }

    const payout = this.calculatePayout(input.amount, multiplier);
    const profit = this.calculateProfit(input.amount, payout);

    const result: BlackjackResult = {
      dealerHand,
      playerHands: [playerHand],
      dealerTotal,
      playerTotals: [playerTotal],
      results: [{ action: 'stand', multiplier, payout }],
    };

    return {
      multiplier,
      payout,
      profit,
      won,
      gameData: input.gameParams,
      result,
    };
  }
}
