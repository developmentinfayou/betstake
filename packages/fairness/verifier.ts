import crypto from 'crypto';

/**
 * Stake-Compatible Game Verifier
 * Reconstructs game results from seed data for all games
 * 
 * IMPORTANT: This verifier MUST exactly mirror the RNG calls made by each
 * game engine in packages/game-engine/games/. Any divergence will cause
 * verification mismatches.
 */

export interface VerificationInput {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  gameType: string;
  gameParams?: any;
}

export interface VerificationResult {
  gameType: string;
  result: any;
  floats: number[];
  hmac: string;
  explanation: string;
}

// Generate HMAC for specific round
function generateHmac(serverSeed: string, clientSeed: string, nonce: number, round: number): string {
  const message = `${clientSeed}:${nonce}:${round}`;
  return crypto.createHmac('sha256', serverSeed).update(message).digest('hex');
}

// Generate bytes using cursor system (matches rng.ts byteGenerator exactly)
function generateBytes(serverSeed: string, clientSeed: string, nonce: number, count: number, cursor: number = 0): Buffer {
  const bytes: number[] = [];
  let currentCursor = cursor;

  while (bytes.length < count) {
    const currentRound = Math.floor(currentCursor / 32);
    const hmac = generateHmac(serverSeed, clientSeed, nonce, currentRound);
    const buffer = Buffer.from(hmac, 'hex');
    const position = currentCursor % 32;

    for (let i = position; i < 32 && bytes.length < count; i++) {
      bytes.push(buffer[i]);
      currentCursor++;
    }
  }

  return Buffer.from(bytes);
}

// Generate floats from bytes (matches rng.ts generateFloats exactly)
function generateFloats(serverSeed: string, clientSeed: string, nonce: number, count: number, cursor: number = 0): number[] {
  const bytes = generateBytes(serverSeed, clientSeed, nonce, count * 4, cursor);
  const floats: number[] = [];

  for (let i = 0; i < count; i++) {
    const value = bytes.readUInt32BE(i * 4);
    floats.push(value / 0x100000000);
  }

  return floats;
}

// Generate a single float (matches rng.ts generateFloat)
function generateFloat(serverSeed: string, clientSeed: string, nonce: number, cursor: number = 0): number {
  return generateFloats(serverSeed, clientSeed, nonce, 1, cursor)[0];
}

// Generate random integer in range [min, max] inclusive (matches rng.ts generateInt)
function generateInt(serverSeed: string, clientSeed: string, nonce: number, min: number, max: number, cursor: number = 0): number {
  const float = generateFloat(serverSeed, clientSeed, nonce, cursor);
  return Math.floor(float * (max - min + 1)) + min;
}

/**
 * Fisher-Yates shuffle (matches rng.ts shuffle EXACTLY)
 * Uses floats[i] indexing — NOT floats[length-1-i]
 */
function shuffle<T>(array: T[], floats: number[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(floats[i] * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================================================
// GAME VERIFIERS
// Each verifier mirrors the exact RNG calls from its game engine counterpart
// ============================================================================

// DICE — matches games/dice/index.ts
// Uses: generateFloat with cursor=0
function verifyDice(input: VerificationInput): VerificationResult {
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 1, 0);
  const roll = Math.floor(floats[0] * 10001) / 100;

  return {
    gameType: 'DICE',
    result: { roll: parseFloat(roll.toFixed(2)) },
    floats,
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Roll = floor(${floats[0].toFixed(10)} * 10001) / 100 = ${roll.toFixed(2)}`
  };
}

// LIMBO — matches games/limbo/index.ts
// Uses: generateFloat with cursor=0, Stake formula: (1/float) * houseEdge
function verifyLimbo(input: VerificationInput): VerificationResult {
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 1, 0);
  const houseEdge = 0.99;
  const floatPoint = (1 / floats[0]) * houseEdge;
  const crashPoint = Math.floor(floatPoint * 100) / 100;
  const result = Math.max(crashPoint, 1.00);

  return {
    gameType: 'LIMBO',
    result: { crashPoint: parseFloat(result.toFixed(2)) },
    floats,
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Result = max(floor((1 / ${floats[0].toFixed(10)}) * 0.99 * 100) / 100, 1.00) = ${result.toFixed(2)}x`
  };
}

// MINES — matches games/mines/index.ts
// Uses: shuffle with cursor=3, shuffles boolean array [true...false]
function verifyMines(input: VerificationInput): VerificationResult {
  const gridSize = input.gameParams?.gridSize || 25;
  const minesCount = input.gameParams?.minesCount || 5;

  // Game engine uses cursor: 3 for Mines
  const cursor = 3;
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, gridSize, cursor);

  // Game engine shuffles a boolean array: [true, true, ..., false, false, ...]
  const tiles: boolean[] = Array(gridSize).fill(false);
  for (let i = 0; i < minesCount; i++) {
    tiles[i] = true;
  }

  // Fisher-Yates shuffle (same as rng.ts shuffle)
  const grid = shuffle(tiles, floats);

  const minePositions = grid.map((isMine, idx) => isMine ? idx : -1).filter(x => x >= 0);

  return {
    gameType: 'MINES',
    result: { grid, minePositions, gridSize, minesCount },
    floats: floats.slice(0, 10),
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Mine positions: [${minePositions.join(', ')}] (${minesCount} mines in ${gridSize} tiles, cursor=${cursor})`
  };
}

// KENO — matches games/keno/index.ts
// Uses: shuffle with cursor=2
function verifyKeno(input: VerificationInput): VerificationResult {
  // Game engine uses cursor: 2 for Keno
  const cursor = 2;
  const allNumbers = Array.from({ length: 40 }, (_, i) => i + 1);
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 40, cursor);
  const shuffled = shuffle(allNumbers, floats);
  const drawnNumbers = shuffled.slice(0, 10).sort((a, b) => a - b);

  return {
    gameType: 'KENO',
    result: { drawnNumbers },
    floats: floats.slice(0, 10),
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Drawn numbers: [${drawnNumbers.join(', ')}] (cursor=${cursor})`
  };
}

// PLINKO — matches games/plinko/index.ts
// Uses: generateFloats with cursor=0, float < 0.5 = left, else right
function verifyPlinko(input: VerificationInput): VerificationResult {
  const rows = input.gameParams?.rows || 12;
  const superMode = input.gameParams?.superMode || false;
  const payoutSeed = input.gameParams?.payoutSeed;

  // Game engine uses cursor: 0 for Plinko
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, rows, 0);

  const path = floats.map(f => f < 0.5 ? 0 : 1);
  const finalSlot = path.reduce((sum, dir) => sum + dir, 0);

  let explanation = `Path: ${path.map(d => d === 0 ? 'L' : 'R').join('')} → Slot ${finalSlot}`;

  if (superMode && payoutSeed) {
    explanation += ` | Super Mode with payout seed: ${payoutSeed}`;
  }

  return {
    gameType: 'PLINKO',
    result: { path, finalSlot, rows, superMode, payoutSeed },
    floats,
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation
  };
}

// ROULETTE — matches games/roulette/index.ts
// Uses: generateInt(seedData, 0, 36) with cursor=0
function verifyRoulette(input: VerificationInput): VerificationResult {
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 1, 0);
  // generateInt(seedData, 0, 36) = floor(float * 37)
  const pocket = Math.floor(floats[0] * 37);

  return {
    gameType: 'ROULETTE',
    result: { pocket },
    floats,
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Pocket = floor(${floats[0].toFixed(10)} * 37) = ${pocket}`
  };
}

// WHEEL — matches games/wheel/index.ts
// Uses: generateInt(seedData, 0, segments-1) with cursor=0
// generateInt(seed, 0, segments-1) = floor(float * ((segments-1) - 0 + 1)) + 0 = floor(float * segments)
function verifyWheel(input: VerificationInput): VerificationResult {
  const segments = input.gameParams?.segments || 10;
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 1, 0);
  const segment = Math.floor(floats[0] * segments);

  return {
    gameType: 'WHEEL',
    result: { segment, segments },
    floats,
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Segment = floor(${floats[0].toFixed(10)} * ${segments}) = ${segment}`
  };
}

// COINFLIP — matches games/coinflip/index.ts
// Uses: generateFloat with cursor=0
function verifyCoinFlip(input: VerificationInput): VerificationResult {
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 1, 0);
  const result = floats[0] < 0.5 ? 'heads' : 'tails';

  return {
    gameType: 'COINFLIP',
    result: { result },
    floats,
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Result = ${floats[0].toFixed(10)} < 0.5 ? 'heads' : 'tails' = ${result}`
  };
}

// FASTPARITY — matches games/fastparity/index.ts
// Uses: generateInt(seedData, 0, 9) with cursor=0
function verifyFastParity(input: VerificationInput): VerificationResult {
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 1, 0);
  // generateInt(seedData, 0, 9) = floor(float * 10)
  const number = Math.floor(floats[0] * 10);

  // Color mapping from game engine
  let color: string;
  if (number === 0 || number === 5) {
    color = 'violet';
  } else if ([1, 3, 7, 9].includes(number)) {
    color = 'green';
  } else {
    color = 'red';
  }

  return {
    gameType: 'FASTPARITY',
    result: { number, color },
    floats,
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Number = floor(${floats[0].toFixed(10)} * 10) = ${number} (${color})`
  };
}

// CRASH / SOLOCRASH / RUSH — matches games/crash/index.ts & games/solocrash/index.ts
// Uses: generateFloat with cursor=0
function verifyCrash(input: VerificationInput): VerificationResult {
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 1, 0);
  const houseEdge = 0.99;
  const crashPoint = Math.max(1.01, (99 * houseEdge) / (100 * floats[0]));
  const result = Math.min(parseFloat(crashPoint.toFixed(2)), 10000);

  return {
    gameType: input.gameType,
    result: { crashPoint: result },
    floats,
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Crash Point = min(max((99 * 0.99) / (100 * ${floats[0].toFixed(10)}), 1.01), 10000) = ${result}x`
  };
}

// BALLOON — matches games/balloon/index.ts
// Uses: generateFloat with cursor=0
function verifyBalloon(input: VerificationInput): VerificationResult {
  const maxPumps = input.gameParams?.maxPumps || 100;
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 1, 0);
  const burstAt = Math.floor(floats[0] * maxPumps) + 1;

  return {
    gameType: 'BALLOON',
    result: { burstAt, maxPumps },
    floats,
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Burst at pump = floor(${floats[0].toFixed(10)} * ${maxPumps}) + 1 = ${burstAt}`
  };
}

// TOWER — matches games/tower/index.ts
// Uses: shuffle with cursor=3, nonce + floor for each floor
function verifyTower(input: VerificationInput): VerificationResult {
  const floors = input.gameParams?.floors || 8;
  const cursor = 3;
  const totalTiles = floors * 3;
  const grid = Array(totalTiles).fill(false);
  const allFloats: number[] = [];

  // Game engine creates per-floor shuffle: shuffle([0,1,2], { cursor: 3, nonce: nonce + floor })
  for (let floor = 0; floor < floors; floor++) {
    const floorNonce = input.nonce + floor;
    const floorFloats = generateFloats(input.serverSeed, input.clientSeed, floorNonce, 3, cursor);
    allFloats.push(...floorFloats);

    const positions = [0, 1, 2];
    const shuffled = shuffle(positions, floorFloats);

    // First 2 positions in shuffled result are danger
    grid[floor * 3 + shuffled[0]] = true;
    grid[floor * 3 + shuffled[1]] = true;
  }

  const dangerPositions = grid.map((isDanger, idx) => isDanger ? idx : -1).filter(x => x >= 0);

  return {
    gameType: 'TOWER',
    result: { grid, dangerPositions, floors },
    floats: allFloats.slice(0, 10),
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Danger positions: [${dangerPositions.join(', ')}] (${floors} floors, 2 dangers per floor, cursor=${cursor})`
  };
}

// STAIRS — matches games/stairs/index.ts
// Uses: shuffle with cursor=3, nonce + step for each step
function verifyStairs(input: VerificationInput): VerificationResult {
  const steps = input.gameParams?.steps || 8;
  const cursor = 3;
  const totalTiles = steps * 2;
  const grid = Array(totalTiles).fill(false);
  const allFloats: number[] = [];

  // Game engine creates per-step shuffle: shuffle([0,1], { cursor: 3, nonce: nonce + step })
  for (let step = 0; step < steps; step++) {
    const stepNonce = input.nonce + step;
    const stepFloats = generateFloats(input.serverSeed, input.clientSeed, stepNonce, 2, cursor);
    allFloats.push(...stepFloats);

    const positions = [0, 1];
    const shuffled = shuffle(positions, stepFloats);

    // First position in shuffled result is danger
    grid[step * 2 + shuffled[0]] = true;
  }

  const dangerPositions = grid.map((isDanger, idx) => isDanger ? idx : -1).filter(x => x >= 0);

  return {
    gameType: 'STAIRS',
    result: { grid, dangerPositions, steps },
    floats: allFloats.slice(0, 10),
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Danger positions: [${dangerPositions.join(', ')}] (${steps} steps, 1 danger per step, cursor=${cursor})`
  };
}

// HILO — matches games/hilo/index.ts
// Uses: generateInt with cursor=13, nonce offsets for current card and suit
function verifyHiLo(input: VerificationInput): VerificationResult {
  const cursor = 13;

  // Game engine: nextCard = generateInt(hiloSeedData, 1, 13) with cursor=13
  // generateInt(seed, 1, 13) = floor(float * 13) + 1
  const nextCardFloat = generateFloat(input.serverSeed, input.clientSeed, input.nonce, cursor);
  const nextCard = Math.floor(nextCardFloat * 13) + 1;

  // currentCard = generateInt({ nonce: nonce + 1 }, 1, 13) with cursor=13
  const currentCardFloat = generateFloat(input.serverSeed, input.clientSeed, input.nonce + 1, cursor);
  const currentCard = Math.floor(currentCardFloat * 13) + 1;

  return {
    gameType: 'HILO',
    result: { currentCard, nextCard },
    floats: [nextCardFloat, currentCardFloat],
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Current: ${currentCard}, Next: ${nextCard} (cursor=${cursor})`
  };
}

// BLACKJACK — matches games/blackjack/index.ts
// Uses: shuffle with cursor=13 on 6-deck (312 cards)
function verifyBlackjack(input: VerificationInput): VerificationResult {
  const cursor = 13;

  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: string[] = [];

  // Game engine builds 6-deck shoe
  for (let i = 0; i < 6; i++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push(`${rank}${suit}`);
      }
    }
  }

  // Game engine: shuffle(deck, { ...seedData, cursor: 13 })
  // rng.ts shuffle generates deck.length floats internally
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, deck.length, cursor);
  const shuffledDeck = shuffle(deck, floats);

  // Deal: player gets [0], [2]; dealer gets [1], [3]
  const playerCards = [shuffledDeck[0], shuffledDeck[2]];
  const dealerCards = [shuffledDeck[1], shuffledDeck[3]];

  return {
    gameType: 'BLACKJACK',
    result: {
      playerCards,
      dealerCards,
      deck: [shuffledDeck[0], shuffledDeck[1], shuffledDeck[2], shuffledDeck[3]]
    },
    floats: floats.slice(0, 10),
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Player: [${playerCards.join(', ')}], Dealer: [${dealerCards.join(', ')}] (cursor=${cursor})`
  };
}

// Main verifier function
export function verifyGame(input: VerificationInput): VerificationResult {
  const gameType = input.gameType.toUpperCase();

  switch (gameType) {
    case 'DICE':
      return verifyDice(input);
    case 'LIMBO':
      return verifyLimbo(input);
    case 'MINES':
      return verifyMines(input);
    case 'KENO':
      return verifyKeno(input);
    case 'PLINKO':
      return verifyPlinko(input);
    case 'ROULETTE':
      return verifyRoulette(input);
    case 'WHEEL':
      return verifyWheel(input);
    case 'COINFLIP':
      return verifyCoinFlip(input);
    case 'FASTPARITY':
      return verifyFastParity(input);
    case 'CRASH':
    case 'SOLOCRASH':
    case 'RUSH':
      return verifyCrash(input);
    case 'BALLOON':
      return verifyBalloon(input);
    case 'TOWER':
      return verifyTower(input);
    case 'STAIRS':
      return verifyStairs(input);
    case 'HILO':
      return verifyHiLo(input);
    case 'BLACKJACK':
      return verifyBlackjack(input);
    default:
      throw new Error(`Game type ${gameType} not supported`);
  }
}

// Verify server seed hash
export function verifyServerSeedHash(serverSeed: string, expectedHash: string): boolean {
  const hash = crypto.createHash('sha256').update(serverSeed).digest('hex');
  return hash === expectedHash;
}
