const BasePolicy = require('./basePolicy');
const { USER } = require('../config/constants');

/**
 * User Policy
 * Handles user-related permissions and business rules
 */
class UserPolicy extends BasePolicy {
  constructor() {
    super();
    this.description = 'Policy for user-related operations';
    this.version = '1.0.0';
    this.author = 'Chess Game System';
  }

  /**
   * Check if user can perform action
   * @param {Object} context - Context object
   * @param {string} action - Action being performed
   * @returns {boolean} True if allowed
   */
  async can(context, action) {
    // Validate context
    if (!this.validateContext(context, ['user'])) {
      return false;
    }

    const { user, targetUser, resource } = context;

    switch (action) {
      case 'view_profile':
        return this.canViewProfile(user, targetUser);
      
      case 'edit_profile':
        return this.canEditProfile(user, targetUser);
      
      case 'delete_account':
        return this.canDeleteAccount(user, targetUser);
      
      case 'change_password':
        return this.canChangePassword(user, targetUser);
      
      case 'view_stats':
        return this.canViewStats(user, targetUser);
      
      case 'update_rating':
        return this.canUpdateRating(user, targetUser);
      
      case 'view_games':
        return this.canViewGames(user, targetUser);
      
      case 'create_game':
        return this.canCreateGame(user);
      
      case 'join_game':
        return this.canJoinGame(user, resource);
      
      case 'spectate_game':
        return this.canSpectateGame(user, resource);
      
      default:
        return false;
    }
  }

  /**
   * Check if user can view profile
   * @param {Object} user - Current user
   * @param {Object} targetUser - Target user profile
   * @returns {boolean} True if allowed
   */
  canViewProfile(user, targetUser) {
    // Users can always view their own profile
    if (user._id.toString() === targetUser._id.toString()) {
      return true;
    }

    // Users can view public profiles
    if (targetUser.isPublic) {
      return true;
    }

    // Admins can view any profile
    if (user.role === 'admin') {
      return true;
    }

    // Friends can view each other's profiles
    if (user.friends && user.friends.includes(targetUser._id)) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can edit profile
   * @param {Object} user - Current user
   * @param {Object} targetUser - Target user profile
   * @returns {boolean} True if allowed
   */
  canEditProfile(user, targetUser) {
    // Users can only edit their own profile
    if (user._id.toString() === targetUser._id.toString()) {
      return true;
    }

    // Admins can edit any profile
    if (user.role === 'admin') {
      return true;
    }

    return false;
  }

  /**
   * Check if user can delete account
   * @param {Object} user - Current user
   * @param {Object} targetUser - Target user account
   * @returns {boolean} True if allowed
   */
  canDeleteAccount(user, targetUser) {
    // Users can only delete their own account
    if (user._id.toString() === targetUser._id.toString()) {
      return true;
    }

    // Admins can delete any account
    if (user.role === 'admin') {
      return true;
    }

    return false;
  }

  /**
   * Check if user can change password
   * @param {Object} user - Current user
   * @param {Object} targetUser - Target user
   * @returns {boolean} True if allowed
   */
  canChangePassword(user, targetUser) {
    // Users can only change their own password
    if (user._id.toString() === targetUser._id.toString()) {
      return true;
    }

    // Admins can change any password
    if (user.role === 'admin') {
      return true;
    }

    return false;
  }

  /**
   * Check if user can view stats
   * @param {Object} user - Current user
   * @param {Object} targetUser - Target user
   * @returns {boolean} True if allowed
   */
  canViewStats(user, targetUser) {
    // Users can always view their own stats
    if (user._id.toString() === targetUser._id.toString()) {
      return true;
    }

    // Users can view public stats
    if (targetUser.isPublic) {
      return true;
    }

    // Admins can view any stats
    if (user.role === 'admin') {
      return true;
    }

    return false;
  }

  /**
   * Check if user can update rating
   * @param {Object} user - Current user
   * @param {Object} targetUser - Target user
   * @returns {boolean} True if allowed
   */
  canUpdateRating(user, targetUser) {
    // Only system can update ratings automatically
    if (user.role === 'system') {
      return true;
    }

    // Admins can manually update ratings
    if (user.role === 'admin') {
      return true;
    }

    return false;
  }

  /**
   * Check if user can view games
   * @param {Object} user - Current user
   * @param {Object} targetUser - Target user
   * @returns {boolean} True if allowed
   */
  canViewGames(user, targetUser) {
    // Users can always view their own games
    if (user._id.toString() === targetUser._id.toString()) {
      return true;
    }

    // Users can view public games
    if (targetUser.isPublic) {
      return true;
    }

    // Admins can view any games
    if (user.role === 'admin') {
      return true;
    }

    return false;
  }

  /**
   * Check if user can create game
   * @param {Object} user - Current user
   * @returns {boolean} True if allowed
   */
  canCreateGame(user) {
    // User must be authenticated
    if (!user) {
      return false;
    }

    // User must not be banned
    if (user.isBanned) {
      return false;
    }

    // User must have completed email verification
    if (!user.emailVerified) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can join game
   * @param {Object} user - Current user
   * @param {Object} game - Game to join
   * @returns {boolean} True if allowed
   */
  canJoinGame(user, game) {
    // User must be authenticated
    if (!user) {
      return false;
    }

    // User must not be banned
    if (user.isBanned) {
      return false;
    }

    // Game must be open for joining
    if (game.status !== 'waiting') {
      return false;
    }

    // User must not already be in the game
    if (game.players.includes(user._id)) {
      return false;
    }

    // Game must not be full
    if (game.players.length >= 2) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can spectate game
   * @param {Object} user - Current user
   * @param {Object} game - Game to spectate
   * @returns {boolean} True if allowed
   */
  canSpectateGame(user, game) {
    // Game must allow spectators
    if (!game.allowSpectators) {
      return false;
    }

    // User must not be banned
    if (user && user.isBanned) {
      return false;
    }

    return true;
  }
}

module.exports = UserPolicy;
