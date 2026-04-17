// CRM Workflows Integration Tests
import request from 'supertest';
import { sequelize, User } from '../../models';
import { createTestApp } from '../helpers/test-app.js';

describe('CRM Workflows Integration Tests', () => {
  let server;
  let app;
  let agentUser, partnerUser;
  let agentToken, partnerToken;

  beforeAll(async () => {
    app = createTestApp();
    server = app.listen(0);
    await sequelize.sync({ force: true });

    // Create test users
    agentUser = await User.create({
      email: 'agent@test.com',
      password: 'Test123456!',
      firstName: 'Agent',
      lastName: 'Test',
      role: 'agent'
    });

    partnerUser = await User.create({
      email: 'partner@test.com',
      password: 'Test123456!',
      firstName: 'Partner',
      lastName: 'Test',
      role: 'partner'
    });

    // Get tokens
    const agentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: agentUser.email, password: 'Test123456!' });
    agentToken = agentLogin.body.token;

    const partnerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: partnerUser.email, password: 'Test123456!' });
    partnerToken = partnerLogin.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
    server.close();
  });

  describe('Basic CRM Operations', () => {
    it('should get CRM stats as agent', async () => {
      const response = await request(app)
        .get('/api/crm/stats')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('totalClients');
      expect(response.body.stats).toHaveProperty('activeDeals');
    });

    it('should get CRM dashboard as partner', async () => {
      const response = await request(app)
        .get('/api/crm/dashboard')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
    });

    it('should create appointment as agent', async () => {
      const appointmentData = {
        clientId: null, // Can be created without client
        propertyId: null,
        title: 'Test Appointment',
        date: '2026-05-01T14:00:00Z',
        location: 'Main Office',
        notes: 'Test appointment for integration testing'
      };

      const response = await request(app)
        .post('/api/crm/appointments')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(appointmentData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.appointment).toHaveProperty('id');
      expect(response.body.appointment).toHaveProperty('title', appointmentData.title);
    });

    it('should get appointments list', async () => {
      const response = await request(app)
        .get('/api/crm/appointments')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('appointments');
      expect(Array.isArray(response.body.appointments)).toBe(true);
    });
  });

  describe('CRM Activities Flow', () => {
    it('should create activity', async () => {
      const activityData = {
        type: 'call',
        description: 'Test call activity',
        outcome: 'positive'
      };

      const response = await request(app)
        .post('/api/crm/activities')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(activityData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.activity).toHaveProperty('type', 'call');
    });

    it('should get activities list', async () => {
      const response = await request(app)
        .get('/api/crm/activities')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('activities');
      expect(Array.isArray(response.body.activities)).toBe(true);
    });
  });

  describe('Partner CRM Features', () => {
    it('should allow partner to view team stats', async () => {
      const response = await request(app)
        .get('/api/crm/stats')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
    });

    it('should allow partner to view team appointments', async () => {
      const response = await request(app)
        .get('/api/crm/appointments')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('appointments');
      expect(Array.isArray(response.body.appointments)).toBe(true);
    });
  });

  describe('CRM Permissions', () => {
    it('should reject CRUD operations without auth', async () => {
      const response = await request(app)
        .post('/api/crm/appointments')
        .send({
          title: 'Unauthorized Appointment',
          date: '2026-05-01T14:00:00Z'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should allow agents to manage their own data', async () => {
      const response = await request(app)
        .get('/api/crm/appointments')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('appointments');
    });
  });
});
