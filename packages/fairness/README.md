# Provably Fair System (Stake Implementation)

This package implements Stake's provably fair algorithm for casino games.

## Core Concept

```
Fair Result = Server Seed (hashed) + Client Seed + Nonce + Cursor
```

## Algorithm Flow

### 1. Random Number Generation

```javascript
// Inputs
serverSeed: "64-char hex string"
clientSeed: "user-provided or auto-generated"
nonce: 0, 1, 2, 3... (increments per bet)
cursor: 0 (for most games)

// Process
currentRound = floor(cursor / 32)
hmac = HMAC_SHA256(serverSeed, "clientSeed:nonce:currentRound")
bytes = hmac as bytes
float = first 4 bytes as float (0-1)
```

### 2. Bytes to Float Conversion

```javascript
// Take first 4 bytes (8 hex characters)
hex = hmac.substring(0, 8)
intValue = parseInt(hex, 16)
float = intValue / 0x100000000  // Divide by 2^32
// Result: float between 0.0 and 1.0
```

### 3. Float to Game Event

Each game has its own formula to convert the float to a game outcome:

#### Dice
```javascript
roll = floor(float * 10001) / 100
// Result: 00.00 to 100.00
```

#### Limbo
```javascript
houseEdge = 0.99  // 1% house edge
floatPoint = (1 / float) * houseEdge
crashPoint = floor(floatPoint * 100) / 100
result = max(crashPoint, 1.00)
// Result: 1.00x to infinity (exponential distribution)
```

#### Roulette
```javascript
pocket = floor(float * 37)
// Result: 0 to 36
```

#### Mines (24 tiles)
```javascript
// Generate 24 floats using Fisher-Yates shuffle
// Each float determines bomb position
// Cursor increments: 3 (needs 24 floats = 96 bytes)
```

#### Keno (10 numbers)
```javascript
// Generate 10 floats using Fisher-Yates shuffle
// Each float determines hit position (1-40)
// Cursor increments: 2 (needs 10 floats = 40 bytes)
```

## Cursor System

The cursor allows generating more than 8 floats (32 bytes / 4 bytes per float):

```javascript
// SHA256 produces 32 bytes
// Each float needs 4 bytes
// Max 8 floats per HMAC call

// When more floats needed:
currentRound = floor(cursor / 32)
// cursor 0-31 → round 0
// cursor 32-63 → round 1
// cursor 64-95 → round 2
```

### Games by Cursor Usage

**Cursor = 0 (Single float):**
- Dice, Limbo, Wheel, Roulette, Baccarat, Diamonds, Cases, Darts, Primedice, Packs, Tarot

**Cursor > 0 (Multiple floats):**
- Keno: 2 increments (10 floats)
- Mines: 3 increments (24 floats)
- Plinko: 2 increments (16 floats)
- Hilo: Unlimited (per card)
- Blackjack: Unlimited (per card)
- Video Poker: 7 increments (52 cards)

## Seed Lifecycle

### 1. Active Seed Pair
```
Server Seed: HIDDEN (only hash visible)
Server Seed Hash: abc123... (SHA-256)
Client Seed: xyz789 (visible)
Nonce: 0, 1, 2, 3... (increments per bet)
Status: ACTIVE
```

### 2. Rotate Seeds
```
Old Server Seed: REVEALED (now visible)
Old Server Seed Hash: abc123... (verify matches)
New Server Seed: HIDDEN (new hash)
New Client Seed: xyz789 or custom
New Nonce: 0 (resets)
Status: Old = REVEALED, New = ACTIVE
```

### 3. Verification
```
User can now verify all bets using:
- Revealed Server Seed
- Client Seed
- Nonce (from bet)
- Game Type (to know formula)

Recalculate outcome and compare with actual bet result
```

## House Edge

House edge is applied to the PAYOUT, not the RNG:

```javascript
// WRONG: Applying to RNG
float = generateFloat() * (1 - houseEdge)  // ❌

// CORRECT: Applying to multiplier
baseMultiplier = 99 / winChance
finalMultiplier = baseMultiplier * (1 - houseEdge / 100)  // ✅
```

## Security Features

1. **Server Seed Hash** - Proves server seed was generated before bets
2. **Client Seed** - User can change to influence randomness
3. **Nonce** - Ensures unique outcome per bet
4. **Rotation** - Reveals old seed for verification
5. **HMAC-SHA256** - Cryptographically secure

## Verification Example

```javascript
// Bet Details
serverSeed: "abc123..." (revealed after rotation)
clientSeed: "xyz789"
nonce: 5
gameType: "DICE"

// Step 1: Generate HMAC
currentRound = floor(0 / 32) = 0
message = "xyz789:5:0"
hmac = HMAC_SHA256("abc123...", message)

// Step 2: Convert to float
hex = hmac.substring(0, 8)
float = parseInt(hex, 16) / 0x100000000

// Step 3: Apply game formula
roll = floor(float * 10001) / 100

// Step 4: Compare with actual bet result
// If they match → Provably Fair ✅
```

## API Usage

```typescript
import { generateFloat, generateHmac, hashServerSeed } from '@casino/fairness';

// Generate random float
const float = generateFloat({
  serverSeed: 'abc123...',
  clientSeed: 'xyz789',
  nonce: 5,
  cursor: 0
});

// Hash server seed
const hash = hashServerSeed('abc123...');

// Verify hash
const isValid = hashServerSeed(serverSeed) === serverSeedHash;
```

## References

- [Stake Provably Fair Documentation](https://stake.com/provably-fair)
- [HMAC-SHA256 Specification](https://tools.ietf.org/html/rfc2104)
- [Fisher-Yates Shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
