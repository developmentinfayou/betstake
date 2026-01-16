import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { connectDB, disconnectDB } from '@casino/database';

// Routes
import authRoutes from './routes/auth';
import betRoutes from './routes/bet';
import walletRoutes from './routes/wallet';
import gameRoutes from './routes/game';
import seedRoutes from './routes/seed';
import strategyRoutes from './routes/strategy';
import contestRoutes from './routes/contest';
import jackpotRoutes from './routes/jackpot';
import leaderboardRoutes from './routes/leaderboard';
import adminRoutes from './routes/admin';
import minesRoutes from './routes/mines';
import towerRoutes from './routes/tower';
import stairsRoutes from './routes/stairs';
import hiloRoutes from './routes/hilo';
import blackjackRoutes from './routes/blackjack';
import pvpRoutes from './routes/pvp';
import rakebackRoutes from './routes/rakeback';

// WebSocket handlers
import { setupCrashSocket } from './websocket/crash';
import { setupTrenballSocket } from './websocket/trenball';
import { setupFastParitySocket } from './websocket/fastparity';
import { setupLudoSocket } from './websocket/ludo';

// Services
import { AutoBetService } from './services/autobet-service';
import { socketManager } from './services/socket-manager';

const PORT = process.env.PORT || 3001;

async function start() {
  // Connect to MongoDB
  await connectDB();
  console.log('✅ MongoDB connected');

  // Create Express app
  const app = express();
  const httpServer = createServer(app);

  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Register routes
  app.use('/api/auth', authRoutes);
  app.use('/api/bet', betRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/game', gameRoutes);
  app.use('/api/seed', seedRoutes);
  app.use('/api/strategy', strategyRoutes);
  app.use('/api/contest', contestRoutes);
  app.use('/api/jackpot', jackpotRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/mines', minesRoutes);
  app.use('/api/tower', towerRoutes);
  app.use('/api/stairs', stairsRoutes);
  app.use('/api/hilo', hiloRoutes);
  app.use('/api/blackjack', blackjackRoutes);
  app.use('/api/pvp', pvpRoutes);
  app.use('/api/rakeback', rakebackRoutes);

  // Setup Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
  });

  // Initialize Socket Manager
  socketManager.setIO(io);
  console.log('✅ Socket.IO initialized');

  // User room management
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`✅ User ${userId} connected to socket`);
    }

    socket.on('disconnect', () => {
      console.log(`❌ User ${userId} disconnected from socket`);
    });
  });

  setupCrashSocket(io);
  setupTrenballSocket(io);
  setupFastParitySocket(io);
  setupLudoSocket(io);

  // Start AutoBet worker
  await AutoBetService.startWorker();
  console.log('✅ AutoBet worker started');

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO ready on ws://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    httpServer.close();
    await disconnectDB();
    process.exit(0);
  });
}

start();
