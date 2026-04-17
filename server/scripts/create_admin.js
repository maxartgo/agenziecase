import bcrypt from 'bcrypt';
import sequelize from '../config/database.js';

/**
 * Script per creare utente admin
 * Email: admin@agenziecase.it
 * Password: admin123 (da cambiare dopo primo login)
 */
async function createAdmin() {
  try {
    console.log('🔧 Creazione utente admin...\n');

    const email = 'admin@agenziecase.it';
    const password = 'admin123';

    // Verifica se admin esiste già
    const [existingAdmin] = await sequelize.query(`
      SELECT id, email, role FROM users WHERE email = :email
    `, {
      replacements: { email },
      type: sequelize.QueryTypes.SELECT
    });

    if (existingAdmin) {
      console.log('⚠️  Admin già esistente:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin.id}\n`);

      // Aggiorna password se necessario
      const updatePassword = true; // Cambia a false se non vuoi resettare password

      if (updatePassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await sequelize.query(`
          UPDATE users
          SET password = :password, role = 'admin', "isVerified" = true
          WHERE id = :userId
        `, {
          replacements: {
            password: hashedPassword,
            userId: existingAdmin.id
          }
        });
        console.log('✅ Password admin aggiornata!\n');
      }

      console.log('═══════════════════════════════════════════');
      console.log('🎉 ADMIN READY!\n');
      console.log('Credenziali di accesso:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log('\n⚠️  IMPORTANTE: Cambia la password dopo il primo login!');
      console.log('═══════════════════════════════════════════\n');
      process.exit(0);
    }

    // Crea nuovo admin
    console.log('📝 Creazione nuovo utente admin...\n');

    const hashedPassword = await bcrypt.hash(password, 10);

    const [adminResult] = await sequelize.query(`
      INSERT INTO users (
        email,
        password,
        "firstName",
        "lastName",
        role,
        "isVerified",
        created_at,
        updated_at
      ) VALUES (
        :email,
        :password,
        'Admin',
        'AgenzieCase',
        'admin',
        true,
        NOW(),
        NOW()
      )
      RETURNING id
    `, {
      replacements: {
        email,
        password: hashedPassword
      },
      type: sequelize.QueryTypes.INSERT
    });

    const adminId = adminResult[0].id;
    console.log(`✅ Admin creato con ID: ${adminId}\n`);

    console.log('═══════════════════════════════════════════');
    console.log('🎉 ADMIN CREATO CON SUCCESSO!\n');
    console.log('Credenziali di accesso:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  IMPORTANTE: Cambia la password dopo il primo login!');
    console.log('\nFunzionalità disponibili:');
    console.log('   ✓ Gestione Virtual Tour Requests');
    console.log('   ✓ Dashboard CRM completa');
    console.log('   ✓ Gestione Partners');
    console.log('   ✓ Gestione Agents');
    console.log('   ✓ Gestione Properties');
    console.log('   ✓ Statistiche complete');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createAdmin();
