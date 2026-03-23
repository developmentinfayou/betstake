import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { MinesSession, HiLoSession, BlackjackSession, StairsSession, TowerSession, CoinFlipSession } from '@casino/database';

const router = Router();

// Check all game types for active sessions
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const [mines, hilo, blackjack, stairs, tower, coinflip] = await Promise.all([
            MinesSession.findOne({ userId: req.userId, active: true }),
            HiLoSession.findOne({ userId: req.userId, active: true }),
            BlackjackSession.findOne({ userId: req.userId, active: true }),
            StairsSession.findOne({ userId: req.userId, active: true }),
            TowerSession.findOne({ userId: req.userId, active: true }),
            CoinFlipSession.findOne({ userId: req.userId, active: true }),
        ]);

        const hasAnyActive = !!(mines || hilo || blackjack || stairs || tower || coinflip);

        res.json({
            hasAnyActive,
            activeGames: {
                mines: mines ? { sessionId: mines._id, gameType: 'MINES', betAmount: mines.betAmount } : null,
                hilo: hilo ? { sessionId: hilo._id, gameType: 'HILO', betAmount: hilo.betAmount } : null,
                blackjack: blackjack ? { sessionId: blackjack._id, gameType: 'BLACKJACK', betAmount: blackjack.betAmount } : null,
                stairs: stairs ? { sessionId: stairs._id, gameType: 'STAIRS', betAmount: stairs.betAmount } : null,
                tower: tower ? { sessionId: tower._id, gameType: 'TOWER', betAmount: tower.betAmount } : null,
                coinflip: coinflip ? { sessionId: coinflip._id, gameType: 'COINFLIP', betAmount: coinflip.betAmount } : null,
            },
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
