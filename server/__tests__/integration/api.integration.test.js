// API Integration Tests (Simplified)
import request from 'supertest';
import { createTestApp } from '../helpers/test-app.js';

describe('API Integration Tests', () => {
  let app;

  beforeAll(async () => {
    app = createTestApp();
  });

  describe('Health & Basic Endpoints', () => {
    it('should return health check', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Properties API', () => {
    it('should get properties list without auth', async () => {
      const response = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(response.body).toHaveProperty('properties');
      expect(Array.isArray(response.body.properties)).toBe(true);
    });

    it('should return empty array for non-existent property', async () => {
      const response = await request(app)
        .get('/api/properties/999999')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Authentication API', () => {
    it('should reject register with missing data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com'
          // Missing password and other required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com'
          // Missing password
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('API Response Format', () => {
    it('should return proper JSON format', async () => {
      const response = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle empty POST requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
