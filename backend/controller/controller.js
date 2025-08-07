const chessService = require('../service/service');

const getBoardState = (req, res) => {
  res.json({ board: chessService.getBoardState() });
};

const makeMove = (req, res) => {
  const move = req.body;
  const result = chessService.makeMove(move);
  if (result) {
    res.json({ success: true, move: result });
  } else {
    res.status(400).json({ success: false, message: "Invalid move" });
  }
};

module.exports = {
  getBoardState,
  makeMove
};
