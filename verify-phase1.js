const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Phase 1 Implementation...\n');

const files = [
  // Database Schemas
  'packages/database/schemas/towersession.schema.ts',
  'packages/database/schemas/stairssession.schema.ts',
  'packages/database/schemas/hilosession.schema.ts',
  
  // Backend Routes
  'apps/backend/src/routes/tower.ts',
  'apps/backend/src/routes/stairs.ts',
  'apps/backend/src/routes/hilo.ts',
  
  // Frontend Components
  'apps/frontend/src/components/games/tower/TowerGameControls.tsx',
  'apps/frontend/src/components/games/stairs/StairsGameControls.tsx',
  'apps/frontend/src/components/games/hilo/HiLoGameControls.tsx',
  
  // Frontend Pages
  'apps/frontend/src/app/game/tower/page.tsx',
  'apps/frontend/src/app/game/stairs/page.tsx',
  'apps/frontend/src/app/game/hilo/page.tsx',
];

let allExist = true;

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);
  if (!exists) allExist = false;
});

console.log('\n' + '='.repeat(60));

if (allExist) {
  console.log('✅ All Phase 1 files exist!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start backend: cd apps/backend && npm run dev');
  console.log('2. Start frontend: cd apps/frontend && npm run dev');
  console.log('3. Follow TEST_PHASE1.md for testing');
  console.log('4. Once tested, proceed to Phase 2: Blackjack');
} else {
  console.log('❌ Some files are missing. Please check the implementation.');
}

console.log('='.repeat(60));
