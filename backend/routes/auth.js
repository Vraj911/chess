const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticateToken, requireOwnership } = require('../middleware/auth');
const router = express.Router();
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }
    const user = new User({
      username,
      email,
      password
    });

    await user.save();
    const token = generateToken(user._id);
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: error.message
    });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    const token = generateToken(user._id);
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message
    });
  }
});
router.post('/logout', authenticateToken, async (req, res) => {
  try {
        req.user.isOnline = false;
    req.user.lastSeen = new Date();
    await req.user.save();
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      details: error.message
    });
  }
});
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      details: error.message
    });
  }
});
router.put('/profile', authenticateToken, requireOwnership(), async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;
    const updates = {};
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username already taken'
        });
      }
      updates.username = username;
    }
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered'
        });
      }
      updates.email = email;
    }
    if (profilePicture !== undefined) {
      updates.profilePicture = profilePicture;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid updates provided'
      });
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile update failed',
      details: error.message
    });
  }
});
router.put('/change-password', authenticateToken, requireOwnership(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }
    const user = await User.findById(req.user._id);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    user.password = newPassword;
    await user.save();
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      error: 'Password change failed',
      details: error.message
    });
  }
});
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: {
        stats: {
          rating: user.rating,
          gamesPlayed: user.gamesPlayed,
          gamesWon: user.gamesWon,
          gamesDrawn: user.gamesDrawn,
          gamesLost: user.gamesLost,
          winRate: user.winRate,
          totalScore: user.totalScore
        }
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      details: error.message
    });
  }
});
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const newToken = generateToken(req.user._id);
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
      details: error.message
    });
  }
});
module.exports = router;
