// Property Controller Unit Tests
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} from '../../../controllers/propertyController.js';
import Property from '../../../models/Property.js';
import User from '../../../models/User.js';
import sequelize from '../../../config/database.js';
import { cleanDatabase } from '../../helpers/test-setup.js';

describe('Property Controller', () => {
  let testUser;
  let testProperty;
  let app;

  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Create test user (agent)
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await User.create({
      email: 'agent@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Agent',
      role: 'agent'
    });

    // Create test properties
    testProperty = await Property.create({
      title: 'Villa Test',
      description: 'Bellissima villa',
      location: 'Milano',
      price: 500000,
      city: 'Milano',
      address: 'Via Test 1',
      sqm: 200,
      rooms: 5,
      bathrooms: 3,
      propertyType: 'villa',
      type: 'Vendita',
      status: 'disponibile'
    });

    await Property.create({
      title: 'Appartamento Roma',
      description: 'Appartamento centro',
      location: 'Roma',
      price: 300000,
      city: 'Roma',
      address: 'Via Roma 1',
      sqm: 100,
      rooms: 3,
      bathrooms: 1,
      propertyType: 'appartamento',
      type: 'Vendita',
      status: 'disponibile'
    });

    // Create Express app
    app = express();
    app.use(express.json());

    // Setup routes (no auth required for basic tests)
    app.get('/api/properties', getAllProperties);
    app.get('/api/properties/:id', getPropertyById);
    app.post('/api/properties', createProperty);
    app.put('/api/properties/:id', updateProperty);
    app.delete('/api/properties/:id', deleteProperty);
  });

  describe('GET /api/properties', () => {
    it('should get all properties', async () => {
      const response = await request(app)
        .get('/api/properties');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.total).toBe(2);
      expect(response.body.properties).toHaveLength(2);
    });

    it('should filter properties by city', async () => {
      const response = await request(app)
        .get('/api/properties')
        .query({ city: 'Milano' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.properties).toHaveLength(1);
      expect(response.body.properties[0].city).toBe('Milano');
    });

    it('should filter properties by type', async () => {
      const response = await request(app)
        .get('/api/properties')
        .query({ type: 'Vendita' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.properties.length).toBeGreaterThan(0);
      expect(response.body.properties.every(p => p.type === 'Vendita')).toBe(true);
    });

    it('should filter properties by price range', async () => {
      const response = await request(app)
        .get('/api/properties')
        .query({ minPrice: 400000, maxPrice: 600000 });

      expect(response.status).toBe(200);
      expect(response.body.properties).toHaveLength(1);
      expect(parseFloat(response.body.properties[0].price)).toBe(500000);
    });

    it('should search properties by text', async () => {
      const response = await request(app)
        .get('/api/properties')
        .query({ search: 'Villa' });

      expect(response.status).toBe(200);
      expect(response.body.properties).toHaveLength(1);
      expect(response.body.properties[0].title).toContain('Villa');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/properties')
        .query({ limit: 1, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.properties).toHaveLength(1);
      expect(response.body.total).toBe(2);
    });

    it('should sort properties by price', async () => {
      const response = await request(app)
        .get('/api/properties')
        .query({ sortBy: 'price', sortOrder: 'ASC' });

      expect(response.status).toBe(200);
      const price1 = parseFloat(response.body.properties[0].price);
      const price2 = parseFloat(response.body.properties[1]?.price || Infinity);
      expect(price1).toBeLessThan(price2);
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should get property by id', async () => {
      const response = await request(app)
        .get(`/api/properties/${testProperty.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.property).toHaveProperty('id');
      expect(response.body.property.title).toBe('Villa Test');
    });

    it('should return 404 for non-existent property', async () => {
      const response = await request(app)
        .get('/api/properties/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('non trovato');
    });

    it('should increment view count', async () => {
      const initialViews = testProperty.viewCount || 0;

      await request(app)
        .get(`/api/properties/${testProperty.id}`);

      await testProperty.reload();
      expect(testProperty.viewCount).toBe(initialViews + 1);
    });
  });

  describe('POST /api/properties', () => {
    it('should create new property', async () => {
      const newPropertyData = {
        title: 'Nuova Proprietà',
        description: 'Descrizione',
        location: 'Torino',
        price: 250000,
        city: 'Torino',
        address: 'Via Nuova 1',
        sqm: 120,
        rooms: 4,
        bathrooms: 2,
        propertyType: 'appartamento',
        type: 'Vendita',
        status: 'disponibile'
      };

      const response = await request(app)
        .post('/api/properties')
        .send(newPropertyData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.property).toHaveProperty('id');
      expect(response.body.property.title).toBe('Nuova Proprietà');
    });

    it('should not create property with missing required fields', async () => {
      const invalidData = {
        title: 'Proprietà Incompleta'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/properties')
        .send(invalidData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/properties/:id', () => {
    it('should update property', async () => {
      const updateData = {
        title: 'Villa Aggiornata',
        price: 550000
      };

      const response = await request(app)
        .put(`/api/properties/${testProperty.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.property.title).toBe('Villa Aggiornata');
      expect(parseFloat(response.body.property.price)).toBe(550000);
    });

    it('should return 404 for non-existent property', async () => {
      const response = await request(app)
        .put('/api/properties/99999')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/properties/:id', () => {
    it('should delete property', async () => {
      const response = await request(app)
        .delete(`/api/properties/${testProperty.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify property is deleted
      const deletedProperty = await Property.findByPk(testProperty.id);
      expect(deletedProperty).toBeNull();
    });

    it('should return 404 for non-existent property', async () => {
      const response = await request(app)
        .delete('/api/properties/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
