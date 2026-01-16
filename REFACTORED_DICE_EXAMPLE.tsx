// BEFORE REFACTORING: apps/frontend/src/app/game/dice/page.tsx (245 lines)
// AFTER REFACTORING: apps/frontend/src/app/game/dice/page.tsx (25 lines)

'use client';

import GamePageTemplate from '@/components/templates/GamePageTemplate';
import DiceGameControls, { DiceGameParams } from '@/components/games/dice/DiceGameControls';

export default function DicePage() {
  return (
    <GamePageTemplate<DiceGameParams>
      gameType="DICE"
      gameTitle="Dice"
      initialGameParams={{
        multiplier: 2.0,
        winChance: 49.5,
        target: 50.5,
        isOver: true,
      }}
      GameControlsComponent={DiceGameControls}
      betModes={['manual', 'auto', 'strategy']}
    />
  );
}

// COMPARISON:
// Before: 245 lines of code (80% duplication)
// After: 25 lines of code (0% duplication)
// Reduction: 90% fewer lines
// Maintenance: Single source of truth for all game logic