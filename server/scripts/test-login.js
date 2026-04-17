import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sequelize from '../config/database.js';
import { User } from '../models/index.js';

/**
 * Script: Test login for Marco Bianchi
 */
async function testLogin() {
  try {
    const email = 'test@agenziatest.it';
    const password = 'password123';

    console.log('🔐 Testing login...');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found');
    console.log(`   ID: ${user.id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Stored password hash: ${user.password.substring(0, 20)}...\n`);

    // Test password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.error('❌ Password does NOT match');
      console.log('\n🔍 Testing if password is already hashed...');

      // Try with the raw password
      const testHash = await bcrypt.hash(password, 10);
      console.log(`   New hash would be: ${testHash.substring(0, 20)}...`);

      process.exit(1);
    }

    console.log('✅ Password matches!');

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    console.log('\n✅ Login would be successful!');
    console.log(`   Token: ${token.substring(0, 30)}...`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing login:', error);
    await sequelize.close();
    process.exit(1);
  }
}

testLogin();
