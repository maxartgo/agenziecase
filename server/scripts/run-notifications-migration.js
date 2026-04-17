import sequelize from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script per eseguire la migration delle notifiche
 */
const runMigration = async () => {
  try {
    console.log('🔄 Avvio migration tabella notifications...\n');

    // Leggi il file SQL
    const migrationPath = path.join(__dirname, '../migrations/004_create_notifications.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    // Esegui la migration
    await sequelize.query(sqlContent);

    console.log('✅ Migration completata con successo!');
    console.log('\n📊 Tabelle create:');
    console.log('   - notifications');
    console.log('   - notification_preferences');
    console.log('\n🎉 Sistema notifiche pronto all\'uso!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Errore durante la migration:', error.message);
    process.exit(1);
  }
};

runMigration();
