// API Helpers Tests - Simplified and Robust
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildApiUrl, apiCall, authenticatedApiCall, API_BASE_URL } from '../../config/api.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Helpers - Simplified', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildApiUrl', () => {
    it('should build correct URL for endpoint', () => {
      const url = buildApiUrl('/api/properties');
      expect(url).toBe('http://localhost:3456/api/properties');
    });

    it('should handle query parameters', () => {
      const url = buildApiUrl('/api/properties?city=Milano');
      expect(url).toBe('http://localhost:3456/api/properties?city=Milano');
    });

    it('should handle empty endpoint', () => {
      const url = buildApiUrl('');
      expect(url).toBe('http://localhost:3456');
    });
  });

  describe('apiCall', () => {
    it('should make API call', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await apiCall('/api/test');

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should pass method and body', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await apiCall('/api/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' })
      });

      expect(global.fetch).toHaveBeenCalled();
      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].method).toBe('POST');
    });

    it('should handle errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiCall('/api/test')).rejects.toThrow('Network error');
    });
  });

  describe('authenticatedApiCall', () => {
    it('should add Authorization header', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await authenticatedApiCall('/api/protected', 'test-token');

      expect(global.fetch).toHaveBeenCalled();
      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].headers.Authorization).toBe('Bearer test-token');
    });

    it('should pass custom options', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await authenticatedApiCall('/api/protected', 'test-token', {
        method: 'POST'
      });

      expect(global.fetch).toHaveBeenCalled();
      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].method).toBe('POST');
    });

    it('should handle auth errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Auth error'));

      await expect(
        authenticatedApiCall('/api/protected', 'token')
      ).rejects.toThrow();
    });
  });

  describe('API_BASE_URL', () => {
    it('should export correct base URL', () => {
      expect(API_BASE_URL).toBe('http://localhost:3456');
    });
  });

  describe('Integration', () => {
    it('should handle complete API call flow', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: 'test'
        })
      });

      const response = await apiCall('/api/test');
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBe('test');
    });

    it('should handle error responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
      });

      const response = await apiCall('/api/test');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should handle special characters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await apiCall('/api/search?q=Milano&types=appartment,villa');

      expect(global.fetch).toHaveBeenCalled();
      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[0]).toContain('q=Milano');
    });
  });
});
