import bcrypt from 'bcrypt';
import sequelize from '../config/database.js';
import { User } from '../models/index.js';

/**
 * Script: Reset password for Marco Bianchi
 */
async function resetMarcoPassword() {
  try {
    console.log('🔄 Resetting password for Marco Bianchi...');

    // Nuova password - più sicura per evitare warning di Google
    const newPassword = 'Marco@2024!Secure';

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

    // Hash della nuova password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Aggiorna la password
    await marco.update({ password: hashedPassword });

    console.log('\n✅ Password updated successfully!');
    console.log(`   Email: ${marco.email}`);
    console.log(`   New Password: ${newPassword}`);
    console.log('\n🔐 You can now login with:');
    console.log(`   Email: ${marco.email}`);
    console.log(`   Password: ${newPassword}`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    await sequelize.close();
    process.exit(1);
  }
}

resetMarcoPassword();
