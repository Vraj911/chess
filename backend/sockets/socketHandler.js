// socket/socketHandler.js
const socketController = require('./socketController');

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socketController.handleConnection(io, socket);
  });
}

module.exports = socketHandler;
