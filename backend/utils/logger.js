const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log')
    })
  ],
  
  // Handle unhandled rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/rejections.log')
    })
  ]
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Helper methods
class LoggerHelper {
  /**
   * Log API request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in milliseconds
   */
  static logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?._id,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };

    if (res.statusCode >= 400) {
      logger.warn('API Request', logData);
    } else {
      logger.info('API Request', logData);
    }
  }

  /**
   * Log authentication events
   * @param {string} event - Event type (login, logout, register, etc.)
   * @param {string} userId - User ID
   * @param {string} ip - IP address
   * @param {Object} details - Additional details
   */
  static logAuthEvent(event, userId, ip, details = {}) {
    logger.info('Authentication Event', {
      event,
      userId,
      ip,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log game events
   * @param {string} event - Event type (move, gameStart, gameEnd, etc.)
   * @param {string} gameId - Game ID
   * @param {Array} playerIds - Player IDs
   * @param {Object} details - Additional details
   */
  static logGameEvent(event, gameId, playerIds, details = {}) {
    logger.info('Game Event', {
      event,
      gameId,
      playerIds,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log errors with context
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  static logError(error, context = {}) {
    logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log performance metrics
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in milliseconds
   * @param {Object} metadata - Additional metadata
   */
  static logPerformance(operation, duration, metadata = {}) {
    logger.info('Performance Metric', {
      operation,
      duration: `${duration}ms`,
      metadata,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  logger,
  LoggerHelper
};
