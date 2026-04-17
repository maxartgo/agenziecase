// Global setup - runs once before all tests
import sequelize from '../config/database.js';

export default async function globalSetup() {
  console.log('🧪 Setting up test environment...');

  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Test database connected successfully');

    // Sync database (create tables)
    await sequelize.sync({ force: true });
    console.log('✅ Test database synchronized');

    // Note: Each test will create its own data using test helpers
    console.log('✅ Test environment ready');
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    throw error;
  }
}
