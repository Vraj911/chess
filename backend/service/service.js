const { Chess } = require('chess.js');

class ChessGame {
  constructor() {
    this.chess = new Chess();
    this.gameId = null;
    this.gameHistory = [];
    this.moveCount = 0;
    this.gameStartTime = null;
    this.lastMoveTime = null;
    this.gameStatus = 'waiting'; // waiting, active, finished
    this.winner = null;
    this.drawReason = null;
  }

  startNewGame() {
    this.chess = new Chess();
    this.gameHistory = [];
    this.moveCount = 0;
    this.gameStartTime = new Date();
    this.lastMoveTime = new Date();
    this.gameStatus = 'active';
    this.winner = null;
    this.drawReason = null;
    return this.chess.fen();
  }

  getChessInstance() {
    return this.chess;
  }

  getBoardState() {
    return this.chess.fen();
  }

  makeMove(move) {
    try {
      const result = this.chess.move(move);
      if (result) {
        this.moveCount++;
        this.lastMoveTime = new Date();
        
        // Add move to history
        this.gameHistory.push({
          move: result,
          fen: this.chess.fen(),
          timestamp: this.lastMoveTime,
          moveNumber: this.moveCount
        });

        // Check game status
        this.updateGameStatus();
        
        return result;
      }
      return null;
    } catch (error) {
      console.error('Move validation error:', error);
      return null;
    }
  }

  updateGameStatus() {
    if (this.chess.isCheckmate()) {
      this.gameStatus = 'finished';
      this.winner = this.chess.turn() === 'w' ? 'b' : 'w';
      this.drawReason = null;
    } else if (this.chess.isStalemate()) {
      this.gameStatus = 'finished';
      this.winner = null;
      this.drawReason = 'stalemate';
    } else if (this.chess.isThreefoldRepetition()) {
      this.gameStatus = 'finished';
      this.winner = null;
      this.drawReason = 'threefold_repetition';
    } else if (this.chess.isInsufficientMaterial()) {
      this.gameStatus = 'finished';
      this.winner = null;
      this.drawReason = 'insufficient_material';
    } else if (this.chess.isDraw()) {
      this.gameStatus = 'finished';
      this.winner = null;
      this.drawReason = 'draw';
    } else {
      this.gameStatus = 'active';
    }
  }

  getTurn() {
    return this.chess.turn();
  }

  isGameOver() {
    return this.chess.isGameOver();
  }

  getResult() {
    if (this.chess.isCheckmate()) {
      const winner = this.chess.turn() === 'w' ? 'Black' : 'White';
      return `${winner} wins by checkmate!`;
    } else if (this.chess.isStalemate()) {
      return "Game drawn by stalemate!";
    } else if (this.chess.isThreefoldRepetition()) {
      return "Game drawn by threefold repetition!";
    } else if (this.chess.isInsufficientMaterial()) {
      return "Game drawn due to insufficient material!";
    } else if (this.chess.isDraw()) {
      return "Game drawn!";
    }
    return null;
  }

  isCheck() {
    return this.chess.isCheck();
  }

  isCheckmate() {
    return this.chess.isCheckmate();
  }

  getValidMoves(square) {
    try {
      return this.chess.moves({ square, verbose: true });
    } catch (error) {
      return [];
    }
  }

  getAllValidMoves() {
    try {
      return this.chess.moves({ verbose: true });
    } catch (error) {
      return [];
    }
  }

  getGameHistory() {
    return this.gameHistory;
  }

  getMoveCount() {
    return this.moveCount;
  }

  getGameDuration() {
    if (!this.gameStartTime) return 0;
    const now = this.gameStatus === 'active' ? new Date() : this.lastMoveTime;
    return Math.floor((now - this.gameStartTime) / 1000);
  }

  getGameStatus() {
    return {
      status: this.gameStatus,
      winner: this.winner,
      drawReason: this.drawReason,
      moveCount: this.moveCount,
      duration: this.getGameDuration(),
      isCheck: this.isCheck(),
      isCheckmate: this.isCheckmate(),
      turn: this.getTurn()
    };
  }

  canMove(color) {
    return this.gameStatus === 'active' && this.getTurn() === color;
  }

  resign(color) {
    if (this.gameStatus === 'active') {
      this.gameStatus = 'finished';
      this.winner = color === 'w' ? 'b' : 'w';
      this.drawReason = 'resignation';
      return true;
    }
    return false;
  }

  offerDraw(color) {
    // This would need to be implemented with player confirmation
    return false;
  }

  getPgn() {
    return this.chess.pgn();
  }

  loadGame(fen) {
    try {
      this.chess.load(fen);
      this.updateGameStatus();
      return true;
    } catch (error) {
      console.error('Error loading game:', error);
      return false;
    }
  }
}

// Create a game instance
const game = new ChessGame();

// Export the enhanced functions
module.exports = {
  getChessInstance: () => game.getChessInstance(),
  getBoardState: () => game.getBoardState(),
  makeMove: (move) => game.makeMove(move),
  getTurn: () => game.getTurn(),
  isGameOver: () => game.isGameOver(),
  getResult: () => game.getResult(),
  isCheck: () => game.isCheck(),
  isCheckmate: () => game.isCheckmate(),
  getValidMoves: (square) => game.getValidMoves(square),
  getAllValidMoves: () => game.getAllValidMoves(),
  getGameHistory: () => game.getGameHistory(),
  getGameStatus: () => game.getGameStatus(),
  canMove: (color) => game.canMove(color),
  resign: (color) => game.resign(color),
  startNewGame: () => game.startNewGame(),
  getPgn: () => game.getPgn(),
  loadGame: (fen) => game.loadGame(fen),
  getGameInstance: () => game
};
