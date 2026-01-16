import { connectDB, disconnectDB } from '../index';
import { seedGameConfigurations } from './game-config.seeder';
import { seedJackpotConfigurations } from './jackpot.seeder';

export const runAllSeeders = async () => {
  try {
    console.log('🚀 Starting database seeding process...');
    
    await connectDB();
    
    // Seed game configurations
    await seedGameConfigurations();
    
    // Seed jackpot configurations
    await seedJackpotConfigurations();
    
    console.log('✅ All seeders completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await disconnectDB();
  }
};

// Run if called directly
if (require.main === module) {
  runAllSeeders()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}