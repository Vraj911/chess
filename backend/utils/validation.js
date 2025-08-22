const { VALIDATION, USER, ERROR_MESSAGES } = require('../config/constants');

class ValidationHelper {
  /**
   * Validate user registration data
   * @param {Object} data - User registration data
   * @returns {Object} Validation result
   */
  static validateRegistration(data) {
    const errors = [];

    // Check required fields
    if (!data.username || !data.email || !data.password) {
      errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS);
      return { isValid: false, errors };
    }

    // Validate username
    if (data.username.length < USER.MIN_USERNAME_LENGTH || 
        data.username.length > USER.MAX_USERNAME_LENGTH) {
      errors.push(`Username must be between ${USER.MIN_USERNAME_LENGTH} and ${USER.MAX_USERNAME_LENGTH} characters`);
    }

    if (!VALIDATION.USERNAME_REGEX.test(data.username)) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_USERNAME);
    }

    // Validate email
    if (!VALIDATION.EMAIL_REGEX.test(data.email)) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
    }

    // Validate password
    if (data.password.length < USER.MIN_PASSWORD_LENGTH) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD);
    }

    if (data.password.length > USER.MAX_PASSWORD_LENGTH) {
      errors.push(`Password must be less than ${USER.MAX_PASSWORD_LENGTH} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user login data
   * @param {Object} data - User login data
   * @returns {Object} Validation result
   */
  static validateLogin(data) {
    const errors = [];

    if (!data.email || !data.password) {
      errors.push('Email and password are required');
    }

    if (data.email && !VALIDATION.EMAIL_REGEX.test(data.email)) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate profile update data
   * @param {Object} data - Profile update data
   * @returns {Object} Validation result
   */
  static validateProfileUpdate(data) {
    const errors = [];

    if (data.username) {
      if (data.username.length < USER.MIN_USERNAME_LENGTH || 
          data.username.length > USER.MAX_USERNAME_LENGTH) {
        errors.push(`Username must be between ${USER.MIN_USERNAME_LENGTH} and ${USER.MAX_USERNAME_LENGTH} characters`);
      }

      if (!VALIDATION.USERNAME_REGEX.test(data.username)) {
        errors.push(ERROR_MESSAGES.VALIDATION.INVALID_USERNAME);
      }
    }

    if (data.email && !VALIDATION.EMAIL_REGEX.test(data.email)) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate password change data
   * @param {Object} data - Password change data
   * @returns {Object} Validation result
   */
  static validatePasswordChange(data) {
    const errors = [];

    if (!data.currentPassword || !data.newPassword) {
      errors.push('Current password and new password are required');
    }

    if (data.newPassword && data.newPassword.length < USER.MIN_PASSWORD_LENGTH) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD);
    }

    if (data.newPassword && data.newPassword.length > USER.MAX_PASSWORD_LENGTH) {
      errors.push(`Password must be less than ${USER.MAX_PASSWORD_LENGTH} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize input data
   * @param {Object} data - Input data
   * @returns {Object} Sanitized data
   */
  static sanitizeInput(data) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Validate pagination parameters
   * @param {Object} query - Query parameters
   * @returns {Object} Pagination parameters
   */
  static validatePagination(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(
      Math.max(1, parseInt(query.limit) || 10),
      100
    );

    return {
      page,
      limit,
      skip: (page - 1) * limit
    };
  }
}

module.exports = ValidationHelper;
