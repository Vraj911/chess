const express = require('express');
const router = express.Router();
const chessService = require('../service/service');
const ChessController = require('../controller/controller');
router.get('/test', (req, res) => {
  try {
    const status = chessService.getGameStatus();
    const board = chessService.getBoardState();
    const turn = chessService.getTurn();
    res.json({
      success: true,
      message: 'Chess game is running!',
      data: {
        status: status.status,
        turn: turn,
        moveCount: status.moveCount,
        isCheck: status.isCheck,
        isCheckmate: status.isCheckmate,
        boardFEN: board
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Chess game test failed',
      details: error.message
    });
  }
});
router.get('/game/status', (req, res) => {
  try {
    const status = chessService.getGameStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get game status'
    });
  }
});
router.get('/game/board', (req, res) => {
  try {
    const board = chessService.getBoardState();
    res.json({
      success: true,
      data: {
        fen: board,
        turn: chessService.getTurn(),
        isCheck: chessService.isCheck(),
        isCheckmate: chessService.isCheckmate()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get board state'
    });
  }
});
router.get('/game/history', (req, res) => {
  try {
    const history = chessService.getGameHistory();
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get move history'
    });
  }
});
router.get('/game/moves/:square', (req, res) => {
  try {
    const { square } = req.params;
    const moves = chessService.getValidMoves(square);
    res.json({
      success: true,
      data: {
        square,
        moves
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get valid moves'
    });
  }
});
router.post('/game/new', (req, res) => {
  try {
    const newBoard = chessService.startNewGame();
    res.json({
      success: true,
      data: {
        message: 'New game started',
        board: newBoard,
        status: chessService.getGameStatus()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start new game'
    });
  }
});
router.post('/game/resign', (req, res) => {
  try {
    const { color } = req.body;
    if (!color || !['w', 'b'].includes(color)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid color parameter'
      });
    }
    const resigned = chessService.resign(color);
    if (resigned) {
      res.json({
        success: true,
        data: {
          message: `${color === 'w' ? 'White' : 'Black'} resigned`,
          status: chessService.getGameStatus()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Cannot resign at this time'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to resign game'
    });
  }
});
router.get('/game/pgn', (req, res) => {
  try {
    const pgn = chessService.getPgn();
    res.json({
      success: true,
      data: {
        pgn
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get PGN'
    });
  }
});
router.post('/game/load', (req, res) => {
  try {
    const { fen } = req.body;
    if (!fen) {
      return res.status(400).json({
        success: false,
        error: 'FEN string is required'
      });
    }
    const loaded = chessService.loadGame(fen);
    if (loaded) {
      res.json({
        success: true,
        data: {
          message: 'Game loaded successfully',
          board: chessService.getBoardState(),
          status: chessService.getGameStatus()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid FEN string'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load game'
    });
  }
});
router.get('/game/stats', (req, res) => {
  try {
    const stats = ChessController.getGameStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get game statistics'
    });
  }
});
router.get('/game/analysis', (req, res) => {
  try {
    const analysis = ChessController.getGameAnalysis();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get game analysis'
    });
  }
});
router.post('/game/validate-move', (req, res) => {
  try {
    const { move } = req.body;
    if (!move) {
      return res.status(400).json({
        success: false,
        error: 'Move is required'
      });
    }
    const validation = ChessController.validateMove(move);
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to validate move'
    });
  }
});
module.exports = router;
