const { Chess } = require('chess.js');
const chess = new Chess();
const getChessInstance = () => chess;
const getBoardState = () => chess.fen();
const makeMove = (move) => chess.move(move);
const getTurn = () => chess.turn();
const isGameOver = () => chess.isGameOver();
const getResult = () => {
  if (chess.isCheckmate()) {
    return (chess.turn() === 'w') ? "Black wins by checkmate!" : "White wins by checkmate!";
  } else if (chess.isStalemate()) {
    return "Game drawn by stalemate!";
  } else if (chess.isThreefoldRepetition()) {
    return "Game drawn by threefold repetition!";
  } else if (chess.isInsufficientMaterial()) {
    return "Game drawn due to insufficient material!";
  } else if (chess.isDraw()) {
    return "Game drawn!";
  }
  return null;
};
module.exports = {
  getChessInstance,
  getBoardState,
  makeMove,
  getTurn,
  isGameOver,
  getResult,
};
