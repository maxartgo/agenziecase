// Test helpers for backend testing
import sequelize from '../../config/database.js';

/**
 * Clean all tables before/after tests (optimized)
 * Uses TRUNCATE for better performance instead of DELETE
 */
export async function cleanDatabase() {
  const models = await sequelize.models;
  const modelNames = Object.keys(models);

  try {
    // Use TRUNCATE with CASCADE for much better performance
    // This resets sequences and is much faster than DELETE
    await sequelize.query('SET CONSTRAINTS ALL DEFERRED');

    for (const modelName of modelNames) {
      const model = models[modelName];
      const tableName = model.getTableName();

      try {
        // Use TRUNCATE with CASCADE to handle foreign keys
        await sequelize.query(
          `TRUNCATE TABLE "${tableName}" CASCADE`
        );
      } catch (error) {
        // If TRUNCATE fails (e.g., table doesn't exist), fall back to DELETE
        console.warn(`⚠️  Could not TRUNCATE ${tableName}, falling back to DELETE`);
        await model.destroy({ where: {}, force: true });
      }
    }

    await sequelize.query('SET CONSTRAINTS ALL IMMEDIATE');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    // Fallback to original method if TRUNCATE fails
    for (const modelName of modelNames) {
      try {
        await models[modelName].destroy({ where: {}, force: true });
      } catch (err) {
        console.warn(`⚠️  Could not clean ${modelName}:`, err.message);
      }
    }
  }
}

/**
 * Create a test user
 */
export async function createTestUser(overrides = {}) {
  const User = (await import('../../models/User.js')).default;
  const bcrypt = await import('bcrypt');

  // Hash password properly
  const hashedPassword = await bcrypt.hash('password123', 12);

  const defaultUser = {
    email: 'test@example.com',
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isVerified: true,
    ...overrides
  };

  return await User.create(defaultUser);
}

/**
 * Create a test agent
 */
export async function createTestAgent(overrides = {}) {
  return await createTestUser({
    email: 'agent@example.com',
    role: 'agent',
    firstName: 'Test',
    lastName: 'Agent',
    ...overrides
  });
}

/**
 * Create a test admin
 */
export async function createTestAdmin(overrides = {}) {
  return await createTestUser({
    email: 'admin@example.com',
    role: 'admin',
    firstName: 'Test',
    lastName: 'Admin',
    ...overrides
  });
}

/**
 * Create a test property
 */
export async function createTestProperty(overrides = {}) {
  const Property = (await import('../../models/Property.js')).default;

  const defaultProperty = {
    title: 'Test Property',
    description: 'Test property description',
    location: 'Milano',
    price: 350000,
    city: 'Milano',
    address: 'Via Test 1',
    sqm: 100,
    rooms: 3,
    bathrooms: 2,
    propertyType: 'apartment',
    type: 'Vendita', // Italian ENUM
    status: 'disponibile', // Italian ENUM
    ...overrides
  };

  return await Property.create(defaultProperty);
}

/**
 * Generate auth token for a user
 */
export async function generateAuthToken(user) {
  const jwt = await import('jsonwebtoken');
  return jwt.default.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1d' }
  );
}

/**
 * Create authenticated request headers
 */
export function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}
