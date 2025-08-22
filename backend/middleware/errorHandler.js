const ResponseHandler = require('../utils/responseHandler');
const { STATUS_CODES } = require('../config/constants');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return ResponseHandler.validationError(res, 'Validation error', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    return ResponseHandler.conflict(res, message);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return ResponseHandler.badRequest(res, 'Invalid ID format');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ResponseHandler.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseHandler.unauthorized(res, 'Token expired');
  }

  // Custom application errors
  if (err.statusCode) {
    return ResponseHandler.error(res, err.statusCode, err.message);
  }

  // Default error
  return ResponseHandler.error(
    res, 
    STATUS_CODES.INTERNAL_SERVER_ERROR, 
    'Internal server error',
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  return ResponseHandler.notFound(res, `Route ${req.originalUrl} not found`);
};

/**
 * Async error wrapper for route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
