/**
 * Cleanup script to fix the crashrounds duplicate key issue
 * Run with: npx tsx scripts/cleanup-crash-index.ts
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

async function cleanup() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.error('❌ DATABASE_URL not found in environment');
        process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(dbUrl);
    console.log('✅ Connected');

    const db = mongoose.connection.db;
    if (!db) {
        console.error('❌ Database connection not established');
        process.exit(1);
    }

    const collection = db.collection('crashrounds');

    try {
        // List current indexes
        console.log('\n📋 Current indexes:');
        const indexes = await collection.indexes();
        indexes.forEach(idx => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        // Drop the old roundNumber_1 index if it exists
        const hasOldIndex = indexes.some(idx => idx.name === 'roundNumber_1');
        if (hasOldIndex) {
            console.log('\n🗑️  Dropping old roundNumber_1 index...');
            await collection.dropIndex('roundNumber_1');
            console.log('✅ Old index dropped');
        }

        // Clear all documents
        console.log('\n🧹 Clearing crashrounds collection...');
        const result = await collection.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} documents`);

        console.log('\n✨ Cleanup complete! You can now restart the backend.');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

cleanup();
