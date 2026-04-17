// Auth Controller Unit Tests (simplified version)
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { register, login, getCurrentUser, updateProfile, changePassword } from '../../../controllers/authController.js';
import User from '../../../models/User.js';
import sequelize from '../../../config/database.js';
import { cleanDatabase } from '../../helpers/test-setup.js';

describe('Auth Controller', () => {
  let testUser;
  let app;

  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Create test user
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    });

    // Create fresh Express app for each test
    app = express();
    app.use(express.json());

    // Mock auth middleware using current test user ID
    const mockAuth = (req, res, next) => {
      req.user = { id: testUser.id };
      next();
    };

    // Setup routes
    app.post('/api/auth/register', register);
    app.post('/api/auth/login', login);
    app.get('/api/auth/me', mockAuth, getCurrentUser);
    app.put('/api/auth/me', mockAuth, updateProfile);
    app.post('/api/auth/change-password', mockAuth, changePassword);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'newpassword123',
          firstName: 'New',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registrazione completata con successo');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register user with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should not register user with duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user data', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).not.toHaveProperty('password');
    });
  });

  describe('PUT /api/auth/me', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/auth/me')
        .send({
          firstName: 'Updated',
          lastName: 'Name'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.firstName).toBe('Updated');
      expect(response.body.user.lastName).toBe('Name');
    });

    it('should update only provided fields', async () => {
      const originalLastName = testUser.lastName;

      const response = await request(app)
        .put('/api/auth/me')
        .send({
          firstName: 'OnlyFirst'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.firstName).toBe('OnlyFirst');
      expect(response.body.user.lastName).toBe(originalLastName);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should not change password with invalid current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not change password with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should be able to login with new password after change', async () => {
      // Change password
      await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456'
        });

      // Try login with new password (should succeed)
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'newpassword456'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
