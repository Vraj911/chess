require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/database');
const chessService = require('./service/service');
const app = express();
const server = http.createServer(app);
connectDB();
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.use(express.static(path.join(__dirname, 'client', 'build')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const chessRoutes = require('./routes/routes.js');
const authRoutes = require('./routes/auth.js');
app.use('/api/auth', authRoutes);
app.use('/api/game', chessRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Chess Game Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});
require('./sockets/socketHandler')(io);
chessService.startNewGame();
console.log('New chess game initialized');
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Chess game ready for players!');
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
