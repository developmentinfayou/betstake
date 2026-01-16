// BEFORE REFACTORING: apps/frontend/src/app/game/limbo/page.tsx (238 lines)
// AFTER REFACTORING: apps/frontend/src/app/game/limbo/page.tsx (25 lines)

'use client';

import GamePageTemplate from '@/components/templates/GamePageTemplate';
import LimboGameControls, { LimboGameParams } from '@/components/games/limbo/LimboGameControls';

export default function LimboPage() {
  return (
    <GamePageTemplate<LimboGameParams>
      gameType="LIMBO"
      gameTitle="Limbo"
      initialGameParams={{
        targetMultiplier: 2.0,
        winChance: 49.5,
        payout: 20,
      }}
      GameControlsComponent={LimboGameControls}
      gameControlsProps={{ amount: 10 }} // Pass amount to controls
      betModes={['manual', 'auto', 'strategy']}
    />
  );
}

// COMPARISON:
// Before: 238 lines of code (79% duplication)
// After: 25 lines of code (0% duplication)
// Reduction: 89% fewer lines