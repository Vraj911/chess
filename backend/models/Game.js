const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  whitePlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blackPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'finished', 'abandoned'],
    default: 'active'
  },
  result: {
    type: String,
    enum: ['white_win', 'black_win', 'draw', 'abandoned'],
    default: null
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  drawReason: {
    type: String,
    enum: ['stalemate', 'threefold_repetition', 'insufficient_material', 'agreement', 'resignation'],
    default: null
  },
  moves: [{
    from: String,
    to: String,
    piece: String,
    color: String,
    san: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  finalFEN: {
    type: String,
    default: null
  },
  pgn: {
    type: String,
    default: null
  },
  gameDuration: {
    type: Number, // in seconds
    default: 0
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  timeControl: {
    type: String,
    default: 'unlimited'
  },
  ratingChange: {
    white: {
      type: Number,
      default: 0
    },
    black: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
gameSchema.index({ whitePlayer: 1, createdAt: -1 });
gameSchema.index({ blackPlayer: 1, createdAt: -1 });
gameSchema.index({ status: 1, createdAt: -1 });
gameSchema.methods.addMove = function(move) {
  this.moves.push(move);
  this.updatedAt = new Date();
  return this.save();
};
gameSchema.methods.endGame = function(result, winner = null, drawReason = null) {
  this.status = 'finished';
  this.result = result;
  this.winner = winner;
  this.drawReason = drawReason;
  this.endTime = new Date();
  this.gameDuration = Math.floor((this.endTime - this.startTime) / 1000);
  this.updatedAt = new Date();
  return this.save();
};
gameSchema.methods.calculateRatingChanges = function() {
  const whitePlayer = this.whitePlayer;
  const blackPlayer = this.blackPlayer;
  if (this.result === 'white_win') {
    this.ratingChange.white = 16;
    this.ratingChange.black = -16;
  } else if (this.result === 'black_win') {
    this.ratingChange.white = -16;
    this.ratingChange.black = 16;
  } else if (this.result === 'draw') {
    this.ratingChange.white = 0;
    this.ratingChange.black = 0;
  }
  
  return this.save();
};
gameSchema.virtual('moveCount').get(function() {
  return this.moves.length;
});
gameSchema.virtual('durationMinutes').get(function() {
  return Math.floor(this.gameDuration / 60);
});
module.exports = mongoose.model('Game', gameSchema);
