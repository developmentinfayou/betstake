// Add this to your backend routes for debugging
import { Router } from 'express';

const debugRouter = Router();

// Get all active rooms (for debugging)
debugRouter.get('/ludo/rooms', (req, res) => {
  const rooms = require('../websocket/ludo').getRooms(); // You'll need to export this
  res.json({
    totalRooms: rooms.size,
    rooms: Array.from(rooms.entries()).map(([id, room]) => ({
      gameId: id,
      status: room.status,
      playerCount: room.players.length,
      mode: room.mode,
      createdAt: new Date(room.createdAt).toISOString()
    }))
  });
});

export default debugRouter;