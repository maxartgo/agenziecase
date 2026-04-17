import express from 'express';
import { getPerformanceMetrics, resetPerformanceMetrics } from '../middleware/performance.js';
import { getCacheStats } from '../config/redis.js';
import sequelize from '../config/database.js';

const router = express.Router();

/**
 * GET /api/performance/dashboard
 * Comprehensive performance dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Get application metrics
    const appMetrics = getPerformanceMetrics();

    // Get database pool info
    const poolInfo = {
      max: sequelize.connectionManager.pool.max,
      min: sequelize.connectionManager.pool.min,
      size: sequelize.connectionManager.pool.size,
      available: sequelize.connectionManager.pool.available,
      using: sequelize.connectionManager.pool.using
    };

    // Get Redis metrics
    const redisMetrics = await getCacheStats();

    // System metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    res.json({
      success: true,
      dashboard: {
        app: appMetrics,
        database: poolInfo,
        cache: redisMetrics,
        system: systemMetrics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error getting performance dashboard:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/performance/metrics
 * Get application performance metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = getPerformanceMetrics();
    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('❌ Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/performance/reset
 * Reset performance metrics
 */
router.post('/reset', (req, res) => {
  try {
    resetPerformanceMetrics();
    res.json({
      success: true,
      message: 'Performance metrics reset successfully'
    });
  } catch (error) {
    console.error('❌ Error resetting performance metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/performance/health
 * Health check with detailed status
 */
router.get('/health', async (req, res) => {
  try {
    const checks = {
      database: false,
      cache: false,
      overall: 'healthy'
    };

    // Check database
    try {
      await sequelize.authenticate();
      checks.database = true;
    } catch (error) {
      checks.database = false;
      checks.overall = 'degraded';
    }

    // Check cache
    try {
      const cacheStats = await getCacheStats();
      checks.cache = cacheStats.connected;
    } catch (error) {
      checks.cache = false;
      // Cache not available is not critical
    }

    // Determine overall health
    if (!checks.database) {
      checks.overall = 'unhealthy';
    }

    const statusCode = checks.overall === 'healthy' ? 200 : checks.overall === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      success: checks.overall !== 'unhealthy',
      health: checks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in health check:', error);
    res.status(503).json({
      success: false,
      health: {
        database: false,
        cache: false,
        overall: 'unhealthy'
      },
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
