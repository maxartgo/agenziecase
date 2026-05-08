#!/usr/bin/env node
/**
 * Script per resettare la password di un utente
 * Uso: node scripts/reset-password.js <email> <nuova_password>
 */

import bcrypt from 'bcrypt';
import sequelize from '../server/config/database.js';
import { User } from '../server/models/index.js';

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Uso: node scripts/reset-password.js <email> <nuova_password>');
  process.exit(1);
}

async function resetPassword() {
  try {
    // Genera hash della password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Aggiorna la password
    const [affectedCount] = await User.update(
      { password: hashedPassword },
      { where: { email } }
    );

    if (affectedCount === 0) {
      console.log(`❌ Utente con email '${email}' non trovato`);
      process.exit(1);
    }

    console.log(`✅ Password aggiornata per '${email}'`);
    console.log(`   Nuova password: ${newPassword}`);

  } catch (error) {
    console.error('❌ Errore:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

resetPassword();
