// Property Model Unit Tests (simplified)
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Property from '../../../models/Property.js';
import sequelize from '../../../config/database.js';
import { cleanDatabase } from '../../helpers/test-setup.js';

describe('Property Model', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('Property Creation', () => {
    it('should create a valid property', async () => {
      const propertyData = {
        title: 'Villa Milano',
        description: 'Beautiful villa',
        location: 'Milano',
        price: 500000,
        city: 'Milano',
        address: 'Via Roma 1',
        sqm: 200,
        rooms: 5,
        bathrooms: 3,
        propertyType: 'villa',
        type: 'Vendita',
        status: 'disponibile'
      };

      const property = await Property.create(propertyData);

      expect(property).toBeDefined();
      expect(property.title).toBe(propertyData.title);
      // DECIMAL fields are returned as strings by Sequelize
      expect(parseFloat(property.price)).toBe(propertyData.price);
      expect(property.city).toBe(propertyData.city);
      expect(property.sqm).toBe(propertyData.sqm);
      expect(property.status).toBe('disponibile');
    });

    it('should not create property without required fields', async () => {
      const invalidProperty = {
        title: 'Test Property'
      };

      await expect(Property.create(invalidProperty)).rejects.toThrow();
    });

    it('should not create property with negative price', async () => {
      const propertyData = {
        title: 'Test Property',
        description: 'Test',
        location: 'Roma',
        price: -100000,
        city: 'Roma',
        sqm: 100,
        rooms: 3
      };

      await expect(Property.create(propertyData)).rejects.toThrow();
    });
  });

  describe('Property Types', () => {
    it('should create Vendita property', async () => {
      const property = await Property.create({
        title: 'Test Property',
        location: 'Milano',
        price: 300000,
        city: 'Milano',
        sqm: 100,
        rooms: 3,
        bathrooms: 2,
        type: 'Vendita'
      });

      expect(property.type).toBe('Vendita');
    });

    it('should create Affitto property', async () => {
      const property = await Property.create({
        title: 'Test Property',
        location: 'Milano',
        price: 1000,
        city: 'Milano',
        sqm: 100,
        rooms: 3,
        bathrooms: 2,
        type: 'Affitto'
      });

      expect(property.type).toBe('Affitto');
    });
  });

  describe('Property Status', () => {
    it('should allow different property statuses', async () => {
      const statuses = ['disponibile', 'prenotato', 'venduto', 'affittato'];

      for (const status of statuses) {
        const property = await Property.create({
          title: `Test Property ${status}`,
          location: 'Milano',
          price: 300000,
          city: 'Milano',
          sqm: 100,
          rooms: 3,
          bathrooms: 2,
          status
        });
        expect(property.status).toBe(status);
      }
    });
  });
});
