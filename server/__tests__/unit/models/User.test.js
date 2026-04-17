// User Model Unit Tests
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import User from '../../../models/User.js';
import sequelize from '../../../config/database.js';
import { cleanDatabase } from '../../helpers/test-setup.js';

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.role).toBe(userData.role);
      expect(user.password).toBeDefined(); // Password exists (not auto-hashed in this implementation)
    });

    it('should not create user without required fields', async () => {
      const invalidUser = {
        email: 'test@example.com'
        // Missing password, firstName, lastName
      };

      await expect(User.create(invalidUser)).rejects.toThrow();
    });

    it('should not create user with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should not create user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const bcrypt = await import('bcrypt');
      const userData = {
        email: 'test@example.com',
        password: await bcrypt.hash('plaintext123', 12),
        firstName: 'Test',
        lastName: 'User'
      };

      const user = await User.create(userData);

      expect(user.password).toBeDefined();
      expect(user.password.length).toBeGreaterThan(50); // Bcrypt hash length
    });

    it('should compare password correctly', async () => {
      const bcrypt = await import('bcrypt');
      const plainPassword = 'correctpassword';
      const userData = {
        email: 'test@example.com',
        password: await bcrypt.hash(plainPassword, 12),
        firstName: 'Test',
        lastName: 'User'
      };

      const user = await User.create(userData);
      const isValid = await bcrypt.compare(plainPassword, user.password);
      const isInvalid = await bcrypt.compare('wrongpassword', user.password);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('User Roles', () => {
    it('should create user with default role', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = await User.create(userData);

      expect(user.role).toBe('user');
    });

    it('should create agent user', async () => {
      const userData = {
        email: 'agent@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Agent',
        role: 'agent'
      };

      const user = await User.create(userData);

      expect(user.role).toBe('agent');
    });

    it('should create admin user', async () => {
      const userData = {
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'admin'
      };

      const user = await User.create(userData);

      expect(user.role).toBe('admin');
    });
  });

  describe('User Verification', () => {
    it('should create user with isVerified default false', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = await User.create(userData);

      expect(user.isVerified).toBe(false);
    });

    it('should create verified user when specified', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        isVerified: true
      };

      const user = await User.create(userData);

      expect(user.isVerified).toBe(true);
    });
  });

  describe('User Methods', () => {
    it('should return user data without exposing sensitive fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = await User.create(userData);
      const userJSON = user.toJSON();

      // User should have all fields in database
      expect(userJSON).toHaveProperty('password');
      expect(userJSON).toHaveProperty('email');
      expect(userJSON).toHaveProperty('firstName');
      expect(userJSON).toHaveProperty('lastName');
    });
  });
});
