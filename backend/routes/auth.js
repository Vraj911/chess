const express = require('express');
const AuthService = require('../services/authService');
const ValidationHelper = require('../utils/validation');
const ResponseHandler = require('../utils/responseHandler');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { SUCCESS_MESSAGES, STATUS_CODES } = require('../config/constants');
const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    // Sanitize and validate input
    const sanitizedData = ValidationHelper.sanitizeInput(req.body);
    const validation = ValidationHelper.validateRegistration(sanitizedData);

    if (!validation.isValid) {
      return ResponseHandler.validationError(res, 'Registration validation failed', validation.errors);
    }

    // Register user
    const result = await AuthService.registerUser(sanitizedData);

    return ResponseHandler.success(
      res, 
      STATUS_CODES.CREATED, 
      SUCCESS_MESSAGES.USER.REGISTERED, 
      result
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message.includes('already')) {
      return ResponseHandler.conflict(res, error.message);
    }
    
    return ResponseHandler.error(res, STATUS_CODES.INTERNAL_SERVER_ERROR, 'Registration failed', error.message);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    // Sanitize and validate input
    const sanitizedData = ValidationHelper.sanitizeInput(req.body);
    const validation = ValidationHelper.validateLogin(sanitizedData);

    if (!validation.isValid) {
      return ResponseHandler.validationError(res, 'Login validation failed', validation.errors);
    }

    // Authenticate user
    const result = await AuthService.loginUser(sanitizedData.email, sanitizedData.password);

    return ResponseHandler.success(
      res, 
      STATUS_CODES.OK, 
      SUCCESS_MESSAGES.USER.LOGGED_IN, 
      result
    );

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid credentials') {
      return ResponseHandler.unauthorized(res, error.message);
    }
    
    return ResponseHandler.error(res, STATUS_CODES.INTERNAL_SERVER_ERROR, 'Login failed', error.message);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await AuthService.logoutUser(req.user._id);

    return ResponseHandler.success(
      res, 
      STATUS_CODES.OK, 
      SUCCESS_MESSAGES.USER.LOGGED_OUT
    );

  } catch (error) {
    console.error('Logout error:', error);
    return ResponseHandler.error(res, STATUS_CODES.INTERNAL_SERVER_ERROR, 'Logout failed', error.message);
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Private
 */
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // For now, generate new access token
    // In a more advanced implementation, you'd use a refresh token
    const result = await AuthService.refreshToken(req.user._id);

    return ResponseHandler.success(
      res, 
      STATUS_CODES.OK, 
      SUCCESS_MESSAGES.USER.TOKEN_REFRESHED, 
      result
    );

  } catch (error) {
    console.error('Token refresh error:', error);
    return ResponseHandler.error(res, STATUS_CODES.INTERNAL_SERVER_ERROR, 'Token refresh failed', error.message);
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await AuthService.getUserProfile(req.user._id);

    return ResponseHandler.success(
      res, 
      STATUS_CODES.OK, 
      'Profile retrieved successfully', 
      { user: profile }
    );

  } catch (error) {
    console.error('Profile fetch error:', error);
    
    if (error.message === 'User not found') {
      return ResponseHandler.notFound(res, error.message);
    }
    
    return ResponseHandler.error(res, STATUS_CODES.INTERNAL_SERVER_ERROR, 'Failed to fetch profile', error.message);
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, requirePermission('user', 'edit_profile', async (req) => {
  return { targetUser: req.user };
}), async (req, res) => {
  try {
    // Sanitize and validate input
    const sanitizedData = ValidationHelper.sanitizeInput(req.body);
    const validation = ValidationHelper.validateProfileUpdate(sanitizedData);

    if (!validation.isValid) {
      return ResponseHandler.validationError(res, 'Profile update validation failed', validation.errors);
    }

    // Update profile
    const updatedProfile = await AuthService.updateUserProfile(req.user._id, sanitizedData);

    return ResponseHandler.success(
      res, 
      STATUS_CODES.OK, 
      SUCCESS_MESSAGES.USER.PROFILE_UPDATED, 
      { user: updatedProfile }
    );

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.message.includes('already')) {
      return ResponseHandler.conflict(res, error.message);
    }
    
    if (error.message === 'User not found') {
      return ResponseHandler.notFound(res, error.message);
    }
    
    return ResponseHandler.error(res, STATUS_CODES.INTERNAL_SERVER_ERROR, 'Profile update failed', error.message);
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticateToken, requirePermission('user', 'change_password', async (req) => {
  return { targetUser: req.user };
}), async (req, res) => {
  try {
    // Sanitize and validate input
    const sanitizedData = ValidationHelper.sanitizeInput(req.body);
    const validation = ValidationHelper.validatePasswordChange(sanitizedData);

    if (!validation.isValid) {
      return ResponseHandler.validationError(res, 'Password change validation failed', validation.errors);
    }

    // Change password
    await AuthService.changePassword(
      req.user._id, 
      sanitizedData.currentPassword, 
      sanitizedData.newPassword
    );

    return ResponseHandler.success(
      res, 
      STATUS_CODES.OK, 
      SUCCESS_MESSAGES.USER.PASSWORD_CHANGED
    );

  } catch (error) {
    console.error('Password change error:', error);
    
    if (error.message === 'Current password is incorrect') {
      return ResponseHandler.unauthorized(res, error.message);
    }
    
    if (error.message === 'User not found') {
      return ResponseHandler.notFound(res, error.message);
    }
    
    return ResponseHandler.error(res, STATUS_CODES.INTERNAL_SERVER_ERROR, 'Password change failed', error.message);
  }
});

/**
 * @route   GET /api/auth/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, requirePermission('user', 'view_stats', async (req) => {
  return { targetUser: req.user };
}), async (req, res) => {
  try {
    const stats = await AuthService.getUserStats(req.user._id);

    return ResponseHandler.success(
      res, 
      STATUS_CODES.OK, 
      'Statistics retrieved successfully', 
      { stats }
    );

  } catch (error) {
    console.error('Stats fetch error:', error);
    
    if (error.message === 'User not found') {
      return ResponseHandler.notFound(res, error.message);
    }
    
    return ResponseHandler.error(res, STATUS_CODES.INTERNAL_SERVER_ERROR, 'Failed to fetch statistics', error.message);
  }
});

module.exports = router;
