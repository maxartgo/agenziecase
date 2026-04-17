/**
 * Performance Monitoring Middleware
 * Logs all requests with timing information and highlights slow requests
 */

const SLOW_REQUEST_THRESHOLD = process.env.NODE_ENV === 'production' ? 1000 : 500; // ms

// Store performance metrics
const performanceMetrics = {
  totalRequests: 0,
  slowRequests: 0,
  averageResponseTime: 0,
  requestsByEndpoint: {},
  requestsByMethod: {},
  recentSlowRequests: []
};

/**
 * Performance monitoring middleware
 */
export const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log request details
  console.log(`📥 ${req.method} ${req.originalUrl}`);

  // Store original end function
  const originalEnd = res.end;

  // Override res.end to capture response time
  res.end = (...args) => {
    const responseTime = Date.now() - startTime;

    // Update metrics
    performanceMetrics.totalRequests++;

    // Track by endpoint
    const endpoint = req.route ? req.route.path : req.path;
    if (!performanceMetrics.requestsByEndpoint[endpoint]) {
      performanceMetrics.requestsByEndpoint[endpoint] = {
        count: 0,
        totalTime: 0,
        avgTime: 0
      };
    }
    performanceMetrics.requestsByEndpoint[endpoint].count++;
    performanceMetrics.requestsByEndpoint[endpoint].totalTime += responseTime;
    performanceMetrics.requestsByEndpoint[endpoint].avgTime =
      performanceMetrics.requestsByEndpoint[endpoint].totalTime /
      performanceMetrics.requestsByEndpoint[endpoint].count;

    // Track by method
    if (!performanceMetrics.requestsByMethod[req.method]) {
      performanceMetrics.requestsByMethod[req.method] = {
        count: 0,
        totalTime: 0,
        avgTime: 0
      };
    }
    performanceMetrics.requestsByMethod[req.method].count++;
    performanceMetrics.requestsByMethod[req.method].totalTime += responseTime;
    performanceMetrics.requestsByMethod[req.method].avgTime =
      performanceMetrics.requestsByMethod[req.method].totalTime /
      performanceMetrics.requestsByMethod[req.method].count;

    // Update average response time
    performanceMetrics.averageResponseTime =
      (performanceMetrics.averageResponseTime * (performanceMetrics.totalRequests - 1) + responseTime) /
      performanceMetrics.totalRequests;

    // Check if request was slow
    if (responseTime > SLOW_REQUEST_THRESHOLD) {
      performanceMetrics.slowRequests++;

      const slowRequest = {
        method: req.method,
        url: req.originalUrl,
        responseTime,
        timestamp: new Date().toISOString(),
        statusCode: res.statusCode
      };

      // Store recent slow requests (keep last 100)
      performanceMetrics.recentSlowRequests.push(slowRequest);
      if (performanceMetrics.recentSlowRequests.length > 100) {
        performanceMetrics.recentSlowRequests.shift();
      }

      // Log warning for slow requests
      console.warn(`⚠️  SLOW REQUEST (${responseTime}ms): ${req.method} ${req.originalUrl}`);
    } else {
      console.log(`✅ ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`);
    }

    // Add performance headers to response (only if headers not sent yet)
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${responseTime}ms`);
    }

    // Call original end function
    originalEnd.apply(res, args);
  };

  next();
};

/**
 * Get performance metrics
 */
export const getPerformanceMetrics = () => {
  return {
    ...performanceMetrics,
    slowRequestThreshold: SLOW_REQUEST_THRESHOLD,
    slowRequestPercentage: performanceMetrics.totalRequests > 0
      ? ((performanceMetrics.slowRequests / performanceMetrics.totalRequests) * 100).toFixed(2)
      : 0
  };
};

/**
 * Reset performance metrics
 */
export const resetPerformanceMetrics = () => {
  performanceMetrics.totalRequests = 0;
  performanceMetrics.slowRequests = 0;
  performanceMetrics.averageResponseTime = 0;
  performanceMetrics.requestsByEndpoint = {};
  performanceMetrics.requestsByMethod = {};
  performanceMetrics.recentSlowRequests = [];
};

export default performanceMiddleware;
