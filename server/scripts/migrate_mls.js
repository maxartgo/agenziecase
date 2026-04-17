import sequelize from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  try {
    console.log('🔄 Esecuzione migrazione MLS (Multiple Listing Service)...\n');

    const sql = fs.readFileSync(
      path.join(__dirname, '../migrations/add_mls_features.sql'),
      'utf8'
    );

    await sequelize.query(sql);

    console.log('✅ Migrazione MLS completata con successo!\n');
    console.log('Tabelle create/aggiornate:');
    console.log('- properties (aggiornata con colonne MLS)');
    console.log('- mls_collaborations');
    console.log('- mls_leads');
    console.log('- mls_transactions');
    console.log('- mls_statistics\n');

    console.log('Funzionalità MLS attive:');
    console.log('✓ Condivisione immobili tra partner');
    console.log('✓ Sistema collaborazioni e split commissioni');
    console.log('✓ Tracking leads da collaborazioni');
    console.log('✓ Statistiche performance MLS\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error.message);
    process.exit(1);
  }
}

migrate();
