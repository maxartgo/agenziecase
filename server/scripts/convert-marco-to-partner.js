import sequelize from '../config/database.js';
import { User, Partner } from '../models/index.js';

/**
 * Script: Convert Marco Bianchi from agent to partner
 */
async function convertMarcoToPartner() {
  try {
    console.log('🔄 Converting Marco Bianchi to Partner...');

    // Find Marco Bianchi user
    const marco = await User.findOne({
      where: {
        firstName: 'Marco',
        lastName: 'Bianchi'
      }
    });

    if (!marco) {
      console.error('❌ Marco Bianchi not found in database');
      process.exit(1);
    }

    console.log(`📋 Found user: ${marco.firstName} ${marco.lastName} (${marco.email})`);
    console.log(`   Current role: ${marco.role}`);

    // Update role to 'partner'
    await marco.update({ role: 'partner' });
    console.log('✅ Updated role to "partner"');

    // Check if Partner record already exists
    let partner = await Partner.findOne({
      where: { userId: marco.id }
    });

    if (partner) {
      console.log(`✅ Partner record already exists (ID: ${partner.id})`);
    } else {
      // Create Partner record
      partner = await Partner.create({
        userId: marco.id,
        companyName: 'Agenzia Marco Bianchi', // Default name - can be updated later
        vatNumber: '00000000000', // Placeholder - needs to be updated
        phone: marco.phone || '+39 000 000 0000',
        email: marco.email,
        address: 'Via Placeholder 1', // Placeholder - needs to be updated
        city: 'Roma', // Placeholder - needs to be updated
        province: 'RM',
        zipCode: '00000',
        status: 'active', // Set as active immediately
        termsAccepted: true,
        privacyAccepted: true,
        termsAcceptedAt: new Date(),
        approvedAt: new Date()
      });
      console.log(`✅ Created Partner record (ID: ${partner.id})`);
    }

    console.log('\n✅ Successfully converted Marco Bianchi to Partner!');
    console.log(`   User ID: ${marco.id}`);
    console.log(`   Partner ID: ${partner.id}`);
    console.log('\n⚠️  Remember to update these placeholder values:');
    console.log('   - Company Name: "Agenzia Marco Bianchi"');
    console.log('   - VAT Number: "00000000000"');
    console.log('   - Address: "Via Placeholder 1"');
    console.log('   - City: "Roma"');
    console.log('   - Province: "RM"');
    console.log('   - ZIP Code: "00000"');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error converting Marco to Partner:', error);
    await sequelize.close();
    process.exit(1);
  }
}

convertMarcoToPartner();
