const policyManager = require('../policies/policyManager');
const { logger } = require('../utils/logger');
const ResponseHandler = require('../utils/responseHandler');
const { STATUS_CODES } = require('../config/constants');

/**
 * Policy-based authorization middleware
 * Provides easy-to-use policy checks for routes
 */
class PolicyMiddleware {
  /**
   * Check if user can perform action using specific policy
   * @param {string} policyType - Type of policy to use
   * @param {string} action - Action being performed
   * @param {Function} contextBuilder - Function to build context object
   * @returns {Function} Express middleware function
   */
  static requirePermission(policyType, action, contextBuilder = null) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return ResponseHandler.unauthorized(res, 'Authentication required');
        }

        // Build context object
        let context = { user: req.user };
        
        if (contextBuilder) {
          try {
            const additionalContext = await contextBuilder(req);
            context = { ...context, ...additionalContext };
          } catch (error) {
            logger.error('Context builder failed', {
              policyType,
              action,
              userId: req.user._id,
              error: error.message
            });
            return ResponseHandler.error(res, STATUS_CODES.INTERNAL_SERVER_ERROR, 'Context building failed');
          }
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

          return ResponseHandler.forbidden(res, 'Insufficient permissions');
        }

        next();
      } catch (error) {
        logger.error('Policy check failed', {
          userId: req.user?._id,
          policyType,
          action,
          error: error.message
        });

        return ResponseHandler.error(res, STATUS_CODES.INTERNAL_SERVER_ERROR, 'Permission check failed');
      }
    };
  }

  /**
   * Check if user can perform user-related action
   * @param {string} action - Action being performed
   * @param {Function} targetUserBuilder - Function to get target user
   * @returns {Function} Express middleware function
   */
  static requireUserPermission(action, targetUserBuilder = null) {
    return this.requirePermission('user', action, async (req) => {
      if (targetUserBuilder) {
        const targetUser = await targetUserBuilder(req);
        return { targetUser };
      }
      return { targetUser: req.user };
    });
  }

  /**
   * Check if user can perform game-related action
   * @param {string} action - Action being performed
   * @param {Function} gameBuilder - Function to get game
   * @returns {Function} Express middleware function
   */
  static requireGamePermission(action, gameBuilder = null) {
    return this.requirePermission('game', action, async (req) => {
      if (gameBuilder) {
        const game = await gameBuilder(req);
        return { game };
      }
      return {};
    });
  }

  /**
   * Check if user owns the resource (for profile updates, etc.)
   * @returns {Function} Express middleware function
   */
  static requireOwnership() {
    return this.requireUserPermission('edit_profile');
  }

  /**
   * Check if user can view profile
   * @param {Function} targetUserBuilder - Function to get target user
   * @returns {Function} Express middleware function
   */
  static canViewProfile(targetUserBuilder = null) {
    return this.requireUserPermission('view_profile', targetUserBuilder);
  }

  /**
   * Check if user can edit profile
   * @param {Function} targetUserBuilder - Function to get target user
   * @returns {Function} Express middleware function
   */
  static canEditProfile(targetUserBuilder = null) {
    return this.requireUserPermission('edit_profile', targetUserBuilder);
  }

  /**
   * Check if user can change password
   * @param {Function} targetUserBuilder - Function to get target user
   * @returns {Function} Express middleware function
   */
  static canChangePassword(targetUserBuilder = null) {
    return this.requireUserPermission('change_password', targetUserBuilder);
  }

  /**
   * Check if user can view stats
   * @param {Function} targetUserBuilder - Function to get target user
   * @returns {Function} Express middleware function
   */
  static canViewStats(targetUserBuilder = null) {
    return this.requireUserPermission('view_stats', targetUserBuilder);
  }

  /**
   * Check if user can create game
   * @returns {Function} Express middleware function
   */
  static canCreateGame() {
    return this.requireUserPermission('create_game');
  }

  /**
   * Check if user can join game
   * @param {Function} gameBuilder - Function to get game
   * @returns {Function} Express middleware function
   */
  static canJoinGame(gameBuilder = null) {
    return this.requireGamePermission('join_game', gameBuilder);
  }

  /**
   * Check if user can make move
   * @param {Function} gameBuilder - Function to get game
   * @returns {Function} Express middleware function
   */
  static canMakeMove(gameBuilder = null) {
    return this.requireGamePermission('make_move', gameBuilder);
  }

  /**
   * Check if user can resign game
   * @param {Function} gameBuilder - Function to get game
   * @returns {Function} Express middleware function
   */
  static canResignGame(gameBuilder = null) {
    return this.requireGamePermission('resign_game', gameBuilder);
  }

  /**
   * Check if user can view game
   * @param {Function} gameBuilder - Function to get game
   * @returns {Function} Express middleware function
   */
  static canViewGame(gameBuilder = null) {
    return this.requireGamePermission('view_game', gameBuilder);
  }

  /**
   * Check if user can spectate game
   * @param {Function} gameBuilder - Function to get game
   * @returns {Function} Express middleware function
   */
  static canSpectateGame(gameBuilder = null) {
    return this.requireGamePermission('spectate_game', gameBuilder);
  }

  /**
   * Check if user can offer draw
   * @param {Function} gameBuilder - Function to get game
   * @returns {Function} Express middleware function
   */
  static canOfferDraw(gameBuilder = null) {
    return this.requireGamePermission('offer_draw', gameBuilder);
  }

  /**
   * Check if user can accept draw
   * @param {Function} gameBuilder - Function to get game
   * @returns {Function} Express middleware function
   */
  static canAcceptDraw(gameBuilder = null) {
    return this.requireGamePermission('accept_draw', gameBuilder);
  }

  /**
   * Check if user can decline draw
   * @param {Function} gameBuilder - Function to get game
   * @returns {Function} Express middleware function
   */
  static canDeclineDraw(gameBuilder = null) {
    return this.requireGamePermission('decline_draw', gameBuilder);
  }

  /**
   * Check if user can request analysis
   * @param {Function} gameBuilder - Function to get game
   * @returns {Function} Express middleware function
   */
  static canRequestAnalysis(gameBuilder = null) {
    return this.requireGamePermission('request_analysis', gameBuilder);
  }

  /**
   * Check if user can create tournament
   * @returns {Function} Express middleware function
   */
  static canCreateTournament() {
    return this.requireUserPermission('create_game'); // Using create_game permission for now
  }

  /**
   * Check if user can join tournament
   * @param {Function} tournamentBuilder - Function to get tournament
   * @returns {Function} Express middleware function
   */
  static canJoinTournament(tournamentBuilder = null) {
    return this.requireGamePermission('join_tournament', tournamentBuilder);
  }

  /**
   * Check if user can administer game
   * @param {Function} gameBuilder - Function to get game
   * @returns {Function} Express middleware function
   */
  static canAdministerGame(gameBuilder = null) {
    return this.requireGamePermission('administer_game', gameBuilder);
  }

  /**
   * Check multiple permissions at once
   * @param {Array} checks - Array of permission checks
   * @returns {Function} Express middleware function
   */
  static requireMultiplePermissions(checks) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return ResponseHandler.unauthorized(res, 'Authentication required');
        }

        const results = await policyManager.checkMultiple(checks.map(check => ({
          ...check,
          context: { user: req.user, ...(check.context || {}) }
        })));

        const failedChecks = Object.entries(results).filter(([key, result]) => !result);
        
        if (failedChecks.length > 0) {
          logger.warn('Multiple permissions check failed', {
            userId: req.user._id,
            failedChecks: failedChecks.map(([key]) => key)
          });

          return ResponseHandler.forbidden(res, 'Insufficient permissions for some operations');
        }

        next();
      } catch (error) {
        logger.error('Multiple permissions check failed', {
          userId: req.user?._id,
          error: error.message
        });

        return ResponseHandler.error(res, STATUS_CODES.INTERNAL_SERVER_ERROR, 'Permissions check failed');
      }
    };
  }

  /**
   * Check if user has admin role
   * @returns {Function} Express middleware function
   */
  static requireAdmin() {
    return (req, res, next) => {
      if (!req.user || req.user.role !== 'admin') {
        return ResponseHandler.forbidden(res, 'Admin access required');
      }
      next();
    };
  }

  /**
   * Check if user has specific role
   * @param {string} role - Required role
   * @returns {Function} Express middleware function
   */
  static requireRole(role) {
    return (req, res, next) => {
      if (!req.user || req.user.role !== role) {
        return ResponseHandler.forbidden(res, `${role} role required`);
      }
      next();
    };
  }

  /**
   * Check if user has any of the specified roles
   * @param {Array} roles - Array of allowed roles
   * @returns {Function} Express middleware function
   */
  static requireAnyRole(roles) {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return ResponseHandler.forbidden(res, `One of these roles required: ${roles.join(', ')}`);
      }
      next();
    };
  }
}

module.exports = PolicyMiddleware;
