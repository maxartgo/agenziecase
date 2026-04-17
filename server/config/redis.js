import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client with configuration
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    connectTimeout: 5000, // 5 seconds timeout
    lazyConnect: true // Don't connect automatically
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: process.env.REDIS_DB || 0,
  // Limit reconnection attempts
  maxRetriesPerRequest: 1,
  disableOfflineQueue: true
});

// Redis client event handlers
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('✅ Redis Client Connected');
});

redisClient.on('disconnect', () => {
  console.warn('⚠️  Redis Client Disconnected');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis Client Reconnecting...');
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connection established successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error.message);
    // Don't fail the app if Redis is not available
    // Cache operations will gracefully degrade
    return false;
  }
};

// Disconnect from Redis (for graceful shutdown)
export const disconnectRedis = async () => {
  try {
    await redisClient.quit();
    console.log('✅ Redis connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error.message);
  }
};

// Get cache value
export const getCache = async (key) => {
  try {
    if (!redisClient.isOpen) {
      return null;
    }
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('❌ Error getting cache:', error.message);
    return null;
  }
};

// Set cache value with TTL (in seconds)
export const setCache = async (key, value, ttl = 300) => {
  try {
    if (!redisClient.isOpen) {
      return false;
    }
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('❌ Error setting cache:', error.message);
    return false;
  }
};

// Delete cache value
export const deleteCache = async (key) => {
  try {
    if (!redisClient.isOpen) {
      return false;
    }
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('❌ Error deleting cache:', error.message);
    return false;
  }
};

// Delete cache by pattern (using wildcard)
export const deleteCachePattern = async (pattern) => {
  try {
    if (!redisClient.isOpen) {
      return false;
    }
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return keys.length;
  } catch (error) {
    console.error('❌ Error deleting cache pattern:', error.message);
    return 0;
  }
};

// Flush all cache (use with caution!)
export const flushCache = async () => {
  try {
    if (!redisClient.isOpen) {
      return false;
    }
    await redisClient.flushDb();
    console.log('✅ Cache flushed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error flushing cache:', error.message);
    return false;
  }
};

// Get cache statistics
export const getCacheStats = async () => {
  try {
    if (!redisClient.isOpen) {
      return { connected: false };
    }
    const info = await redisClient.info('stats');
    const dbSize = await redisClient.dbSize();
    return {
      connected: true,
      keys: dbSize,
      info: info
    };
  } catch (error) {
    console.error('❌ Error getting cache stats:', error.message);
    return { connected: false, error: error.message };
  }
};

export default redisClient;
