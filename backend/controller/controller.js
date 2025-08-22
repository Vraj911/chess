const chessService = require('../service/service');
class ChessController {
  static validateMove(move) {
    try {
      if (!move || !move.from || !move.to) {
        return { valid: false, error: 'Invalid move format' };
      }      const fromRegex = /^[a-h][1-8]$/;
      const toRegex = /^[a-h][1-8]$/;
      if (!fromRegex.test(move.from) || !toRegex.test(move.to)) {
        return { valid: false, error: 'Invalid square notation' };
      }
      const gameStatus = chessService.getGameStatus();
      if (gameStatus.status !== 'active') {
        return { valid: false, error: 'Game is not active' };
      }
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Move validation failed' };
    }
  }
  static getGameAnalysis() {
    try {
      const status = chessService.getGameStatus();
      const history = chessService.getGameHistory();
            const analysis = {
        gamePhase: this.getGamePhase(history),
        materialCount: this.getMaterialCount(),
        positionEvaluation: this.getPositionEvaluation(),
        threats: this.getThreats(),
        opportunities: this.getOpportunities()
      };
      return {
        success: true,
        data: {
          status,
          analysis,
          history
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to analyze game'
      };
    }
  }
  static getGamePhase(history) {
    const moveCount = history.length;
    if (moveCount < 10) return 'opening';
    if (moveCount < 20) return 'early_middlegame';
    if (moveCount < 30) return 'middlegame';
    if (moveCount < 40) return 'late_middlegame';
    return 'endgame';
  }
  static getMaterialCount() {
    try {
      const chess = chessService.getChessInstance();
      const board = chess.board();
      let whiteMaterial = 0;
      let blackMaterial = 0;
      
      const pieceValues = {
        'p': 1, 'r': 5, 'n': 3, 'b': 3, 'q': 9, 'k': 0
      };
      board.forEach(row => {
        row.forEach(square => {
          if (square) {
            const value = pieceValues[square.type] || 0;
            if (square.color === 'w') {
              whiteMaterial += value;
            } else {
              blackMaterial += value;
            }
          }
        });
      });
      return {
        white: whiteMaterial,
        black: blackMaterial,
        difference: whiteMaterial - blackMaterial
      };
    } catch (error) {
      return { white: 0, black: 0, difference: 0 };
    }
  }
  static getPositionEvaluation() {
    try {
      const chess = chessService.getChessInstance();
            if (chess.isCheckmate()) {
        return chess.turn() === 'w' ? -1000 : 1000;
      }
      if (chess.isCheck()) {
        return chess.turn() === 'w' ? -50 : 50;
      }
      const material = this.getMaterialCount();
      let evaluation = material.difference * 10;
      const board = chess.board();
      let positionBonus = 0;
      for (let i = 3; i <= 4; i++) {
        for (let j = 3; j <= 4; j++) {
          if (board[i][j]) {
            if (board[i][j].color === 'w') {
              positionBonus += 5;
            } else {
              positionBonus -= 5;
            }
          }
        }
      }
      evaluation += positionBonus;
      return evaluation;
    } catch (error) {
      return 0;
    }
  }
  static getThreats() {
    try {
      const chess = chessService.getChessInstance();
      const currentTurn = chess.turn();
      const threats = [];
            if (chess.isCheck()) {
        threats.push({
          type: 'check',
          severity: 'high',
          description: `${currentTurn === 'w' ? 'White' : 'Black'} king is in check`
        });
      }
      const allMoves = chess.moves({ verbose: true });
      const hangingPieces = [];
      allMoves.forEach(move => {
        if (move.captured) {
          hangingPieces.push({
            piece: move.captured,
            square: move.to,
            value: this.getPieceValue(move.captured)
          });
        }
      });
      if (hangingPieces.length > 0) {
        threats.push({
          type: 'hanging_pieces',
          severity: 'medium',
          pieces: hangingPieces
        });
      }

      return threats;
    } catch (error) {
      return [];
    }
  }
  static getOpportunities() {
    try {
      const chess = chessService.getChessInstance();
      const currentTurn = chess.turn();
      const opportunities = [];
            const allMoves = chess.moves({ verbose: true });
      allMoves.forEach(move => {
        if (move.san.includes('#') || move.san.includes('+')) {
          opportunities.push({
            type: 'checkmate_opportunity',
            severity: 'high',
            move: move,
            description: `Checkmate opportunity with ${move.san}`
          });
        }
      });
      const captures = allMoves.filter(move => move.captured);
      if (captures.length > 0) {
        opportunities.push({
          type: 'capture_opportunities',
          severity: 'medium',
          moves: captures
        });
      }
      return opportunities;
    } catch (error) {
      return [];
    }
  }
  static getPieceValue(pieceType) {
    const values = {
      'p': 1, 'r': 5, 'n': 3, 'b': 3, 'q': 9, 'k': 0
    };
    return values[pieceType] || 0;
  }
  static getGameStats() {
    try {
      const status = chessService.getGameStatus();
      const history = chessService.getGameHistory();
      const stats = {
        totalMoves: status.moveCount,
        gameDuration: status.duration,
        gameStatus: status.status,
        isCheck: status.isCheck,
        isCheckmate: status.isCheckmate,
        currentTurn: status.turn,
        materialCount: this.getMaterialCount(),
        positionEvaluation: this.getPositionEvaluation(),
        threats: this.getThreats(),
        opportunities: this.getOpportunities()
      };
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get game statistics'
      };
    }
  }
}
module.exports = ChessController;
