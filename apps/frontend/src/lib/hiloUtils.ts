export interface ProbabilityResult {
  higherPercent: number;
  lowerPercent: number;
  samePercent: number;
}

export function calculateProbabilities(currentCard: number, usedCards: number[] = []): ProbabilityResult {
  // Standard deck has 4 cards of each value (1-13)
  const totalCardsPerValue = 4;
  const totalCards = 52;
  
  // Count remaining cards
  const cardCounts = Array(14).fill(totalCardsPerValue); // Index 0 unused, 1-13 for card values
  cardCounts[0] = 0; // No card with value 0
  
  // Remove used cards
  usedCards.forEach(card => {
    if (card >= 1 && card <= 13) {
      cardCounts[card] = Math.max(0, cardCounts[card] - 1);
    }
  });
  
  // Remove current card
  cardCounts[currentCard] = Math.max(0, cardCounts[currentCard] - 1);
  
  // Calculate remaining cards
  const remainingCards = cardCounts.reduce((sum, count) => sum + count, 0);
  
  if (remainingCards === 0) {
    return { higherPercent: 0, lowerPercent: 0, samePercent: 0 };
  }
  
  // Count higher, lower, and same value cards
  let higherCount = 0;
  let lowerCount = 0;
  let sameCount = cardCounts[currentCard];
  
  for (let i = 1; i <= 13; i++) {
    if (i > currentCard) {
      higherCount += cardCounts[i];
    } else if (i < currentCard) {
      lowerCount += cardCounts[i];
    }
  }
  
  // Calculate percentages
  const higherPercent = (higherCount / remainingCards) * 100;
  const lowerPercent = (lowerCount / remainingCards) * 100;
  const samePercent = (sameCount / remainingCards) * 100;
  
  return {
    higherPercent: Math.round(higherPercent * 100) / 100,
    lowerPercent: Math.round(lowerPercent * 100) / 100,
    samePercent: Math.round(samePercent * 100) / 100
  };
}

export function calculateMultiplier(cardsPlayed: number, skipped: boolean = false): number {
  if (cardsPlayed === 0) return 1;

  let multiplier = 1;
  for (let i = 0; i < cardsPlayed; i++) {
    multiplier *= 1.3;
  }

  if (skipped) {
    multiplier *= 0.8;
  }

  return parseFloat((multiplier * 0.99).toFixed(4));
}