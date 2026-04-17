import { createHash } from 'crypto';
import { getCache, setCache, deleteCachePattern } from '../config/redis.js';

/**
 * Generate MD5 hash for cache key
 * @param {string} str - String to hash
 * @returns {string} - MD5 hash
 */
const generateHash = (str) => {
  return createHash('md5').update(str).digest('hex');
};

/**
 * Create cache key from URL and query parameters
 * @param {object} req - Express request object
 * @returns {string} - Cache key
 */
const createCacheKey = (req) => {
  const { originalUrl, query } = req;
  const queryString = Object.keys(query)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&');

  const keyString = `${originalUrl}:${queryString}`;
  return `cache:${generateHash(keyString)}`;
};

/**
 * Cache middleware factory
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 * @returns {function} - Express middleware
 */
export const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if Redis is not available
    const cacheKey = createCacheKey(req);

    try {
      // Try to get from cache
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        // Cache hit - return cached response
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedData);
      }

      // Cache miss - continue to controller
      res.setHeader('X-Cache', 'MISS');

      // Store the original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = async (data) => {
        // Cache the response (only if status code is success)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await setCache(cacheKey, data, ttl);
        }

        // Call the original res.json
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('❌ Cache middleware error:', error.message);
      // Continue without caching on error
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Cache key pattern (supports wildcards)
 */
export const invalidateCache = async (pattern) => {
  try {
    const deletedCount = await deleteCachePattern(pattern);
    if (deletedCount > 0) {
      console.log(`✅ Cache invalidated: ${pattern} (${deletedCount} keys deleted)`);
    }
  } catch (error) {
    console.error('❌ Error invalidating cache:', error.message);
  }
};

/**
 * Predefined cache invalidation helpers
 */
export const cacheInvalidators = {
  // Invalidate all property-related cache
  properties: async () => {
    await invalidateCache('cache:*properties*');
    await invalidateCache('cache:*featured*');
  },

  // Invalidate all stats cache
  stats: async () => {
    await invalidateCache('cache:*stats*');
  },

  // Invalidate all CRM cache
  crm: async () => {
    await invalidateCache('cache:*crm*');
  },

  // Invalidate all clients cache
  clients: async () => {
    await invalidateCache('cache:*clients*');
  },

  // Invalidate all deals cache
  deals: async () => {
    await invalidateCache('cache:*deals*');
  },

  // Invalidate all cache (use with caution!)
  all: async () => {
    await invalidateCache('*');
  }
};

/**
 * Cache configuration for common TTL values
 */
export const cacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 600,           // 10 minutes
  VERY_LONG: 900,      // 15 minutes
  HOUR: 3600           // 1 hour
};

export default cacheMiddleware;
