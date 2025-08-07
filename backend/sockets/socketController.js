// socket/socketController.js
const chessService = require('../service/service');

let players = {};

function handleConnection(io, socket) {
  // Assign player roles
  if (!players.white) {
    players.white = socket.id;
    socket.emit('playerRole', 'w');
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit('playerRole', 'b');
  } else {
    socket.emit('spectatorRole');
  }

  // Send initial board state
  socket.emit('boardState', chessService.getBoardState());

  // Handle move event
  socket.on('move', (move) => {
    const color = (socket.id === players.white) ? 'w' :
                  (socket.id === players.black) ? 'b' : null;

    if (!color || color !== chessService.getTurn()) return;

    const result = chessService.makeMove(move);

    if (result) {
      io.emit('move', move);
      io.emit('boardState', chessService.getBoardState());

      if (chessService.isGameOver()) {
        io.emit('gameOver', chessService.getResult());
      }
    } else {
      socket.emit('invalid', move);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.id === players.white) delete players.white;
    if (socket.id === players.black) delete players.black;
  });
}

module.exports = { handleConnection };
