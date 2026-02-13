// Environment is now loaded by @casino/database package
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
import fastparityJackpotRoutes from './routes/fastparity-jackpot';
import crashJackpotRoutes from './routes/crash-jackpot';
import challengeAdminRoutes from './routes/challenge-admin';
import activityLogsRoutes from './routes/activity-logs';
import jackpotConditionsRoutes from './routes/jackpot-conditions';
import rakebackAdminRoutes from './routes/rakeback-admin';
import financialReportsRoutes from './routes/financial-reports';
import platformSettingsRoutes from './routes/platform-settings';

// WebSocket handlers
import { setupCrashSocket } from './websocket/crash';
import { setupFastParitySocket } from './websocket/fastparity';
import { setupLudoSocket } from './websocket/ludo';

// Services
import { AutoBetService } from './services/autobet-service';
import { socketManager } from './services/socket-manager';
import { RakebackService } from './services/rakeback-service';

import { gameRegistry } from '@casino/game-engine';

const PORT = process.env.PORT || 3001;

async function start() {
  // Connect to MongoDB
  await connectDB();
  console.log('✅ MongoDB connected');

  // Sync game configs with platform settings from DB
  await gameRegistry.syncWithPlatformSettings();

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
  app.use('/api/fastparity-jackpot', fastparityJackpotRoutes);
  app.use('/api/crash-jackpot', crashJackpotRoutes);
  app.use('/api/admin/challenges', challengeAdminRoutes);
  app.use('/api/admin/logs', activityLogsRoutes);
  app.use('/api/admin/jackpot-conditions', jackpotConditionsRoutes);
  app.use('/api/admin/rakeback', rakebackAdminRoutes);
  app.use('/api/admin/reports', financialReportsRoutes);
  app.use('/api/admin/settings', platformSettingsRoutes);

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

  // Schedule daily rakeback generation
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const msUntilMidnight = midnight.getTime() - now.getTime();

  // Run first rakeback generation at next midnight, then every 24 hours
  setTimeout(() => {
    RakebackService.generateRakeback('daily')
      .then(() => console.log('✅ Daily rakeback generated'))
      .catch(err => console.error('❌ Rakeback generation error:', err));

    setInterval(() => {
      RakebackService.generateRakeback('daily')
        .then(() => console.log('✅ Daily rakeback generated'))
        .catch(err => console.error('❌ Rakeback generation error:', err));
    }, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
  console.log(`⏰ Rakeback scheduler set — first run at midnight (${Math.round(msUntilMidnight / 60000)} min)`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    httpServer.close();
    await disconnectDB();
    process.exit(0);
  });
}

start();
