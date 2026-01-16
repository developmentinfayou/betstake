import crypto from 'crypto';

/**
 * Stake-Compatible Game Verifier
 * Reconstructs game results from seed data for all games
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

// Generate bytes using cursor system
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

// Generate floats from bytes
function generateFloats(serverSeed: string, clientSeed: string, nonce: number, count: number, cursor: number = 0): number[] {
  const bytes = generateBytes(serverSeed, clientSeed, nonce, count * 4, cursor);
  const floats: number[] = [];

  for (let i = 0; i < count; i++) {
    const value = bytes.readUInt32BE(i * 4);
    floats.push(value / 0x100000000);
  }

  return floats;
}

// Fisher-Yates shuffle
function shuffle<T>(array: T[], floats: number[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(floats[result.length - 1 - i] * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// DICE
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

// LIMBO
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

// MINES
function verifyMines(input: VerificationInput): VerificationResult {
  const gridSize = input.gameParams?.gridSize || 25;
  const minesCount = input.gameParams?.minesCount || 5;
  
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, gridSize, 0);
  
  const positions = Array.from({ length: gridSize }, (_, i) => i);
  const shuffled = shuffle(positions, floats);
  
  const grid = Array(gridSize).fill(false);
  for (let i = 0; i < minesCount; i++) {
    grid[shuffled[i]] = true;
  }
  
  const minePositions = grid.map((isMine, idx) => isMine ? idx : -1).filter(x => x >= 0);
  
  return {
    gameType: 'MINES',
    result: { grid, minePositions, gridSize, minesCount },
    floats: floats.slice(0, 10),
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Mine positions: [${minePositions.join(', ')}] (${minesCount} mines in ${gridSize} tiles)`
  };
}

// KENO
function verifyKeno(input: VerificationInput): VerificationResult {
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 40, 0);
  
  const numbers = Array.from({ length: 40 }, (_, i) => i + 1);
  const shuffled = shuffle(numbers, floats);
  const drawnNumbers = shuffled.slice(0, 10).sort((a, b) => a - b);
  
  return {
    gameType: 'KENO',
    result: { drawnNumbers },
    floats: floats.slice(0, 10),
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Drawn numbers: [${drawnNumbers.join(', ')}]`
  };
}

// PLINKO
function verifyPlinko(input: VerificationInput): VerificationResult {
  const rows = input.gameParams?.rows || 12;
  const superMode = input.gameParams?.superMode || false;
  const payoutSeed = input.gameParams?.payoutSeed;
  
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

// ROULETTE
function verifyRoulette(input: VerificationInput): VerificationResult {
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 1, 0);
  const pocket = Math.floor(floats[0] * 37);
  
  return {
    gameType: 'ROULETTE',
    result: { pocket },
    floats,
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Pocket = floor(${floats[0].toFixed(10)} * 37) = ${pocket}`
  };
}

// WHEEL
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

// COINFLIP
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

// FASTPARITY
function verifyFastParity(input: VerificationInput): VerificationResult {
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 1, 0);
  const number = Math.floor(floats[0] * 10);
  const color = number === 0 ? 'green' : (number % 2 === 0 ? 'violet' : 'red');
  
  return {
    gameType: 'FASTPARITY',
    result: { number, color },
    floats,
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Number = floor(${floats[0].toFixed(10)} * 10) = ${number} (${color})`
  };
}

// CRASH / SOLOCRASH / RUSH
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

// BALLOON
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

// TOWER
function verifyTower(input: VerificationInput): VerificationResult {
  const floors = input.gameParams?.floors || 8;
  const totalTiles = floors * 3;
  
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, totalTiles, 0);
  const grid = Array(totalTiles).fill(false);
  
  for (let floor = 0; floor < floors; floor++) {
    const floorFloats = floats.slice(floor * 3, (floor + 1) * 3);
    const positions = [0, 1, 2];
    const shuffled = shuffle(positions, floorFloats);
    
    grid[floor * 3 + shuffled[0]] = true;
    grid[floor * 3 + shuffled[1]] = true;
  }
  
  const dangerPositions = grid.map((isDanger, idx) => isDanger ? idx : -1).filter(x => x >= 0);
  
  return {
    gameType: 'TOWER',
    result: { grid, dangerPositions, floors },
    floats: floats.slice(0, 10),
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Danger positions: [${dangerPositions.join(', ')}] (${floors} floors, 2 dangers per floor)`
  };
}

// STAIRS
function verifyStairs(input: VerificationInput): VerificationResult {
  const steps = input.gameParams?.steps || 8;
  const totalTiles = steps * 2;
  
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, totalTiles, 0);
  const grid = Array(totalTiles).fill(false);
  
  for (let step = 0; step < steps; step++) {
    const stepFloats = floats.slice(step * 2, (step + 1) * 2);
    const positions = [0, 1];
    const shuffled = shuffle(positions, stepFloats);
    
    grid[step * 2 + shuffled[0]] = true;
  }
  
  const dangerPositions = grid.map((isDanger, idx) => isDanger ? idx : -1).filter(x => x >= 0);
  
  return {
    gameType: 'STAIRS',
    result: { grid, dangerPositions, steps },
    floats: floats.slice(0, 10),
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Danger positions: [${dangerPositions.join(', ')}] (${steps} steps, 1 danger per step)`
  };
}

// HILO
function verifyHiLo(input: VerificationInput): VerificationResult {
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 2, 0);
  const currentCard = Math.floor(floats[0] * 13) + 1;
  const nextCard = Math.floor(floats[1] * 13) + 1;
  
  return {
    gameType: 'HILO',
    result: { currentCard, nextCard },
    floats,
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Current: ${currentCard}, Next: ${nextCard}`
  };
}

// BLACKJACK
function verifyBlackjack(input: VerificationInput): VerificationResult {
  const floats = generateFloats(input.serverSeed, input.clientSeed, input.nonce, 52, 0);
  
  const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits = ['♠', '♥', '♦', '♣'];
  const deck: string[] = [];
  
  for (let i = 0; i < 6; i++) {
    for (const suit of suits) {
      for (const card of cards) {
        deck.push(`${card}${suit}`);
      }
    }
  }
  
  const positions = Array.from({ length: deck.length }, (_, i) => i);
  const shuffled = shuffle(positions, floats);
  
  const dealtCards = shuffled.slice(0, 4).map(idx => deck[idx]);
  
  return {
    gameType: 'BLACKJACK',
    result: { 
      playerCards: [dealtCards[0], dealtCards[2]], 
      dealerCards: [dealtCards[1], dealtCards[3]],
      deck: dealtCards
    },
    floats: floats.slice(0, 10),
    hmac: generateHmac(input.serverSeed, input.clientSeed, input.nonce, 0),
    explanation: `Player: [${dealtCards[0]}, ${dealtCards[2]}], Dealer: [${dealtCards[1]}, ${dealtCards[3]}]`
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
