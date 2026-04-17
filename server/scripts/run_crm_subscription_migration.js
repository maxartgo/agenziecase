import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Starting CRM Subscription migration...\n');

    // Leggi il file SQL
    const migrationPath = path.join(__dirname, '../migrations/add_crm_subscription.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Esegui la migration
    await sequelize.query(sql);

    console.log('✅ CRM Subscription migration completed successfully!\n');
    console.log('📊 Created fields:');
    console.log('   - crmSubscriptionActive (boolean)');
    console.log('   - crmSubscriptionPlan (varchar)');
    console.log('   - crmTeamSize (integer)');
    console.log('   - crmMonthlyPrice (decimal)');
    console.log('   - crmAnnualPrice (decimal)');
    console.log('   - crmSubscriptionStart (timestamp)');
    console.log('   - crmSubscriptionEnd (timestamp)');
    console.log('   - crmPaymentType (varchar)');
    console.log('   - crmLastPayment (timestamp)');
    console.log('   - crmAutoRenew (boolean)');
    console.log('\n📋 Created table:');
    console.log('   - crm_subscription_payments (payment history)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
