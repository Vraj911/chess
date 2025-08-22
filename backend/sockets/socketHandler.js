// socket/socketHandler.js
const socketController = require('./socketController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function socketHandler(io) {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        // Allow anonymous connections for spectators
        socket.isAuthenticated = false;
        return next();
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isOnline) {
        socket.isAuthenticated = false;
        return next();
      }

      // Attach user to socket
      socket.user = user;
      socket.isAuthenticated = true;
      next();
    } catch (error) {
      socket.isAuthenticated = false;
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id, socket.isAuthenticated ? `(${socket.user?.username})` : '(anonymous)');
    
    // Update user's online status if authenticated
    if (socket.isAuthenticated && socket.user) {
      socket.user.isOnline = true;
      socket.user.lastSeen = new Date();
      socket.user.save().catch(err => console.error('Error updating user status:', err));
    }

    socketController.handleConnection(io, socket);

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id, socket.isAuthenticated ? `(${socket.user?.username})` : '(anonymous)');
      
      // Update user's offline status if authenticated
      if (socket.isAuthenticated && socket.user) {
        try {
          socket.user.isOnline = false;
          socket.user.lastSeen = new Date();
          await socket.user.save();
        } catch (err) {
          console.error('Error updating user offline status:', err);
        }
      }
    });
  });
}

module.exports = socketHandler;
