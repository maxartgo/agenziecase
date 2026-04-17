// Global teardown - runs once after all tests
import sequelize from '../config/database.js';

export default async function globalTeardown() {
  console.log('🧹 Tearing down test environment...');

  try {
    // Close database connection
    await sequelize.close();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('❌ Test teardown failed:', error);
    throw error;
  }
}
