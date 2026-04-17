import sequelize from '../config/database.js';

/**
 * Migration: Add 'partner' to user role enum
 */
async function addPartnerRole() {
  try {
    console.log('🔄 Adding "partner" to role enum...');

    // Add 'partner' to the enum type
    await sequelize.query(`
      ALTER TYPE enum_users_role ADD VALUE IF NOT EXISTS 'partner';
    `);

    console.log('✅ Successfully added "partner" to role enum');

    // Close the connection
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding partner role:', error);
    await sequelize.close();
    process.exit(1);
  }
}

addPartnerRole();
