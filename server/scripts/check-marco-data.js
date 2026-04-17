import sequelize from '../config/database.js';
import { User, Partner } from '../models/index.js';

/**
 * Script: Check Marco Bianchi data
 */
async function checkMarcoData() {
  try {
    console.log('🔍 Checking Marco Bianchi data...\n');

    // Find Marco Bianchi user
    const marco = await User.findOne({
      where: {
        email: 'test@agenziatest.it'
      }
    });

    if (!marco) {
      console.error('❌ User not found with email: test@agenziatest.it');
      process.exit(1);
    }

    console.log('👤 USER DATA:');
    console.log(`   ID: ${marco.id}`);
    console.log(`   Email: ${marco.email}`);
    console.log(`   First Name: ${marco.firstName}`);
    console.log(`   Last Name: ${marco.lastName}`);
    console.log(`   Role: ${marco.role}`);
    console.log(`   Phone: ${marco.phone}`);
    console.log(`   Created: ${marco.createdAt}`);

    // Find Partner record
    const partner = await Partner.findOne({
      where: { userId: marco.id }
    });

    if (partner) {
      console.log('\n🏢 PARTNER DATA:');
      console.log(`   ID: ${partner.id}`);
      console.log(`   Company Name: ${partner.companyName}`);
      console.log(`   VAT Number: ${partner.vatNumber}`);
      console.log(`   Email: ${partner.email}`);
      console.log(`   Phone: ${partner.phone}`);
      console.log(`   Address: ${partner.address}`);
      console.log(`   City: ${partner.city}`);
      console.log(`   Status: ${partner.status}`);
    } else {
      console.log('\n⚠️  No Partner record found for this user');
    }

    console.log('\n✅ Check complete!');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking data:', error);
    await sequelize.close();
    process.exit(1);
  }
}

checkMarcoData();
