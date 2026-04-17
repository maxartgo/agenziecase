import sequelize from '../config/database.js';

async function activatePartner() {
  try {
    // Cerca partner per company name (usa nomi colonne corretti: camelCase)
    const [partner] = await sequelize.query(`
      SELECT p.*, p.email, p."companyName", p."userId"
      FROM partners p
      WHERE p."companyName" ILIKE '%Max Art%'
      ORDER BY p."createdAt" DESC
      LIMIT 1
    `, { type: sequelize.QueryTypes.SELECT });

    if (!partner) {
      console.log('❌ Partner "Max Art" non trovato');
      console.log('Provo a cercare gli ultimi partner registrati...\n');

      const recent = await sequelize.query(`
        SELECT p."companyName", p.email, p.status, p."createdAt"
        FROM partners p
        ORDER BY p."createdAt" DESC
        LIMIT 5
      `, { type: sequelize.QueryTypes.SELECT });

      console.log('📋 Ultimi 5 partner registrati:');
      recent.forEach(p => {
        console.log(`- ${p.companyName} (${p.email}) - Status: ${p.status}`);
      });
      process.exit(1);
    }

    console.log(`\n✅ Trovato partner: ${partner.companyName}`);
    console.log(`Email: ${partner.email}`);
    console.log(`Status attuale: ${partner.status}`);
    console.log(`User ID: ${partner.userId || 'NULL'}`);

    // Attiva partner
    await sequelize.query(`
      UPDATE partners
      SET status = 'active'
      WHERE id = :partnerId
    `, {
      replacements: { partnerId: partner.id }
    });

    console.log('✅ Partner status aggiornato a "active"');

    // Se ha un userId, attiva anche il user (isVerified = true)
    if (partner.userId) {
      await sequelize.query(`
        UPDATE users
        SET "isVerified" = true
        WHERE id = :userId
      `, {
        replacements: { userId: partner.userId }
      });
      console.log('✅ User verificato (isVerified = true)');
    } else {
      console.log('⚠️  WARNING: Partner non ha userId collegato! Potrebbe non riuscire a fare login.');
    }

    console.log('\n🎉 Partner attivato con successo!');
    console.log(`\nCredenziali di accesso:`);
    console.log(`Email: ${partner.email}`);
    console.log(`Password: [quella inserita durante registrazione]`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

activatePartner();
