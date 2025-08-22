const jwt = require('jsonwebtoken');
const User = require('../models/User');
const policyManager = require('../policies/policyManager');
const { logger } = require('../utils/logger');
const { ERROR_MESSAGES } = require('../config/constants');

/**
 * Authenticate JWT token and attach user to request
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        error: 'Account is banned'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    logger.error('Authentication error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Check if user can perform action using Policy Pattern
 * @param {string} policyType - Type of policy to use
 * @param {string} action - Action being performed
 * @param {Function} contextBuilder - Function to build context object
 */
const requirePermission = (policyType, action, contextBuilder = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Build context object
      let context = { user: req.user };
      
      if (contextBuilder) {
        context = { ...context, ...(await contextBuilder(req)) };
      }

      // Check permission using policy
      const canPerform = await policyManager.can(policyType, context, action);
      
      if (!canPerform) {
        logger.warn('Permission denied', {
          userId: req.user._id,
          policyType,
          action,
          context: JSON.stringify(context)
        });

        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check failed', {
        userId: req.user?._id,
        policyType,
        action,
        error: error.message
      });

      return res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
};

/**
 * Check if user owns the resource (for profile updates, etc.)
 */
const requireOwnership = () => {
  return requirePermission('user', 'edit_profile', async (req) => {
    return { targetUser: req.user };
  });
};

/**
 * Check if user can view profile
 */
const canViewProfile = () => {
  return requirePermission('user', 'view_profile', async (req) => {
    const targetUserId = req.params.userId || req.query.userId;
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId);
      return { targetUser };
    }
    return { targetUser: req.user };
  });
};

/**
 * Check if user can create game
 */
const canCreateGame = () => {
  return requirePermission('user', 'create_game');
};

/**
 * Check if user can join game
 */
const canJoinGame = () => {
  return requirePermission('game', 'join_game', async (req) => {
    const gameId = req.params.gameId || req.body.gameId;
    if (gameId) {
      const Game = require('../models/Game');
      const game = await Game.findById(gameId);
      return { game };
    }
    return {};
  });
};

/**
 * Check if user can make move
 */
const canMakeMove = () => {
  return requirePermission('game', 'make_move', async (req) => {
    const gameId = req.params.gameId || req.body.gameId;
    if (gameId) {
      const Game = require('../models/Game');
      const game = await Game.findById(gameId);
      return { game, move: req.body };
    }
    return {};
  });
};

/**
 * Check if user can resign game
 */
const canResignGame = () => {
  return requirePermission('game', 'resign_game', async (req) => {
    const gameId = req.params.gameId || req.body.gameId;
    if (gameId) {
      const Game = require('../models/Game');
      const game = await Game.findById(gameId);
      return { game };
    }
    return {};
  });
};

/**
 * Check if user can view game
 */
const canViewGame = () => {
  return requirePermission('game', 'view_game', async (req) => {
    const gameId = req.params.gameId || req.query.gameId;
    if (gameId) {
      const Game = require('../models/Game');
      const game = await Game.findById(gameId);
      return { game };
    }
    return {};
  });
};

/**
 * Check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

/**
 * Check if user is authenticated (optional)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && !user.isBanned) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requirePermission,
  requireOwnership,
  canViewProfile,
  canCreateGame,
  canJoinGame,
  canMakeMove,
  canResignGame,
  canViewGame,
  requireAdmin,
  optionalAuth
};
