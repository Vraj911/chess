const { STATUS_CODES } = require('../config/constants');

class ResponseHandler {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Success message
   * @param {*} data - Response data
   */
  static success(res, statusCode = STATUS_CODES.OK, message = 'Success', data = null) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {*} details - Additional error details
   */
  static error(res, statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR, message = 'Internal server error', details = null) {
    const response = {
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    };

    if (details !== null) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {string} message - Validation error message
   * @param {Array} errors - Validation errors array
   */
  static validationError(res, message = 'Validation error', errors = []) {
    return this.error(res, STATUS_CODES.BAD_REQUEST, message, { errors });
  }

  /**
   * Send not found response
   * @param {Object} res - Express response object
   * @param {string} message - Not found message
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, STATUS_CODES.NOT_FOUND, message);
  }

  /**
   * Send unauthorized response
   * @param {Object} res - Express response object
   * @param {string} message - Unauthorized message
   */
  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, STATUS_CODES.UNAUTHORIZED, message);
  }

  /**
   * Send forbidden response
   * @param {Object} res - Express response object
   * @param {string} message - Forbidden message
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error(res, STATUS_CODES.FORBIDDEN, message);
  }

  /**
   * Send conflict response
   * @param {Object} res - Express response object
   * @param {string} message - Conflict message
   */
  static conflict(res, message = 'Conflict') {
    return this.error(res, STATUS_CODES.CONFLICT, message);
  }
}

module.exports = ResponseHandler;
