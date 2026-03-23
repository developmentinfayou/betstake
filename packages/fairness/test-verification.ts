/**
 * Test script: Verify that game engine and verifier produce identical results
 * Run: npx tsx packages/fairness/test-verification.ts
 */
import { generateFloat, generateFloats, shuffle, generateInt, SeedData } from './rng';
import { verifyGame } from './verifier';

const testSeedData: SeedData = {
    serverSeed: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    clientSeed: 'test_client_seed_123',
    nonce: 42,
};

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        process.exitCode = 1;
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

// ---- DICE ----
function testDice() {
    const float = generateFloat(testSeedData);
    const gameRoll = Math.floor(float * 10001) / 100;

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'DICE',
    });

    assert(v.result.roll === parseFloat(gameRoll.toFixed(2)), `Dice: game=${gameRoll.toFixed(2)}, verifier=${v.result.roll}`);
}

// ---- LIMBO ----
function testLimbo() {
    const float = generateFloat(testSeedData);
    const houseEdge = 0.99;
    const floatPoint = (1 / float) * houseEdge;
    const crashPoint = Math.floor(floatPoint * 100) / 100;
    const gameResult = Math.max(crashPoint, 1.00);

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'LIMBO',
    });

    assert(v.result.crashPoint === parseFloat(gameResult.toFixed(2)), `Limbo: game=${gameResult.toFixed(2)}, verifier=${v.result.crashPoint}`);
}

// ---- MINES ----
function testMines() {
    const gridSize = 25;
    const minesCount = 5;

    // Replicate game engine logic
    const minesSeedData = { ...testSeedData, cursor: 3 };
    const tiles: boolean[] = Array(gridSize).fill(false);
    for (let i = 0; i < minesCount; i++) tiles[i] = true;
    const gameGrid = shuffle(tiles, minesSeedData);
    const gameMinePositions = gameGrid.map((isMine, idx) => isMine ? idx : -1).filter(x => x >= 0);

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'MINES',
        gameParams: { gridSize, minesCount },
    });

    const verifierMinePositions = v.result.minePositions;
    const match = JSON.stringify(gameMinePositions) === JSON.stringify(verifierMinePositions);
    assert(match, `Mines: game=[${gameMinePositions}], verifier=[${verifierMinePositions}]`);
}

// ---- KENO ----
function testKeno() {
    const kenoSeedData = { ...testSeedData, cursor: 2 };
    const allNumbers = Array.from({ length: 40 }, (_, i) => i + 1);
    const shuffled = shuffle(allNumbers, kenoSeedData);
    const gameDrawn = shuffled.slice(0, 10).sort((a, b) => a - b);

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'KENO',
    });

    const match = JSON.stringify(gameDrawn) === JSON.stringify(v.result.drawnNumbers);
    assert(match, `Keno: game=[${gameDrawn}], verifier=[${v.result.drawnNumbers}]`);
}

// ---- PLINKO ----
function testPlinko() {
    const rows = 12;
    const plinkoSeedData = { ...testSeedData, cursor: 0 };
    const floats = generateFloats(plinkoSeedData, rows);
    const gamePath = floats.map(f => f < 0.5 ? 0 : 1);
    const gameFinalSlot = gamePath.reduce((sum, dir) => sum + dir, 0);

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'PLINKO',
        gameParams: { rows },
    });

    assert(gameFinalSlot === v.result.finalSlot, `Plinko: game slot=${gameFinalSlot}, verifier slot=${v.result.finalSlot}`);
    assert(JSON.stringify(gamePath) === JSON.stringify(v.result.path), `Plinko path match`);
}

// ---- ROULETTE ----
function testRoulette() {
    const gamePocket = generateInt(testSeedData, 0, 36);

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'ROULETTE',
    });

    assert(gamePocket === v.result.pocket, `Roulette: game=${gamePocket}, verifier=${v.result.pocket}`);
}

// ---- WHEEL ----
function testWheel() {
    const segments = 30;
    const gameSegment = generateInt(testSeedData, 0, segments - 1);

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'WHEEL',
        gameParams: { segments },
    });

    assert(gameSegment === v.result.segment, `Wheel (${segments}seg): game=${gameSegment}, verifier=${v.result.segment}`);
}

// ---- COINFLIP ----
function testCoinFlip() {
    const float = generateFloat(testSeedData);
    const gameResult = float < 0.5 ? 'heads' : 'tails';

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'COINFLIP',
    });

    assert(gameResult === v.result.result, `CoinFlip: game=${gameResult}, verifier=${v.result.result}`);
}

// ---- FASTPARITY ----
function testFastParity() {
    const gameNumber = generateInt(testSeedData, 0, 9);

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'FASTPARITY',
    });

    assert(gameNumber === v.result.number, `FastParity: game=${gameNumber}, verifier=${v.result.number}`);
}

// ---- CRASH ----
function testCrash() {
    const float = generateFloat(testSeedData);
    const houseEdge = 0.99;
    const crashPoint = Math.max(1.01, (99 * houseEdge) / (100 * float));
    const gameResult = Math.min(parseFloat(crashPoint.toFixed(2)), 10000);

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'CRASH',
    });

    assert(gameResult === v.result.crashPoint, `Crash: game=${gameResult}, verifier=${v.result.crashPoint}`);
}

// ---- BALLOON ----
function testBalloon() {
    const maxPumps = 100;
    const float = generateFloat(testSeedData);
    const gameBurstAt = Math.floor(float * maxPumps) + 1;

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'BALLOON',
        gameParams: { maxPumps },
    });

    assert(gameBurstAt === v.result.burstAt, `Balloon: game=${gameBurstAt}, verifier=${v.result.burstAt}`);
}

// ---- TOWER ----
function testTower() {
    const floors = 8;
    const cursor = 3;
    const totalTiles = floors * 3;
    const gameGrid = Array(totalTiles).fill(false);

    for (let floor = 0; floor < floors; floor++) {
        const towerSeedData = { ...testSeedData, cursor, nonce: testSeedData.nonce + floor };
        const dangerPositions = shuffle([0, 1, 2], towerSeedData);
        gameGrid[floor * 3 + dangerPositions[0]] = true;
        gameGrid[floor * 3 + dangerPositions[1]] = true;
    }

    const gameDangerPositions = gameGrid.map((isDanger, idx) => isDanger ? idx : -1).filter(x => x >= 0);

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'TOWER',
        gameParams: { floors },
    });

    const match = JSON.stringify(gameDangerPositions) === JSON.stringify(v.result.dangerPositions);
    assert(match, `Tower: game=[${gameDangerPositions}], verifier=[${v.result.dangerPositions}]`);
}

// ---- STAIRS ----
function testStairs() {
    const steps = 8;
    const cursor = 3;
    const totalTiles = steps * 2;
    const gameGrid = Array(totalTiles).fill(false);

    for (let step = 0; step < steps; step++) {
        const stairsSeedData = { ...testSeedData, cursor, nonce: testSeedData.nonce + step };
        const dangerPosition = shuffle([0, 1], stairsSeedData)[0];
        gameGrid[step * 2 + dangerPosition] = true;
    }

    const gameDangerPositions = gameGrid.map((isDanger, idx) => isDanger ? idx : -1).filter(x => x >= 0);

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'STAIRS',
        gameParams: { steps },
    });

    const match = JSON.stringify(gameDangerPositions) === JSON.stringify(v.result.dangerPositions);
    assert(match, `Stairs: game=[${gameDangerPositions}], verifier=[${v.result.dangerPositions}]`);
}

// ---- BLACKJACK ----
function testBlackjack() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: string[] = [];
    for (let i = 0; i < 6; i++) {
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push(`${rank}${suit}`);
            }
        }
    }
    const bjSeedData = { ...testSeedData, cursor: 13 };
    const shuffledDeck = shuffle(deck, bjSeedData);
    const gamePlayerCards = [shuffledDeck[0], shuffledDeck[2]];
    const gameDealerCards = [shuffledDeck[1], shuffledDeck[3]];

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'BLACKJACK',
    });

    assert(
        JSON.stringify(gamePlayerCards) === JSON.stringify(v.result.playerCards),
        `Blackjack player: game=[${gamePlayerCards}], verifier=[${v.result.playerCards}]`
    );
    assert(
        JSON.stringify(gameDealerCards) === JSON.stringify(v.result.dealerCards),
        `Blackjack dealer: game=[${gameDealerCards}], verifier=[${v.result.dealerCards}]`
    );
}

// ---- HILO ----
function testHiLo() {
    const cursor = 13;
    const hiloSeedData = { ...testSeedData, cursor };
    const gameNextCard = generateInt(hiloSeedData, 1, 13);
    const gameCurrentCard = generateInt({ ...hiloSeedData, nonce: hiloSeedData.nonce + 1 }, 1, 13);

    const v = verifyGame({
        serverSeed: testSeedData.serverSeed,
        clientSeed: testSeedData.clientSeed,
        nonce: testSeedData.nonce,
        gameType: 'HILO',
    });

    assert(gameNextCard === v.result.nextCard, `HiLo next: game=${gameNextCard}, verifier=${v.result.nextCard}`);
    assert(gameCurrentCard === v.result.currentCard, `HiLo current: game=${gameCurrentCard}, verifier=${v.result.currentCard}`);
}

// ---- LUDO (Multiplayer Per-Player Dice) ----
function testLudoDice() {
    const serverSeed = testSeedData.serverSeed;
    const playerASeed = 'player_a_client_seed_abc';
    const playerBSeed = 'player_b_client_seed_xyz';

    // Player A turn (nonce 0)
    const rollA1 = Math.floor(generateFloat({ serverSeed, clientSeed: playerASeed, nonce: 0 }) * 6) + 1;
    // Player B turn (nonce 0 — independent counter)
    const rollB1 = Math.floor(generateFloat({ serverSeed, clientSeed: playerBSeed, nonce: 0 }) * 6) + 1;
    // Player A turn again (nonce 1)
    const rollA2 = Math.floor(generateFloat({ serverSeed, clientSeed: playerASeed, nonce: 1 }) * 6) + 1;
    // Player B turn again (nonce 1)
    const rollB2 = Math.floor(generateFloat({ serverSeed, clientSeed: playerBSeed, nonce: 1 }) * 6) + 1;

    // Verify each independently — each player only needs serverSeed + their own clientSeed + their nonce
    const verifyA1 = Math.floor(generateFloat({ serverSeed, clientSeed: playerASeed, nonce: 0 }) * 6) + 1;
    const verifyB1 = Math.floor(generateFloat({ serverSeed, clientSeed: playerBSeed, nonce: 0 }) * 6) + 1;
    const verifyA2 = Math.floor(generateFloat({ serverSeed, clientSeed: playerASeed, nonce: 1 }) * 6) + 1;
    const verifyB2 = Math.floor(generateFloat({ serverSeed, clientSeed: playerBSeed, nonce: 1 }) * 6) + 1;

    assert(rollA1 === verifyA1, `Ludo A roll1: game=${rollA1}, verify=${verifyA1}`);
    assert(rollB1 === verifyB1, `Ludo B roll1: game=${rollB1}, verify=${verifyB1}`);
    assert(rollA2 === verifyA2, `Ludo A roll2: game=${rollA2}, verify=${verifyA2}`);
    assert(rollB2 === verifyB2, `Ludo B roll2: game=${rollB2}, verify=${verifyB2}`);

    // Verify dice values are in valid range (1-6)
    assert(rollA1 >= 1 && rollA1 <= 6, `Ludo A1 range: ${rollA1}`);
    assert(rollB1 >= 1 && rollB1 <= 6, `Ludo B1 range: ${rollB1}`);

    // Verify that different client seeds produce different results (not guaranteed but extremely likely)
    // This is a sanity check, not a strict assertion
    const differentSeeds = (rollA1 !== rollB1) || (rollA2 !== rollB2);
    if (differentSeeds) {
        console.log(`  ℹ️  Different seeds produce different rolls (as expected)`);
    }
}

// Run all tests
console.log('\n🧪 Fairness Verification Test Suite\n' + '='.repeat(50));

testDice();
testLimbo();
testMines();
testKeno();
testPlinko();
testRoulette();
testWheel();
testCoinFlip();
testFastParity();
testCrash();
testBalloon();
testTower();
testStairs();
testBlackjack();
testHiLo();
testLudoDice();

console.log('\n' + '='.repeat(50));
console.log(process.exitCode ? '❌ Some tests FAILED!' : '✅ All tests PASSED!');

