// CRITICAL: Load environment variables FIRST before any other imports read them
import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

// Load from monorepo root as fallback
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { createOptimizedIndexes } from './indexes';

// Now DATABASE_URL is available
const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/casinobit';
console.log('🔗 Database connecting to:', MONGODB_URI.includes('betstake') ? 'betstake' : MONGODB_URI.split('/').pop()?.split('?')[0]);

let isConnected = false;

// Production-optimized MongoDB configuration for casino platform
const mongoOptions = {
  maxPoolSize: 100,
  minPoolSize: 10,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 5000
  },
  readPreference: 'primary',
  readConcern: { level: 'majority' },
  heartbeatFrequencyMS: 10000
};

export const connectDB = async () => {
  if (isConnected) return;

  try {
    mongoose.set('strictQuery', true);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected with optimized configuration');
      console.log(`📊 Pool size: ${mongoOptions.maxPoolSize} connections`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
    });

    await mongoose.connect(MONGODB_URI, mongoOptions);

    // Create optimized indexes
    console.log('🔧 Creating optimized MongoDB indexes...');
    await createOptimizedIndexes();
    console.log('✅ All MongoDB indexes created successfully');

    isConnected = true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('✅ MongoDB disconnected gracefully');
};

// Health check
export const checkDBHealth = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return { status: 'healthy', connected: isConnected };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};

export * from './schemas';
export * from './indexes';