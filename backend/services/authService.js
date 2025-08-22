const bcrypt = require('bcryptjs');
const User = require('../models/User');
const JWTService = require('../utils/jwt');
const { USER, ERROR_MESSAGES } = require('../config/constants');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Registration result
   */
  static async registerUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }]
      });

      if (existingUser) {
        const error = existingUser.email === userData.email 
          ? ERROR_MESSAGES.VALIDATION.EMAIL_REGISTERED 
          : ERROR_MESSAGES.VALIDATION.USERNAME_TAKEN;
        
        throw new Error(error);
      }

      // Create new user
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        rating: USER.DEFAULT_RATING
      });

      await user.save();

      // Generate tokens
      const tokens = JWTService.generateTokenPair(user._id);

      // Update user online status
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      return {
        user: user.getPublicProfile(),
        ...tokens
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Authenticate user login
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Login result
   */
  static async loginUser(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
      }

      // Generate tokens
      const tokens = JWTService.generateTokenPair(user._id);

      // Update user online status
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      return {
        user: user.getPublicProfile(),
        ...tokens
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   * @param {string} userId - User ID
   * @returns {boolean} Success status
   */
  static async logoutUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER.NOT_FOUND);
      }

      user.isOnline = false;
      user.lastSeen = new Date();
      await user.save();

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New token pair
   */
  static async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = JWTService.verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if user exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER.NOT_FOUND);
      }

      // Generate new token pair
      const tokens = JWTService.generateTokenPair(user._id);

      return {
        user: user.getPublicProfile(),
        ...tokens
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {boolean} Success status
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER.NOT_FOUND);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error(ERROR_MESSAGES.AUTH.CURRENT_PASSWORD_INCORRECT);
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Object} User profile
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER.NOT_FOUND);
      }

      return user.getPublicProfile();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Profile update data
   * @returns {Object} Updated user profile
   */
  static async updateUserProfile(userId, updateData) {
    try {
      // Check for duplicate username/email if updating
      if (updateData.username || updateData.email) {
        const query = { _id: { $ne: userId } };
        if (updateData.username) query.username = updateData.username;
        if (updateData.email) query.email = updateData.email;

        const existingUser = await User.findOne(query);
        if (existingUser) {
          const error = existingUser.email === updateData.email 
            ? ERROR_MESSAGES.VALIDATION.EMAIL_REGISTERED 
            : ERROR_MESSAGES.VALIDATION.USERNAME_TAKEN;
          
          throw new Error(error);
        }
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        throw new Error(ERROR_MESSAGES.USER.NOT_FOUND);
      }

      return updatedUser.getPublicProfile();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user statistics
   * @param {string} userId - User ID
   * @returns {Object} User statistics
   */
  static async getUserStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER.NOT_FOUND);
      }

      return {
        rating: user.rating,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        gamesDrawn: user.gamesDrawn,
        gamesLost: user.gamesLost,
        winRate: user.winRate,
        totalScore: user.totalScore
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
