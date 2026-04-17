import bcrypt from 'bcrypt';
import sequelize from '../config/database.js';

/**
 * Script per creare user record e collegarlo al partner MAXICASA
 * Problema: Il partner è stato registrato ma non ha un user associato per il login
 */
async function fixPartnerUser() {
  try {
    console.log('🔧 Fix partner user per MAXICASA...\n');

    // 1. Trova il partner
    const [partner] = await sequelize.query(`
      SELECT
        p.id,
        p."companyName",
        p.email,
        p.status,
        p."userId"
      FROM partners p
      WHERE p."companyName" ILIKE '%MAXICASA%'
      ORDER BY p."createdAt" DESC
      LIMIT 1
    `, { type: sequelize.QueryTypes.SELECT });

    if (!partner) {
      console.log('❌ Partner MAXICASA non trovato');
      process.exit(1);
    }

    console.log('✅ Partner trovato:');
    console.log(`   ID: ${partner.id}`);
    console.log(`   Company: ${partner.companyName}`);
    console.log(`   Email: ${partner.email}\n`);

    // 2. Verifica se esiste già un user con questa email
    const [existingUser] = await sequelize.query(`
      SELECT id, email, role FROM users WHERE email = :email
    `, {
      replacements: { email: partner.email },
      type: sequelize.QueryTypes.SELECT
    });

    if (existingUser) {
      console.log('⚠️  User già esistente con questa email:');
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Role: ${existingUser.role}\n`);

      // Collega il partner al user esistente
      await sequelize.query(`
        UPDATE partners SET "userId" = :userId WHERE id = :partnerId
      `, {
        replacements: { userId: existingUser.id, partnerId: partner.id }
      });

      console.log('✅ Partner collegato al user esistente!\n');
      process.exit(0);
    }

    // 3. Crea un nuovo user record
    console.log('📝 Creazione nuovo user record...\n');

    // Password temporanea: "partner123" (chiedi all'utente di cambiarla)
    const tempPassword = 'partner123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    // Inserisci il nuovo user
    const [userResult] = await sequelize.query(`
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
        :firstName,
        :lastName,
        'partner',
        true,
        NOW(),
        NOW()
      )
      RETURNING id
    `, {
      replacements: {
        email: partner.email,
        password: hashedPassword,
        firstName: 'Partner',
        lastName: partner.companyName
      },
      type: sequelize.QueryTypes.INSERT
    });

    const newUserId = userResult[0].id;
    console.log(`✅ User creato con ID: ${newUserId}\n`);

    // 4. Collega il partner al nuovo user
    await sequelize.query(`
      UPDATE partners SET "userId" = :userId WHERE id = :partnerId
    `, {
      replacements: { userId: newUserId, partnerId: partner.id }
    });

    console.log('✅ Partner collegato al nuovo user!\n');
    console.log('═══════════════════════════════════════════');
    console.log('🎉 FIX COMPLETATO!\n');
    console.log('Credenziali di accesso:');
    console.log(`   Email: ${partner.email}`);
    console.log(`   Password: ${tempPassword}`);
    console.log('\n⚠️  IMPORTANTE: Chiedi all\'utente di cambiare la password dopo il primo login!');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixPartnerUser();
