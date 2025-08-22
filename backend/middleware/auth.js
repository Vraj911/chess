const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
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
        error: 'Invalid token - user not found'
      });
    }

    // Check if user is still active
    if (!user.isOnline) {
      return res.status(401).json({
        success: false,
        error: 'User session expired'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Token verification failed'
      });
    }
  }
};

// Middleware to check if user is authenticated (optional)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isOnline) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Middleware to check if user has specific role (for future use)
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Add role checking logic here if needed
    // For now, just check if user is authenticated
    next();
  };
};

// Middleware to check if user owns the resource
const requireOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const resourceId = req.params[resourceField] || req.body[resourceField];
    if (resourceId && resourceId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - you can only modify your own resources'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireOwnership
};
