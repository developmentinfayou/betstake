import { Router } from 'express';
import { PVPGame, PVPGameStatus, PVPGameType } from '@casino/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { CHESS_MODES } from '@casino/game-engine';

const router = Router();

/**
 * Get available chess time control modes
 */
router.get('/modes', (req, res) => {
    const modes = Object.entries(CHESS_MODES).map(([name, tc]) => {
        let category = 'Custom';
        if (tc.baseTime <= 120) category = 'Bullet';
        else if (tc.baseTime <= 300) category = 'Blitz';
        else if (tc.baseTime <= 900) category = 'Rapid';
        else category = 'Classical';

        return {
            name,
            baseTime: tc.baseTime,
            increment: tc.increment,
            category,
            label: `${Math.floor(tc.baseTime / 60)}+${tc.increment}`,
        };
    });

    res.json(modes);
});

/**
 * Get game by shareable link (public — no auth needed for replays)
 */
router.get('/game/:shareableLink', async (req, res) => {
    try {
        const { shareableLink } = req.params;

        const game = await PVPGame.findOne({
            $or: [
                { shareableLink: `chess/${shareableLink}` },
                { shareableLink },
            ],
            gameType: PVPGameType.CHESS,
        }).populate('players', 'username').populate('winner', 'username');

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json({
            id: game._id,
            mode: game.mode,
            players: game.players,
            status: game.status,
            winner: game.winner,
            pgn: game.pgn || '',
            moves: game.moves,
            gameState: game.gameState,
            endReason: game.endReason,
            timeControl: game.timeControl,
            betAmount: game.betAmount,
            currency: game.currency,
            shareableLink: game.shareableLink,
            startedAt: game.startedAt,
            finishedAt: game.finishedAt,
            createdAt: game.createdAt,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get player's chess game history
 */
router.get('/my-games', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const { limit = 20, offset = 0, status } = req.query;

        const filter: any = {
            players: userId,
            gameType: PVPGameType.CHESS,
        };

        if (status) {
            filter.status = status;
        }

        const games = await PVPGame.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(offset))
            .populate('players', 'username')
            .populate('winner', 'username')
            .select('-antiCheatData'); // Don't expose anti-cheat to players

        const total = await PVPGame.countDocuments(filter);

        res.json({
            games: games.map(game => ({
                id: game._id,
                mode: game.mode,
                players: game.players,
                status: game.status,
                winner: game.winner,
                endReason: game.endReason,
                betAmount: game.betAmount,
                currency: game.currency,
                shareableLink: game.shareableLink,
                moveCount: game.gameState?.moveCount || 0,
                pgn: game.pgn || '',
                startedAt: game.startedAt,
                finishedAt: game.finishedAt,
                createdAt: game.createdAt,
            })),
            total,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get active chess games for the player
 */
router.get('/active', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;

        const games = await PVPGame.find({
            players: userId,
            gameType: PVPGameType.CHESS,
            status: { $in: [PVPGameStatus.WAITING, PVPGameStatus.ACTIVE] },
        }).populate('players', 'username');

        res.json(games);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
