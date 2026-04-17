import sequelize from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  try {
    console.log('🔄 Esecuzione migrazione support tickets...\n');

    const sql = fs.readFileSync(
      path.join(__dirname, '../migrations/create_support_tickets.sql'),
      'utf8'
    );

    await sequelize.query(sql);

    console.log('✅ Migrazione completata con successo!\n');
    console.log('Tabelle create:');
    console.log('- support_tickets');
    console.log('- support_ticket_responses\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error.message);
    process.exit(1);
  }
}

migrate();
