import { Router } from 'express';
import { PVPGameService } from '../services/pvp-game-service';
import { PVPGameType } from '@casino/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const createGameSchema = z.object({
  gameType: z.enum(['LUDO', 'CHESS']),
  mode: z.string(),
  betAmount: z.number().positive(),
  currency: z.string()
});

const makeMoveSchema = z.object({
  move: z.any()
});

const router = Router();

// Create new PVP game
router.post('/create', authenticate, async (req: AuthRequest, res) => {
  try {
    const body = createGameSchema.parse(req.body);
    const userId = req.user.id;
    
    const game = await PVPGameService.createGame(
      userId,
      body.gameType as PVPGameType,
      body.mode,
      body.betAmount,
      body.currency
    );
    
    res.json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Join existing game
router.post('/join/:gameId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    
    const game = await PVPGameService.joinGame(gameId, userId);
    
    res.json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Make move
router.post('/:gameId/move', authenticate, async (req: AuthRequest, res) => {
  try {
    const { gameId } = req.params;
    const body = makeMoveSchema.parse(req.body);
    const userId = req.user.id;
    
    const game = await PVPGameService.makeMove(gameId, userId, body.move);
    
    res.json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get game by shareable link
router.get('/link/:shareableLink', async (req, res) => {
  try {
    const { shareableLink } = req.params;
    const game = await PVPGameService.getGameByLink(shareableLink);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get player's games
router.get('/my-games', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const games = await PVPGameService.getPlayerGames(userId);
    
    res.json(games);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get game details
router.get('/:gameId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { gameId } = req.params;
    const game = await PVPGameService.getGameByLink(gameId);
    
    res.json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;