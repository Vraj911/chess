const { LoggerHelper } = require('../utils/logger');

/**
 * Performance monitoring middleware
 * Measures response time and logs performance metrics
 */
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - start;
    
    // Log performance metrics
    LoggerHelper.logRequest(req, res, responseTime);
    
    // Add response time header
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Database query performance monitor
 * Wraps database operations to measure performance
 */
const dbPerformanceMonitor = (operationName) => {
  return async (req, res, next) => {
    const start = Date.now();
    
    try {
      // Store original send method
      const originalSend = res.send;
      
      // Override send method to capture timing
      res.send = function(data) {
        const duration = Date.now() - start;
        
        // Log database performance
        LoggerHelper.logPerformance(operationName, duration, {
          url: req.originalUrl,
          method: req.method,
          userId: req.user?._id
        });
        
        // Call original send method
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      const duration = Date.now() - start;
      LoggerHelper.logError(error, {
        operation: operationName,
        duration,
        url: req.originalUrl,
        method: req.method
      });
      next(error);
    }
  };
};

/**
 * Memory usage monitor
 * Logs memory usage at regular intervals
 */
const memoryMonitor = () => {
  const logMemoryUsage = () => {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100
    };
    
    LoggerHelper.logPerformance('Memory Usage', 0, memUsageMB);
  };
  
  // Log memory usage every 5 minutes
  setInterval(logMemoryUsage, 5 * 60 * 1000);
  
  // Initial log
  logMemoryUsage();
};

/**
 * Request size limiter
 * Prevents large payload attacks
 */
const requestSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSizeBytes = parseInt(maxSize) * 1024 * 1024; // Convert MB to bytes
    
    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        success: false,
        error: 'Request entity too large',
        maxSize: maxSize
      });
    }
    
    next();
  };
};

/**
 * Response compression middleware
 * Compresses responses for better performance
 */
const compressionMiddleware = (req, res, next) => {
  // Check if client accepts gzip
  const acceptEncoding = req.headers['accept-encoding'];
  
  if (acceptEncoding && acceptEncoding.includes('gzip')) {
    // Set compression header
    res.setHeader('Content-Encoding', 'gzip');
    
    // Note: In a real implementation, you'd use compression library
    // This is just a placeholder for the concept
  }
  
  next();
};

/**
 * Cache control middleware
 * Sets appropriate cache headers
 */
const cacheControl = (maxAge = 3600) => {
  return (req, res, next) => {
    // Skip caching for dynamic content
    if (req.method !== 'GET') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      // Set cache headers for static content
      res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    }
    
    next();
  };
};

module.exports = {
  performanceMonitor,
  dbPerformanceMonitor,
  memoryMonitor,
  requestSizeLimiter,
  compressionMiddleware,
  cacheControl
};
