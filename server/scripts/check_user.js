import sequelize from '../config/database.js';

async function checkUser() {
  try {
    console.log('🔍 Cercando utente "max win"...\n');

    const [users] = await sequelize.query(`
      SELECT
        u.id,
        u.email,
        u."firstName",
        u."lastName",
        u.role,
        u."isVerified",
        p.id as partner_id,
        p."companyName",
        p."vatNumber",
        p.status as partner_status,
        p."crmSubscriptionActive",
        p."crmSubscriptionPlan",
        p."crmTeamSize"
      FROM users u
      LEFT JOIN partners p ON u.id = p."userId"
      WHERE
        u."firstName" ILIKE '%max%' OR
        u."lastName" ILIKE '%win%' OR
        u.email ILIKE '%max%' OR
        p."companyName" ILIKE '%max%'
      ORDER BY u.id DESC
      LIMIT 5
    `);

    if (users.length === 0) {
      console.log('❌ Nessun utente trovato con "max" o "win"\n');

      // Mostra gli ultimi 3 utenti registrati
      console.log('📋 Ultimi 3 utenti registrati:\n');
      const [recentUsers] = await sequelize.query(`
        SELECT
          u.id,
          u.email,
          u."firstName",
          u."lastName",
          u.role,
          u.created_at
        FROM users u
        ORDER BY u.id DESC
        LIMIT 3
      `);

      recentUsers.forEach(user => {
        console.log('---');
        console.log('ID:', user.id);
        console.log('Nome:', user.firstName, user.lastName);
        console.log('Email:', user.email);
        console.log('Ruolo:', user.role);
        console.log('Creato:', user.created_at);
        console.log('');
      });
    } else {
      users.forEach(user => {
        console.log('================================');
        console.log('👤 USER INFO');
        console.log('================================');
        console.log('User ID:', user.id);
        console.log('Nome:', user.firstName, user.lastName);
        console.log('Email:', user.email);
        console.log('Ruolo:', user.role);
        console.log('Email Verificata:', user.isVerified ? '✅ Sì' : '❌ No');

        if (user.partner_id) {
          console.log('\n🏢 PARTNER INFO');
          console.log('================================');
          console.log('Partner ID:', user.partner_id);
          console.log('Azienda:', user.companyName);
          console.log('P.IVA:', user.vatNumber);
          console.log('Status:', user.partner_status);

          console.log('\n📊 CRM SUBSCRIPTION');
          console.log('================================');
          console.log('Abbonamento CRM:', user.crmSubscriptionActive ? '✅ Attivo' : '❌ Non attivo');
          if (user.crmSubscriptionActive) {
            console.log('Piano:', user.crmSubscriptionPlan);
            console.log('Team Size:', user.crmTeamSize);
          }
        }
        console.log('\n');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

checkUser();
