// Property CRUD Integration Tests
import request from 'supertest';
import { sequelize, User, Property } from '../../models';
import { createTestApp } from '../helpers/test-app.js';

describe('Property CRUD Integration Tests', () => {
  let server;
  let app;
  let agentUser, partnerUser, adminUser;
  let agentToken, partnerToken, adminToken;
  let testProperty;

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

    adminUser = await User.create({
      email: 'admin@test.com',
      password: 'Test123456!',
      firstName: 'Admin',
      lastName: 'Test',
      role: 'admin'
    });

    // Login to get tokens
    const agentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: agentUser.email, password: 'Test123456!' });
    agentToken = agentLogin.body.token;

    const partnerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: partnerUser.email, password: 'Test123456!' });
    partnerToken = partnerLogin.body.token;

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: 'Test123456!' });
    adminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
    server.close();
  });

  describe('Property Creation Flow', () => {
    it('should create property as agent', async () => {
      const propertyData = {
        title: 'Villa Test Integration',
        description: 'Description for testing',
        price: 250000,
        surfaceArea: 120,
        rooms: 4,
        bathrooms: 2,
        city: 'Milano',
        address: 'Via Test 123',
        type: 'sale',
        status: 'available',
        images: ['image1.jpg', 'image2.jpg']
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.property).toHaveProperty('id');
      expect(response.body.property).toHaveProperty('title', propertyData.title);
      expect(response.body.property).toHaveProperty('agentId', agentUser.id);

      testProperty = response.body.property;
    });

    it('should create property as partner', async () => {
      const propertyData = {
        title: 'Partner Property Test',
        description: 'Partner property testing',
        price: 350000,
        surfaceArea: 150,
        rooms: 5,
        bathrooms: 3,
        city: 'Roma',
        address: 'Via Partner 456',
        type: 'sale',
        status: 'available',
        partnerId: partnerUser.id
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.property).toHaveProperty('partnerId', partnerUser.id);
    });

    it('should reject property creation without auth', async () => {
      const response = await request(app)
        .post('/api/properties')
        .send({
          title: 'Unauthorized Property',
          price: 100000
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Property Reading Flow', () => {
    it('should get all properties', async () => {
      const response = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(response.body).toHaveProperty('properties');
      expect(Array.isArray(response.body.properties)).toBe(true);
      expect(response.body.properties.length).toBeGreaterThan(0);
    });

    it('should get single property by ID', async () => {
      const response = await request(app)
        .get(`/api/properties/${testProperty.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('property');
      expect(response.body.property).toHaveProperty('id', testProperty.id);
      expect(response.body.property).toHaveProperty('title', testProperty.title);
    });

    it('should filter properties by city', async () => {
      const response = await request(app)
        .get('/api/properties?city=Milano')
        .expect(200);

      expect(response.body).toHaveProperty('properties');
      response.body.properties.forEach(prop => {
        expect(prop.city).toBe('Milano');
      });
    });

    it('should filter properties by type', async () => {
      const response = await request(app)
        .get('/api/properties?type=sale')
        .expect(200);

      expect(response.body).toHaveProperty('properties');
      response.body.properties.forEach(prop => {
        expect(prop.type).toBe('sale');
      });
    });

    it('should return 404 for non-existent property', async () => {
      const response = await request(app)
        .get('/api/properties/999999')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Property Update Flow', () => {
    it('should update own property as agent', async () => {
      const updates = {
        title: 'Updated Villa Test',
        price: 275000
      };

      const response = await request(app)
        .put(`/api/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.property).toHaveProperty('title', updates.title);
      expect(response.body.property).toHaveProperty('price', updates.price);
    });

    it('should allow admin to update any property', async () => {
      const response = await request(app)
        .put(`/api/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Updated Title' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.property).toHaveProperty('title', 'Admin Updated Title');
    });
  });

  describe('Property Search Flow', () => {
    it('should search properties by price range', async () => {
      const response = await request(app)
        .get('/api/properties?minPrice=200000&maxPrice=400000')
        .expect(200);

      expect(response.body).toHaveProperty('properties');
      response.body.properties.forEach(prop => {
        expect(prop.price).toBeGreaterThanOrEqual(200000);
        expect(prop.price).toBeLessThanOrEqual(400000);
      });
    });

    it('should search properties by surface area', async () => {
      const response = await request(app)
        .get('/api/properties?minSurface=100&maxSurface=200')
        .expect(200);

      expect(response.body).toHaveProperty('properties');
      response.body.properties.forEach(prop => {
        expect(prop.surfaceArea).toBeGreaterThanOrEqual(100);
        expect(prop.surfaceArea).toBeLessThanOrEqual(200);
      });
    });

    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/api/properties?city=Milano&type=sale&minPrice=200000')
        .expect(200);

      expect(response.body).toHaveProperty('properties');
      response.body.properties.forEach(prop => {
        expect(prop.city).toBe('Milano');
        expect(prop.type).toBe('sale');
        expect(prop.price).toBeGreaterThanOrEqual(200000);
      });
    });
  });
});
