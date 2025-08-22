// Application constants
module.exports = {
  // JWT Configuration
  JWT: {
    EXPIRES_IN: '7d',
    REFRESH_EXPIRES_IN: '30d'
  },

  // User Configuration
  USER: {
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 128,
    DEFAULT_RATING: 1200
  },

  // Validation Rules
  VALIDATION: {
    USERNAME_REGEX: /^[a-zA-Z0-9_]+$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  // HTTP Status Codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  },

  // Error Messages
  ERROR_MESSAGES: {
    VALIDATION: {
      REQUIRED_FIELDS: 'All fields are required',
      INVALID_USERNAME: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
      INVALID_EMAIL: 'Please provide a valid email address',
      INVALID_PASSWORD: 'Password must be at least 6 characters long',
      USERNAME_TAKEN: 'Username already taken',
      EMAIL_REGISTERED: 'Email already registered'
    },
    AUTH: {
      INVALID_CREDENTIALS: 'Invalid credentials',
      INVALID_TOKEN: 'Invalid or expired token',
      INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
      CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect'
    },
    USER: {
      NOT_FOUND: 'User not found',
      UPDATE_FAILED: 'Failed to update user profile',
      DELETE_FAILED: 'Failed to delete user account'
    },
    GENERAL: {
      INTERNAL_ERROR: 'Internal server error',
      VALIDATION_ERROR: 'Validation error',
      NOT_FOUND: 'Resource not found'
    }
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    USER: {
      REGISTERED: 'User registered successfully',
      LOGGED_IN: 'Login successful',
      LOGGED_OUT: 'Logout successful',
      PROFILE_UPDATED: 'Profile updated successfully',
      PASSWORD_CHANGED: 'Password changed successfully',
      TOKEN_REFRESHED: 'Token refreshed successfully'
    }
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  }
};
