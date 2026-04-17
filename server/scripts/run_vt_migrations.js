import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    console.log('🚀 Running Virtual Tour migrations...\n');

    // 1. Add virtual tour fields to properties
    console.log('📝 Step 1: Adding virtual tour fields to properties table...');
    const migration1 = fs.readFileSync(
      path.join(__dirname, '../migrations/add_virtual_tour_fields.sql'),
      'utf8'
    );
    await sequelize.query(migration1);
    console.log('✅ Virtual tour fields added to properties\n');

    // 2. Create virtual_tour_requests table
    console.log('📝 Step 2: Creating virtual_tour_requests table...');
    const migration2 = fs.readFileSync(
      path.join(__dirname, '../migrations/create_virtual_tour_requests.sql'),
      'utf8'
    );
    await sequelize.query(migration2);
    console.log('✅ virtual_tour_requests table created\n');

    console.log('🎉 All migrations completed successfully!\n');
    console.log('Database is ready for Virtual Tour workflow:\n');
    console.log('  ✓ properties.virtualTourUrl - URL del tour Kuula');
    console.log('  ✓ properties.vtRequestStatus - Stato richiesta');
    console.log('  ✓ virtual_tour_requests table - Gestione richieste\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runMigrations();
