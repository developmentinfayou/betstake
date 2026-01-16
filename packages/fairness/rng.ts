import crypto from 'crypto';

/**
 * Stake-style Provably Fair RNG System
 * Uses HMAC-SHA256 with server seed, client seed, and nonce
 */

export interface SeedData {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  cursor?: number;
}

/**
 * Generate a cryptographically secure random server seed
 */
export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate SHA256 hash of server seed (for client verification before reveal)
 */
export function hashServerSeed(serverSeed: string): string {
  return crypto.createHash('sha256').update(serverSeed).digest('hex');
}

/**
 * Generate default client seed
 */
export function generateClientSeed(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Core byte generator using HMAC-SHA256
 * Returns hex string of HMAC output
 * @param serverSeed - Server seed
 * @param clientSeed - Client seed
 * @param nonce - Nonce (bet counter)
 * @param currentRound - Current round (floor(cursor / 32))
 */
export function generateHmac(serverSeed: string, clientSeed: string, nonce: number, currentRound: number = 0): string {
  const message = `${clientSeed}:${nonce}:${currentRound}`;
  return crypto.createHmac('sha256', serverSeed).update(message).digest('hex');
}

/**
 * Byte generator - produces unlimited bytes using cursor system (Stake implementation)
 * @param seedData - Server seed, client seed, nonce, and cursor
 * @param count - Number of bytes needed
 * @returns Buffer of random bytes
 */
export function byteGenerator(seedData: SeedData, count: number): Buffer {
  const { serverSeed, clientSeed, nonce } = seedData;
  let cursor = seedData.cursor || 0;
  const bytes: number[] = [];

  while (bytes.length < count) {
    // Stake's cursor implementation: currentRound = floor(cursor / 32)
    const currentRound = Math.floor(cursor / 32);
    const hmac = generateHmac(serverSeed, clientSeed, nonce, currentRound);
    const hmacBytes = Buffer.from(hmac, 'hex');
    
    // Calculate position within current round
    const currentRoundCursor = cursor % 32;
    
    for (let i = currentRoundCursor; i < hmacBytes.length && bytes.length < count; i++) {
      bytes.push(hmacBytes[i]);
      cursor++;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate floats from bytes (0.0 to 1.0)
 * Uses 4 bytes per float for precision
 */
export function generateFloats(seedData: SeedData, count: number): number[] {
  const bytesNeeded = count * 4;
  const bytes = byteGenerator(seedData, bytesNeeded);
  const floats: number[] = [];

  for (let i = 0; i < count; i++) {
    const offset = i * 4;
    const value = bytes.readUInt32BE(offset);
    floats.push(value / 0x100000000); // Divide by 2^32 to get 0-1 range
  }

  return floats;
}

/**
 * Generate a single float (0.0 to 1.0)
 */
export function generateFloat(seedData: SeedData): number {
  return generateFloats(seedData, 1)[0];
}

/**
 * Fisher-Yates shuffle using provably fair RNG (Stake-compatible)
 * Used for card games, mines, keno, etc.
 */
export function shuffle<T>(array: T[], seedData: SeedData): T[] {
  const result = [...array];
  const floats = generateFloats(seedData, result.length);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(floats[i] * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Generate random integer in range [min, max] inclusive
 */
export function generateInt(seedData: SeedData, min: number, max: number): number {
  const float = generateFloat(seedData);
  return Math.floor(float * (max - min + 1)) + min;
}

/**
 * Generate multiple random integers
 */
export function generateInts(seedData: SeedData, count: number, min: number, max: number): number[] {
  const floats = generateFloats(seedData, count);
  return floats.map(f => Math.floor(f * (max - min + 1)) + min);
}

/**
 * Verify a bet result using seed data
 * Returns the HMAC hex string for verification
 */
export function verifyResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  cursor: number = 0
): string {
  return generateHmac(serverSeed, clientSeed, nonce, cursor);
}

/**
 * Verify server seed hash matches the original hash
 */
export function verifyServerSeedHash(serverSeed: string, serverSeedHash: string): boolean {
  return hashServerSeed(serverSeed) === serverSeedHash;
}

/**
 * Get cursor count for different games (Stake implementation)
 * Most games use cursor = 0 (single float)
 * Complex games need multiple floats
 */
export function getGameCursorCount(gameType: string): number {
  const cursorMap: Record<string, number> = {
    // Single cursor (0) - 1 float
    DICE: 0,
    LIMBO: 0,
    WHEEL: 0,
    ROULETTE: 0,
    BACCARAT: 0,
    DIAMONDS: 0,
    CASES: 0,
    DARTS: 0,
    PRIMEDICE: 0,
    PACKS: 0,
    TAROT: 0,
    COINFLIP: 0,
    CRASH: 0,
    TRENBALL: 0,
    BALLOON: 0,
    FASTPARITY: 0,
    RUSH: 0,
    SOLOCRASH: 0,
    
    // Multiple cursors - multiple floats
    KENO: 2,        // 10 outcomes
    MINES: 3,       // 24 bomb locations
    PLINKO: 2,      // 16 decisions
    TOWER: 3,       // Similar to Mines
    STAIRS: 3,      // Similar to Mines
    HILO: 13,       // Unlimited cards
    BLACKJACK: 13,  // Unlimited cards
    VIDEO_POKER: 7, // 52 cards
  };
  
  return cursorMap[gameType] || 0;
}

/**
 * Create seed data with proper cursor for game type
 */
export function createGameSeedData(seedData: SeedData, gameType: string): SeedData {
  return {
    ...seedData,
    cursor: getGameCursorCount(gameType)
  };
}

/**
 * Calculate house edge adjusted probability
 * NOTE: This should NOT be used in RNG - only for display/payout calculations
 * @deprecated Use house edge in multiplier calculation instead
 */
export function applyHouseEdge(winChance: number, houseEdge: number): number {
  return winChance * (1 - houseEdge / 100);
}

/**
 * Calculate multiplier from win chance with house edge (Stake style)
 * House edge reduces the payout multiplier, not the RNG probability
 * Formula: (99 / winChance) * (1 - houseEdge / 100)
 */
export function calculateMultiplier(winChance: number, houseEdge: number = 1): number {
  if (winChance <= 0) return 0;
  const baseMultiplier = 99 / winChance; // Stake uses 99 instead of 100
  return baseMultiplier * (1 - houseEdge / 100);
}

/**
 * Calculate win chance from multiplier
 */
export function calculateWinChance(multiplier: number, houseEdge: number = 1): number {
  if (multiplier <= 0) return 0;
  return (100 / multiplier) / (1 - houseEdge / 100);
}
