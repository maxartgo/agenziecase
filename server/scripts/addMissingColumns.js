import sequelize from '../config/database.js';
import { testConnection } from '../config/database.js';

const addMissingColumns = async () => {
  try {
    console.log('🔧 Adding missing columns to properties table...');

    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Cannot connect to database');
      process.exit(1);
    }

    // Check if columns exist and add them if they don't
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='properties' AND column_name='partnerId') THEN
          ALTER TABLE properties ADD COLUMN "partnerId" INTEGER;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='properties' AND column_name='agentId') THEN
          ALTER TABLE properties ADD COLUMN "agentId" INTEGER;
        END IF;
      END $$;
    `);

    console.log('✅ Missing columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    process.exit(1);
  }
};

addMissingColumns();
