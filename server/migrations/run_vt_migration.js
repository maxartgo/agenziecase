import sequelize from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🚀 Starting Virtual Tour Credits migration...\n');

    // Leggi file SQL
    const sqlFile = path.join(__dirname, 'add_virtual_tour_credits.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Splitta per statement (divisi da ;)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Esegui ogni statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);

      try {
        await sequelize.query(statement);
        console.log(`✅ Statement ${i + 1} completed\n`);
      } catch (error) {
        // Ignora errori "already exists" (migration già eseguita)
        if (error.message.includes('already exists') ||
            error.message.includes('duplicate') ||
            error.message.includes('esiste già') ||
            error.message.includes('già esiste')) {
          console.log(`⚠️  Statement ${i + 1} skipped (already exists)\n`);
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          throw error;
        }
      }
    }

    console.log('✅ Migration completed successfully!\n');

    // Verifica tabelle create
    const tables = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'virtual_tour%'
      ORDER BY table_name
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('📊 Virtual Tour tables:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));

    // Verifica colonne aggiunte a partners
    const columns = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'partners'
      AND column_name LIKE 'vt_%'
      ORDER BY column_name
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n📊 Virtual Tour columns in partners:');
    columns.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));

    // Verifica pack inseriti
    const packs = await sequelize.query(`
      SELECT plan_type, plan_name, credits_included, price_monthly
      FROM virtual_tour_packs
      ORDER BY price_monthly
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n📦 Available Virtual Tour Packs:');
    packs.forEach(p => {
      console.log(`   - ${p.plan_name}: ${p.credits_included} credits @ €${p.price_monthly}/mese`);
    });

    console.log('\n🎉 All done!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
