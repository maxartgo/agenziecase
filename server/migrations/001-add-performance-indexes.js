/**
 * Migration: Add Performance Indexes
 * Description: Add critical database indexes for Property and User models
 * Run: node server/migrations/001-add-performance-indexes.js
 */

import sequelize from '../config/database.js';
import { Property } from '../models/index.js';
import { User } from '../models/index.js';

const runMigration = async () => {
  try {
    console.log('🔄 Starting migration: Add Performance Indexes...');

    // Sync models with alter: true to create new indexes
    await Property.sync({ alter: true });
    console.log('✅ Property model indexes created');

    await User.sync({ alter: true });
    console.log('✅ User model indexes created');

    // Verify indexes were created
    const [propertyIndexes] = await sequelize.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'properties'
      ORDER BY indexname;
    `);

    const [userIndexes] = await sequelize.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'users'
      ORDER BY indexname;
    `);

    console.log('\n📊 Property Indexes:');
    propertyIndexes.forEach(idx => console.log(`  - ${idx.indexname}`));

    console.log('\n📊 User Indexes:');
    userIndexes.forEach(idx => console.log(`  - ${idx.indexname}`));

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
