// socket/socketController.js
const chessService = require('../service/service');
const User = require('../models/User');
const Game = require('../models/Game');
let players = {};
let gameRooms = {};
let currentGame = null;
function handleConnection(io, socket) {
  socket.join('default');
  if (socket.isAuthenticated && socket.user) {
    if (!players.white) {
      players.white = socket.id;
      socket.emit('playerRole', 'w');
      socket.emit('gameStatus', chessService.getGameStatus());
      console.log(`White player assigned: ${socket.user.username} (${socket.id})`);
    } else if (!players.black) {
      players.black = socket.id;
      socket.emit('playerRole', 'b');
      socket.emit('gameStatus', chessService.getGameStatus());
      console.log(`Black player assigned: ${socket.user.username} (${socket.id})`);
    } else {
      socket.emit('spectatorRole');
      console.log(`Spectator connected: ${socket.user.username} (${socket.id})`);
    }
  } else {
    socket.emit('spectatorRole');
    console.log('Anonymous spectator connected:', socket.id);
  }
  socket.emit('boardState', chessService.getBoardState());
  socket.emit('gameStatus', chessService.getGameStatus());
  socket.emit('moveHistory', chessService.getGameHistory());
  socket.on('move', async (move) => {
    const color = (socket.id === players.white) ? 'w' :
                  (socket.id === players.black) ? 'b' : null;
    if (!color) {
      socket.emit('error', 'You are not a player in this game');
      return;
    }
    if (!chessService.canMove(color)) {
      socket.emit('error', 'It is not your turn or the game is over');
      return;
    }
    const result = chessService.makeMove(move);
    if (result) {
            if (currentGame) {
        try {
          await currentGame.addMove({
            from: move.from,
            to: move.to,
            piece: result.piece,
            color: color,
            san: result.san
          });
        } catch (err) {
          console.error('Error saving move to database:', err);
        }
      }
      io.to('default').emit('move', move);
      io.to('default').emit('boardState', chessService.getBoardState());
      io.to('default').emit('gameStatus', chessService.getGameStatus());
      io.to('default').emit('moveHistory', chessService.getGameHistory());
      const gameStatus = chessService.getGameStatus();
      if (gameStatus.isCheck && !gameStatus.isCheckmate) {
        io.to('default').emit('check', {
          color: gameStatus.turn,
          message: `${gameStatus.turn === 'w' ? 'White' : 'Black'} is in check!`
        });
      }
      if (gameStatus.isCheckmate) {
        io.to('default').emit('checkmate', {
          winner: gameStatus.winner,
          message: chessService.getResult()
        });
      }
      if (gameStatus.status === 'finished') {
        if (currentGame) {
          try {
            const result = gameStatus.winner === 'w' ? 'white_win' : 
                          gameStatus.winner === 'b' ? 'black_win' : 'draw';
            await currentGame.endGame(
              result,
              gameStatus.winner ? (gameStatus.winner === 'w' ? players.white : players.black) : null,
              gameStatus.drawReason
            );
            await updatePlayerStats(gameStatus);
          } catch (err) {
            console.error('Error ending game in database:', err);
          }
        }
        io.to('default').emit('gameOver', {
          result: chessService.getResult(),
          winner: gameStatus.winner,
          drawReason: gameStatus.drawReason,
          finalBoard: chessService.getBoardState(),
          pgn: chessService.getPgn()
        });
      }
      console.log(`Move made by ${color}: ${move.from} to ${move.to}`);
    } else {
      socket.emit('invalidMove', {
        move: move,
        message: 'Invalid move. Please try again.'
      });
    }
  });
  socket.on('resign', async () => {
    const color = (socket.id === players.white) ? 'w' :
                  (socket.id === players.black) ? 'b' : null;
    if (!color) {
      socket.emit('error', 'You are not a player in this game');
      return;
    }
    if (chessService.resign(color)) {
      if (currentGame) {
        try {
          const result = color === 'w' ? 'black_win' : 'white_win';
          await currentGame.endGame(result, color === 'w' ? players.black : players.white, 'resignation');
                    const gameStatus = chessService.getGameStatus();
          await updatePlayerStats(gameStatus);
        } catch (err) {
          console.error('Error ending game in database:', err);
        }
      }
      io.to('default').emit('gameOver', {
        result: `${color === 'w' ? 'Black' : 'White'} wins by resignation!`,
        winner: color === 'w' ? 'b' : 'w',
        drawReason: 'resignation',
        finalBoard: chessService.getBoardState(),
        pgn: chessService.getPgn()
      });
      io.to('default').emit('gameStatus', chessService.getGameStatus());
      console.log(`${color === 'w' ? 'White' : 'Black'} resigned`);
    }
  });
  socket.on('newGame', async () => {
    if (players.white && players.black) {
            if (currentGame && currentGame.status === 'active') {
        try {
          await currentGame.endGame('abandoned', null, 'abandoned');
        } catch (err) {
          console.error('Error abandoning current game:', err);
        }
      }
      try {
        const whiteUser = await getUserFromSocketId(players.white);
        const blackUser = await getUserFromSocketId(players.black);
        if (whiteUser && blackUser) {
          currentGame = new Game({
            whitePlayer: whiteUser._id,
            blackPlayer: blackUser._id
          });
          await currentGame.save();
          console.log('New game created in database');
        }
      } catch (err) {
        console.error('Error creating new game in database:', err);
      }
      const newBoard = chessService.startNewGame();
      io.to('default').emit('boardState', newBoard);
      io.to('default').emit('gameStatus', chessService.getGameStatus());
      io.to('default').emit('moveHistory', chessService.getGameHistory());
      io.to('default').emit('newGameStarted', {
        message: 'New game started!',
        board: newBoard
      });
      console.log('New game started');
    }
  });
  socket.on('getValidMoves', (square) => {
    const validMoves = chessService.getValidMoves(square);
    socket.emit('validMoves', { square, moves: validMoves });
  });
  socket.on('getGameStatus', () => {
    socket.emit('gameStatus', chessService.getGameStatus());
  });
  socket.on('getMoveHistory', () => {
    socket.emit('moveHistory', chessService.getGameHistory());
  });
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    if (socket.id === players.white) {
      delete players.white;
      console.log('White player disconnected');
    }
    if (socket.id === players.black) {
      delete players.black;
      console.log('Black player disconnected');
    }
    if (!players.white && !players.black) {
      chessService.startNewGame();
      currentGame = null;
      console.log('Game reset due to no players');
    }
    io.to('default').emit('playerDisconnected', {
      message: 'A player has disconnected',
      remainingPlayers: Object.keys(players).length
    });
  });
  socket.on('reconnect', (playerData) => {
    if (playerData.color === 'w' && !players.white) {
      players.white = socket.id;
      socket.emit('playerRole', 'w');
      console.log('White player reconnected');
    } else if (playerData.color === 'b' && !players.black) {
      players.black = socket.id;
      socket.emit('playerRole', 'b');
      console.log('Black player reconnected');
    }
  });
}
async function getUserFromSocketId(socketId) {
  try {
    return null;
  } catch (error) {
    console.error('Error getting user from socket ID:', error);
    return null;
  }
}
async function updatePlayerStats(gameStatus) {
  try {
    console.log('Player statistics updated');
  } catch (error) {
    console.error('Error updating player statistics:', error);
  }
}
module.exports = { handleConnection };
