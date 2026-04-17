/**
 * Production Monitoring Configuration
 * Provides application monitoring, logging, and metrics
 */

import winston from 'winston';
import { Redis } from 'ioredis';

// Redis client for metrics storage
let redisClient = null;

/**
 * Initialize monitoring system
 */
export async function initMonitoring() {
  try {
    // Initialize Redis client for metrics
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = process.env.REDIS_PORT || 6379;
    const redisPassword = process.env.REDIS_PASSWORD;

    redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
    });

    redisClient.on('error', (err) => {
      console.error('Redis monitoring error:', err);
    });

    await redisClient.ping();
    console.log('✅ Monitoring system initialized');
    return true;
  } catch (error) {
    console.warn('⚠️  Redis monitoring not available:', error.message);
    return false;
  }
}

/**
 * Winston logger configuration
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'agenziecase-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
          }
          return msg;
        })
      ),
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    })
  );
}

/**
 * Metrics collection
 */
export const metrics = {
  /**
   * Record API request
   */
  async recordRequest(endpoint, method, statusCode, responseTime) {
    try {
      const key = `metrics:requests:${new Date().toISOString().split('T')[0]}`;
      const field = `${method}:${endpoint}`;

      if (redisClient) {
        await redisClient.hincrby(key, `${field}:count`, 1);
        await redisClient.hincrbyfloat(key, `${field}:time`, responseTime);

        // Set expiration to 30 days
        await redisClient.expire(key, 2592000);
      }
    } catch (error) {
      logger.error('Error recording request metrics:', error);
    }
  },

  /**
   * Record error
   */
  async recordError(type, message) {
    try {
      const key = `metrics:errors:${new Date().toISOString().split('T')[0]}`;

      if (redisClient) {
        await redisClient.hincrby(key, type, 1);
        await redisClient.expire(key, 2592000);
      }
    } catch (error) {
      logger.error('Error recording error metrics:', error);
    }
  },

  /**
   * Record database query
   */
  async recordQuery(model, operation, time) {
    try {
      const key = `metrics:queries:${new Date().toISOString().split('T')[0]}`;
      const field = `${model}:${operation}`;

      if (redisClient) {
        await redisClient.hincrby(key, `${field}:count`, 1);
        await redisClient.hincrbyfloat(key, `${field}:time`, time);
        await redisClient.expire(key, 2592000);
      }
    } catch (error) {
      logger.error('Error recording query metrics:', error);
    }
  },

  /**
   * Get daily metrics
   */
  async getDailyMetrics(date = new Date().toISOString().split('T')[0]) {
    try {
      const requestKey = `metrics:requests:${date}`;
      const errorKey = `metrics:errors:${date}`;
      const queryKey = `metrics:queries:${date}`;

      const [requests, errors, queries] = await Promise.all([
        redisClient?.hgetall(requestKey) || {},
        redisClient?.hgetall(errorKey) || {},
        redisClient?.hgetall(queryKey) || {},
      ]);

      return {
        date,
        requests: formatMetrics(requests),
        errors: formatMetrics(errors),
        queries: formatMetrics(queries),
      };
    } catch (error) {
      logger.error('Error getting metrics:', error);
      return null;
    }
  },

  /**
   * Get metrics summary for last N days
   */
  async getMetricsSummary(days = 7) {
    try {
      const summaries = [];
      const today = new Date();

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dailyMetrics = await this.getDailyMetrics(dateStr);
        if (dailyMetrics) {
          summaries.push(dailyMetrics);
        }
      }

      return summaries;
    } catch (error) {
      logger.error('Error getting metrics summary:', error);
      return [];
    }
  },
};

/**
 * Format metrics object
 */
function formatMetrics(metricsObj) {
  const formatted = {};

  for (const [key, value] of Object.entries(metricsObj)) {
    const parts = key.split(':');
    const name = parts.slice(0, -1).join(':');
    const type = parts[parts.length - 1];

    if (!formatted[name]) {
      formatted[name] = {};
    }

    formatted[name][type] = parseFloat(value);
  }

  return formatted;
}

/**
 * Health check monitoring
 */
export const healthMonitor = {
  checks: {
    database: { status: 'unknown', lastCheck: null, error: null },
    redis: { status: 'unknown', lastCheck: null, error: null },
    api: { status: 'unknown', lastCheck: null, error: null },
  },

  updateCheck(service, status, error = null) {
    this.checks[service] = {
      status,
      lastCheck: new Date(),
      error,
    };
  },

  getStatus() {
    const allHealthy = Object.values(this.checks).every(
      (check) => check.status === 'healthy'
    );
    const anyUnhealthy = Object.values(this.checks).some(
      (check) => check.status === 'unhealthy'
    );

    return {
      overall: allHealthy ? 'healthy' : anyUnhealthy ? 'unhealthy' : 'degraded',
      services: this.checks,
    };
  },
};

/**
 * Performance monitoring
 */
export const performanceMonitor = {
  slowQueries: [],
  slowEndpoints: [],

  recordSlowQuery(query, time) {
    this.slowQueries.push({
      query,
      time,
      timestamp: new Date(),
    });

    // Keep only last 100 slow queries
    if (this.slowQueries.length > 100) {
      this.slowQueries.shift();
    }
  },

  recordSlowEndpoint(endpoint, method, time) {
    this.slowEndpoints.push({
      endpoint,
      method,
      time,
      timestamp: new Date(),
    });

    // Keep only last 100 slow endpoints
    if (this.slowEndpoints.length > 100) {
      this.slowEndpoints.shift();
    }
  },

  getSlowQueries(limit = 10) {
    return this.slowQueries
      .sort((a, b) => b.time - a.time)
      .slice(0, limit);
  },

  getSlowEndpoints(limit = 10) {
    return this.slowEndpoints
      .sort((a, b) => b.time - a.time)
      .slice(0, limit);
  },
};

export default {
  initMonitoring,
  logger,
  metrics,
  healthMonitor,
  performanceMonitor,
};
