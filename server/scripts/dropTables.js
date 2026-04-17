import sequelize from '../config/database.js';

const dropAllTables = async () => {
  try {
    console.log('🗑️  Dropping all tables and types...');

    // Drop tables
    await sequelize.query('DROP TABLE IF EXISTS favorites CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS partners CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS agents CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS subscriptions CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS properties CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS users CASCADE;');

    // Drop ENUM types
    await sequelize.query('DROP TYPE IF EXISTS "enum_partners_status" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_agents_status" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_subscriptions_status" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_subscriptions_plan" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_properties_type" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_properties_propertyType" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_properties_status" CASCADE;');

    console.log('✅ All tables and types dropped successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping tables:', error.message);
    process.exit(1);
  }
};

dropAllTables();
