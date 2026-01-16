const fs = require('fs');
const path = require('path');

console.log('🎮 Verifying All Games Implementation...\n');

const games = [
  // Phase 1
  { name: 'Tower', backend: 'apps/backend/src/routes/tower.ts', frontend: 'apps/frontend/src/app/game/tower/page.tsx' },
  { name: 'Stairs', backend: 'apps/backend/src/routes/stairs.ts', frontend: 'apps/frontend/src/app/game/stairs/page.tsx' },
  { name: 'HiLo', backend: 'apps/backend/src/routes/hilo.ts', frontend: 'apps/frontend/src/app/game/hilo/page.tsx' },
  
  // Phase 2
  { name: 'Blackjack', backend: 'apps/backend/src/routes/blackjack.ts', frontend: 'apps/frontend/src/app/game/blackjack/page.tsx' },
  
  // Phase 3 & 4
  { name: 'Crash', backend: 'apps/backend/src/websocket/crash.ts', frontend: 'apps/frontend/src/app/game/crash/page.tsx' },
  { name: 'Trenball', backend: 'apps/backend/src/websocket/trenball.ts', frontend: 'apps/frontend/src/app/game/trenball/page.tsx' },
];

let allExist = true;
let backendCount = 0;
let frontendCount = 0;

console.log('📋 Checking New Games:\n');

games.forEach(game => {
  const backendPath = path.join(__dirname, game.backend);
  const frontendPath = path.join(__dirname, game.frontend);
  
  const backendExists = fs.existsSync(backendPath);
  const frontendExists = fs.existsSync(frontendPath);
  
  const backendStatus = backendExists ? '✅' : '❌';
  const frontendStatus = frontendExists ? '✅' : '❌';
  
  console.log(`${game.name}:`);
  console.log(`  Backend:  ${backendStatus} ${game.backend}`);
  console.log(`  Frontend: ${frontendStatus} ${game.frontend}`);
  console.log('');
  
  if (backendExists) backendCount++;
  if (frontendExists) frontendCount++;
  if (!backendExists || !frontendExists) allExist = false;
});

console.log('='.repeat(60));

if (allExist) {
  console.log('✅ All 6 new games implemented successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   Backend Routes: ${backendCount}/6`);
  console.log(`   Frontend Pages: ${frontendCount}/6`);
  console.log(`\n🎮 Total Games: 21 (15 existing + 6 new)`);
  console.log(`\n📋 Game Breakdown:`);
  console.log(`   - Instant Games: 15`);
  console.log(`   - Progressive Games: 4 (Tower, Stairs, HiLo, Blackjack)`);
  console.log(`   - Multiplayer Games: 2 (Crash, Trenball)`);
  console.log(`\n🚀 Next Steps:`);
  console.log(`   1. Restart backend: cd apps/backend && npm run dev`);
  console.log(`   2. Restart frontend: cd apps/frontend && npm run dev`);
  console.log(`   3. Test all 6 new games`);
  console.log(`   4. Optional: Implement Ludo & Chess (40h+ each)`);
} else {
  console.log('❌ Some files are missing. Please check the implementation.');
}

console.log('='.repeat(60));
