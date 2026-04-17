import sequelize from '../config/database.js';

async function diagnoseLogin() {
  try {
    console.log('🔍 Diagnosi login per partner MAXICASA...\n');

    // 1. Cerca partner MAXICASA
    const [partner] = await sequelize.query(`
      SELECT
        p.id,
        p."companyName",
        p.email,
        p.status,
        p."userId",
        p."createdAt"
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
    console.log(`   Email: ${partner.email}`);
    console.log(`   Status: ${partner.status}`);
    console.log(`   User ID: ${partner.userId || 'NULL ❌'}`);
    console.log(`   Created: ${partner.createdAt}\n`);

    // 2. Se ha userId, cerca l'utente
    if (partner.userId) {
      const [user] = await sequelize.query(`
        SELECT
          id,
          email,
          role,
          password,
          "createdAt"
        FROM users
        WHERE id = :userId
      `, {
        replacements: { userId: partner.userId },
        type: sequelize.QueryTypes.SELECT
      });

      if (!user) {
        console.log('❌ User record NON trovato per userId:', partner.userId);
        console.log('   PROBLEMA: Il partner ha un userId ma il record user non esiste!\n');
      } else {
        console.log('✅ User record trovato:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Password Hash: ${user.password ? 'EXISTS ✅' : 'NULL ❌'}`);
        console.log(`   Created: ${user.createdAt}\n`);

        // Verifica corrispondenza email
        if (user.email !== partner.email) {
          console.log('⚠️  WARNING: Email mismatch!');
          console.log(`   Partner email: ${partner.email}`);
          console.log(`   User email: ${user.email}\n`);
        }

        // Verifica role
        if (user.role !== 'partner') {
          console.log('⚠️  WARNING: Role non è "partner"!');
          console.log(`   Current role: ${user.role}\n`);
        }
      }
    } else {
      console.log('❌ PROBLEMA TROVATO: Partner non ha userId!');
      console.log('   Il partner è stato creato ma non ha un user associato.\n');

      // Cerca se esiste un user con la stessa email
      const [existingUser] = await sequelize.query(`
        SELECT id, email, role
        FROM users
        WHERE email = :email
      `, {
        replacements: { email: partner.email },
        type: sequelize.QueryTypes.SELECT
      });

      if (existingUser) {
        console.log('✅ Trovato user con stessa email:');
        console.log(`   User ID: ${existingUser.id}`);
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Role: ${existingUser.role}\n`);
        console.log('💡 SOLUZIONE: Collegare il partner al user esistente\n');
      } else {
        console.log('❌ Nessun user trovato con email:', partner.email);
        console.log('💡 SOLUZIONE: Creare un nuovo user record e collegarlo al partner\n');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

diagnoseLogin();
