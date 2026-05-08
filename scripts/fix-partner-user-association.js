#!/usr/bin/env node
/**
 * Script per correggere l'associazione user-partner
 *
 * Questo script corregge i partner esistenti che non hanno il partnerId
 * impostato nella tabella users.
 *
 * Uso: node scripts/fix-partner-user-association.js
 */

import sequelize from '../server/config/database.js';
import { User, Partner } from '../server/models/index.js';

async function fixPartnerUserAssociation() {
  try {
    console.log('🔧 Inizio correzione associazione user-partner...\n');

    // Trova tutti i partner che hanno userId
    const partners = await Partner.findAll({
      where: {
        userId: {
          [sequelize.Op.ne]: null
        }
      }
    });

    console.log(`📊 Trovati ${partners.length} partner con userId\n`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const partner of partners) {
      try {
        // Trova l'utente associato
        const user = await User.findOne({
          where: { id: partner.userId }
        });

        if (!user) {
          console.log(`⚠️  Partner ${partner.id} (${partner.companyName}): UTENTE NON TROVATO`);
          skippedCount++;
          continue;
        }

        // Verifica se ha già il partnerId corretto
        if (user.partnerId === partner.id) {
          console.log(`✅ Partner ${partner.id} (${partner.companyName}): Già corretto`);
          skippedCount++;
          continue;
        }

        // Aggiorna l'utente con il partnerId
        await user.update({ partnerId: partner.id });

        console.log(`🔧 Partner ${partner.id} (${partner.companyName}): CORRETTO - User ${user.id} ora ha partnerId=${partner.id}`);
        fixedCount++;

      } catch (error) {
        console.error(`❌ Errore nel processare partner ${partner.id}:`, error.message);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RIEPILOGO:');
    console.log(`   ✅ Corretti: ${fixedCount}`);
    console.log(`   ⏭️  Saltati: ${skippedCount}`);
    console.log(`   📦 Totali: ${partners.length}`);
    console.log('='.repeat(60));

    if (fixedCount > 0) {
      console.log('\n✅ Correzione completata con successo!');
    } else {
      console.log('\n💡 Tutte le associazioni erano già corrette.');
    }

  } catch (error) {
    console.error('❌ Errore durante la correzione:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Esegui la correzione
fixPartnerUserAssociation();
