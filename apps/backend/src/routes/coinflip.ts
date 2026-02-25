import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { CoinFlipSession, Bet, Wallet } from '@casino/database';
import { generateFloat } from '@casino/fairness';
import { SeedManager } from '@casino/fairness';

const router = Router();

const HOUSE_EDGE = 1; // 1%
const MAX_ROUNDS = 20;
const BASE_MULTIPLIER = 2 * (1 - HOUSE_EDGE / 100); // 1.98

/**
 * Calculate compounded multiplier for consecutive wins.
 * Each correct pick compounds: 1.98^n
 */
function calculateMultiplier(correctPicks: number): number {
    if (correctPicks === 0) return 1;
    return parseFloat(Math.pow(BASE_MULTIPLIER, correctPicks).toFixed(4));
}

/**
 * Generate all coin flip results for the session using provably fair RNG.
 */
function generateResults(seedData: { serverSeed: string; clientSeed: string; nonce: number }, count: number): ('heads' | 'tails')[] {
    const results: ('heads' | 'tails')[] = [];
    for (let i = 0; i < count; i++) {
        const float = generateFloat({
            serverSeed: seedData.serverSeed,
            clientSeed: seedData.clientSeed,
            nonce: seedData.nonce + i,
        });
        results.push(float < 0.5 ? 'heads' : 'tails');
    }
    return results;
}

// Start a new CoinFlip session
router.post('/start', authenticate, async (req: AuthRequest, res) => {
    try {
        const { betAmount, currency } = req.body;

        if (!betAmount || !currency) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (betAmount <= 0) {
            return res.status(400).json({ error: 'Bet amount must be positive' });
        }

        // Check for existing active session
        const existingSession = await CoinFlipSession.findOne({ userId: req.userId, active: true });
        if (existingSession) {
            return res.status(400).json({ error: 'Active game exists. Cash out or finish first.' });
        }

        // Check wallet balance
        const wallet = await Wallet.findOne({ userId: req.userId, currency });
        if (!wallet || wallet.balance < betAmount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Debit wallet
        wallet.balance -= betAmount;
        await wallet.save();

        // Get seed data and generate all results
        const seedData = await SeedManager.reserveSeedForBetNoTx(req.userId!);
        const results = generateResults(
            { serverSeed: seedData.serverSeed, clientSeed: seedData.clientSeed, nonce: seedData.nonce },
            MAX_ROUNDS
        );

        // Create session
        const session = await CoinFlipSession.create({
            userId: req.userId,
            results,
            picks: [],
            currentRound: 0,
            maxRounds: MAX_ROUNDS,
            currentMultiplier: 1,
            betAmount,
            currency,
            active: true,
            seedPairId: seedData.seedPairId,
            nonce: seedData.nonce,
        });

        // Lock seed for this session
        await SeedManager.lockSeedForGame(req.userId!, session._id.toString());

        res.json({
            sessionId: session._id,
            maxRounds: MAX_ROUNDS,
            betAmount,
            currency,
            currentMultiplier: 1,
            currentRound: 0,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Pick heads or tails for current round
router.post('/pick', authenticate, async (req: AuthRequest, res) => {
    try {
        const { sessionId, choice } = req.body;

        if (!sessionId || !choice) {
            return res.status(400).json({ error: 'Missing sessionId or choice' });
        }

        if (!['heads', 'tails'].includes(choice)) {
            return res.status(400).json({ error: 'Choice must be heads or tails' });
        }

        const session = await CoinFlipSession.findOne({ _id: sessionId, userId: req.userId, active: true });
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.currentRound >= session.maxRounds) {
            return res.status(400).json({ error: 'Max rounds reached. Cash out.' });
        }

        // Get the pre-generated result for this round
        const result = session.results[session.currentRound];
        const won = result === choice;

        // Record the pick
        session.picks.push(choice);
        session.currentRound += 1;

        if (!won) {
            // Game over — user loses
            session.active = false;
            await session.save();

            // Unlock seed
            await SeedManager.unlockSeedAfterGame(session._id.toString());

            // Create lost bet record
            const bet = await Bet.create({
                userId: req.userId,
                gameType: 'COINFLIP',
                currency: session.currency,
                amount: session.betAmount,
                multiplier: 0,
                payout: 0,
                profit: -session.betAmount,
                won: false,
                seedPairId: session.seedPairId,
                nonce: session.nonce,
                gameData: { picks: session.picks, maxRounds: session.maxRounds },
                result: { results: session.results.slice(0, session.currentRound), lost: true, lostAtRound: session.currentRound },
            });

            session.betId = bet._id;
            await session.save();

            return res.json({
                won: false,
                gameOver: true,
                result,
                choice,
                round: session.currentRound,
                picks: session.picks,
                results: session.results.slice(0, session.currentRound),
                bet,
            });
        }

        // Won this round — update multiplier
        const newMultiplier = calculateMultiplier(session.currentRound);
        session.currentMultiplier = newMultiplier;
        await session.save();

        const isLastRound = session.currentRound >= session.maxRounds;

        // If max rounds reached, auto-cashout
        if (isLastRound) {
            const payout = session.betAmount * newMultiplier;
            const profit = payout - session.betAmount;

            const wallet = await Wallet.findOne({ userId: req.userId, currency: session.currency });
            if (wallet) {
                wallet.balance += payout;
                await wallet.save();
            }

            session.active = false;
            await session.save();

            await SeedManager.unlockSeedAfterGame(session._id.toString());

            const bet = await Bet.create({
                userId: req.userId,
                gameType: 'COINFLIP',
                currency: session.currency,
                amount: session.betAmount,
                multiplier: newMultiplier,
                payout,
                profit,
                won: true,
                seedPairId: session.seedPairId,
                nonce: session.nonce,
                gameData: { picks: session.picks, maxRounds: session.maxRounds },
                result: { results: session.results, cashedOut: true, autoCashout: true },
            });

            session.betId = bet._id;
            await session.save();

            return res.json({
                won: true,
                gameOver: true,
                autoCashout: true,
                result,
                choice,
                round: session.currentRound,
                currentMultiplier: newMultiplier,
                payout,
                profit,
                picks: session.picks,
                results: session.results,
                wallet: { balance: wallet?.balance },
                bet,
            });
        }

        res.json({
            won: true,
            gameOver: false,
            result,
            choice,
            round: session.currentRound,
            currentMultiplier: newMultiplier,
            potentialPayout: parseFloat((session.betAmount * newMultiplier).toFixed(4)),
            nextMultiplier: calculateMultiplier(session.currentRound + 1),
            picks: session.picks,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Cash out at current multiplier
router.post('/cashout', authenticate, async (req: AuthRequest, res) => {
    try {
        const { sessionId } = req.body;

        const session = await CoinFlipSession.findOne({ _id: sessionId, userId: req.userId, active: true });
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.currentRound === 0) {
            return res.status(400).json({ error: 'Must complete at least one round' });
        }

        const payout = parseFloat((session.betAmount * session.currentMultiplier).toFixed(4));
        const profit = parseFloat((payout - session.betAmount).toFixed(4));

        // Credit wallet
        const wallet = await Wallet.findOne({ userId: req.userId, currency: session.currency });
        if (wallet) {
            wallet.balance += payout;
            await wallet.save();
        }

        // Create won bet record
        const bet = await Bet.create({
            userId: req.userId,
            gameType: 'COINFLIP',
            currency: session.currency,
            amount: session.betAmount,
            multiplier: session.currentMultiplier,
            payout,
            profit,
            won: true,
            seedPairId: session.seedPairId,
            nonce: session.nonce,
            gameData: { picks: session.picks, maxRounds: session.maxRounds },
            result: { results: session.results.slice(0, session.currentRound), cashedOut: true, roundsCompleted: session.currentRound },
        });

        session.active = false;
        session.betId = bet._id;
        await session.save();

        // Unlock seed
        await SeedManager.unlockSeedAfterGame(session._id.toString());

        res.json({
            bet,
            payout,
            profit,
            multiplier: session.currentMultiplier,
            roundsCompleted: session.currentRound,
            wallet: { balance: wallet?.balance },
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get active session for recovery on page refresh
router.get('/active-session', authenticate, async (req: AuthRequest, res) => {
    try {
        const session = await CoinFlipSession.findOne({ userId: req.userId, active: true });
        if (!session) {
            return res.json({ hasActiveSession: false });
        }

        res.json({
            hasActiveSession: true,
            sessionId: session._id,
            currentRound: session.currentRound,
            currentMultiplier: session.currentMultiplier,
            maxRounds: session.maxRounds,
            betAmount: session.betAmount,
            currency: session.currency,
            picks: session.picks,
            // Return results only up to current round (don't reveal future results)
            results: session.results.slice(0, session.currentRound),
            potentialPayout: parseFloat((session.betAmount * session.currentMultiplier).toFixed(4)),
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Cleanup / forfeit stale sessions
router.post('/cleanup', authenticate, async (req: AuthRequest, res) => {
    try {
        const activeSession = await CoinFlipSession.findOne({ userId: req.userId, active: true });

        if (activeSession) {
            activeSession.active = false;
            await activeSession.save();

            const bet = await Bet.create({
                userId: req.userId,
                gameType: 'COINFLIP',
                currency: activeSession.currency,
                amount: activeSession.betAmount,
                multiplier: 0,
                payout: 0,
                profit: -activeSession.betAmount,
                won: false,
                seedPairId: activeSession.seedPairId,
                nonce: activeSession.nonce,
                gameData: { picks: activeSession.picks, maxRounds: activeSession.maxRounds },
                result: { forfeited: true, cleanedUp: true },
            });

            activeSession.betId = bet._id;
            await activeSession.save();

            await SeedManager.unlockSeedAfterGame(activeSession._id.toString());

            res.json({ message: 'Active session cleaned up', sessionId: activeSession._id });
        } else {
            res.json({ message: 'No active session found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
