// socket/socketController.js
const { Chess } = require('chess.js');
const policyManager = require('../policies/policyManager');
const { logger } = require('../utils/logger');
const Game = require('../models/Game');
const User = require('../models/User');

class SocketController {
  constructor() {
    this.games = new Map();
    this.users = new Map();
    this.waitingPlayers = [];
  }

  /**
   * Handle user connection
   * @param {Object} socket - Socket instance
   * @param {Object} user - User object
   */
  async handleConnection(socket, user) {
    try {
      // Store user connection
      this.users.set(socket.id, {
        userId: user._id,
        username: user.username,
        rating: user.rating,
        socketId: socket.id
      });

      // Update user online status
      await User.findByIdAndUpdate(user._id, {
        isOnline: true,
        lastSeen: new Date()
      });

      // Check if user can create/join games
      const canCreateGame = await policyManager.can('user', 'create_game', { user });
      if (canCreateGame) {
        socket.emit('canCreateGame', true);
      }

      logger.info('User connected', {
        userId: user._id,
        username: user.username,
        socketId: socket.id
      });

      // Emit user info
      socket.emit('userInfo', {
        userId: user._id,
        username: user.username,
        rating: user.rating
      });

    } catch (error) {
      logger.error('Connection handling error', {
        userId: user?._id,
        error: error.message
      });
      socket.emit('error', { message: 'Connection failed' });
    }
  }

  /**
   * Handle user disconnection
   * @param {Object} socket - Socket instance
   */
  async handleDisconnection(socket) {
    try {
      const userInfo = this.users.get(socket.id);
      if (!userInfo) return;

      // Update user online status
      await User.findByIdAndUpdate(userInfo.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Remove from waiting players
      this.waitingPlayers = this.waitingPlayers.filter(p => p.socketId !== socket.id);

      // Handle active games
      for (const [gameId, game] of this.games) {
        if (game.players.some(p => p.socketId === socket.id)) {
          await this.handlePlayerDisconnection(gameId, socket.id);
        }
      }

      // Clean up
      this.users.delete(socket.id);

      logger.info('User disconnected', {
        userId: userInfo.userId,
        username: userInfo.username,
        socketId: socket.id
      });

    } catch (error) {
      logger.error('Disconnection handling error', {
        socketId: socket.id,
        error: error.message
      });
    }
  }

  /**
   * Handle new game request
   * @param {Object} socket - Socket instance
   * @param {Object} data - Game data
   */
  async handleNewGame(socket, data) {
    try {
      const userInfo = this.users.get(socket.id);
      if (!userInfo) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      // Check if user can create game
      const canCreate = await policyManager.can('user', 'create_game', { user: userInfo });
      if (!canCreate) {
        socket.emit('error', { message: 'Cannot create game' });
        return;
      }

      // Create new game
      const game = new Chess();
      const gameId = this.generateGameId();
      
      const gameData = {
        id: gameId,
        fen: game.fen(),
        status: 'waiting',
        players: [{
          userId: userInfo.userId,
          username: userInfo.username,
          rating: userInfo.rating,
          socketId: socket.id,
          color: 'white'
        }],
        spectators: [],
        moveCount: 0,
        createdAt: new Date(),
        timeControl: data.timeControl || null,
        allowSpectators: data.allowSpectators !== false
      };

      this.games.set(gameId, gameData);
      
      // Add to waiting players
      this.waitingPlayers.push({
        userId: userInfo.userId,
        username: userInfo.username,
        rating: userInfo.rating,
        socketId: socket.id,
        gameId
      });

      // Join game room
      socket.join(gameId);
      
      // Emit game created
      socket.emit('gameCreated', {
        gameId,
        game: gameData
      });

      logger.info('New game created', {
        gameId,
        creator: userInfo.userId,
        timeControl: data.timeControl
      });

    } catch (error) {
      logger.error('New game error', {
        socketId: socket.id,
        error: error.message
      });
      socket.emit('error', { message: 'Failed to create game' });
    }
  }

  /**
   * Handle join game request
   * @param {Object} socket - Socket instance
   * @param {Object} data - Join data
   */
  async handleJoinGame(socket, data) {
    try {
      const userInfo = this.users.get(socket.id);
      if (!userInfo) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      const game = this.games.get(data.gameId);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Check if user can join game
      const canJoin = await policyManager.can('game', 'join_game', { 
        user: userInfo, 
        game 
      });
      
      if (!canJoin) {
        socket.emit('error', { message: 'Cannot join this game' });
        return;
      }

      // Add player to game
      game.players.push({
        userId: userInfo.userId,
        username: userInfo.username,
        rating: userInfo.rating,
        socketId: socket.id,
        color: 'black'
      });

      game.status = 'active';
      game.currentTurn = 'white';

      // Remove from waiting players
      this.waitingPlayers = this.waitingPlayers.filter(p => p.gameId !== data.gameId);

      // Join game room
      socket.join(data.gameId);

      // Notify all players
      socket.to(data.gameId).emit('playerJoined', {
        player: {
          userId: userInfo.userId,
          username: userInfo.username,
          rating: userInfo.rating,
          color: 'black'
        }
      });

      // Emit game started
      socket.emit('gameStarted', { game });
      socket.to(data.gameId).emit('gameStarted', { game });

      logger.info('Player joined game', {
        gameId: data.gameId,
        playerId: userInfo.userId,
        username: userInfo.username
      });

    } catch (error) {
      logger.error('Join game error', {
        socketId: socket.id,
        gameId: data.gameId,
        error: error.message
      });
      socket.emit('error', { message: 'Failed to join game' });
    }
  }

  /**
   * Handle move request
   * @param {Object} socket - Socket instance
   * @param {Object} data - Move data
   */
  async handleMove(socket, data) {
    try {
      const userInfo = this.users.get(socket.id);
      if (!userInfo) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      const game = this.games.get(data.gameId);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Check if user can make move
      const canMove = await policyManager.can('game', 'make_move', { 
        user: userInfo, 
        game, 
        move: data 
      });
      
      if (!canMove) {
        socket.emit('error', { message: 'Cannot make this move' });
        return;
      }

      // Execute move
      const chess = new Chess(game.fen);
      const move = chess.move(data);
      
      if (!move) {
        socket.emit('error', { message: 'Invalid move' });
        return;
      }

      // Update game state
      game.fen = chess.fen();
      game.moveCount++;
      game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';
      game.lastMove = move;

      // Check game status
      if (chess.isCheckmate()) {
        game.status = 'finished';
        game.winner = game.currentTurn === 'white' ? 'black' : 'white';
        game.result = 'checkmate';
      } else if (chess.isDraw()) {
        game.status = 'finished';
        game.result = 'draw';
        game.drawReason = chess.isStalemate() ? 'stalemate' : 'draw';
      } else if (chess.isCheck()) {
        game.isCheck = true;
      }

      // Emit move to all players
      socket.to(data.gameId).emit('moveMade', {
        move: data,
        fen: game.fen,
        gameStatus: game.status,
        isCheck: game.isCheck,
        currentTurn: game.currentTurn
      });

      // Emit move confirmation
      socket.emit('moveConfirmed', {
        move: data,
        fen: game.fen,
        gameStatus: game.status
      });

      logger.info('Move made', {
        gameId: data.gameId,
        playerId: userInfo.userId,
        move: data,
        gameStatus: game.status
      });

    } catch (error) {
      logger.error('Move error', {
        socketId: socket.id,
        gameId: data.gameId,
        error: error.message
      });
      socket.emit('error', { message: 'Failed to make move' });
    }
  }

  /**
   * Handle resign request
   * @param {Object} socket - Socket instance
   * @param {Object} data - Resign data
   */
  async handleResign(socket, data) {
    try {
      const userInfo = this.users.get(socket.id);
      if (!userInfo) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      const game = this.games.get(data.gameId);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Check if user can resign
      const canResign = await policyManager.can('game', 'resign_game', { 
        user: userInfo, 
        game 
      });
      
      if (!canResign) {
        socket.emit('error', { message: 'Cannot resign at this time' });
        return;
      }

      // Update game status
      game.status = 'finished';
      game.resignedBy = userInfo.userId;
      game.winner = game.players.find(p => p.userId !== userInfo.userId)?.color;
      game.result = 'resignation';

      // Notify all players
      socket.to(data.gameId).emit('gameResigned', {
        resignedBy: userInfo.userId,
        winner: game.winner
      });

      // Emit resignation confirmation
      socket.emit('resignationConfirmed', {
        gameId: data.gameId,
        resignedBy: userInfo.userId
      });

      logger.info('Game resigned', {
        gameId: data.gameId,
        resignedBy: userInfo.userId,
        winner: game.winner
      });

    } catch (error) {
      logger.error('Resign error', {
        socketId: socket.id,
        gameId: data.gameId,
        error: error.message
      });
      socket.emit('error', { message: 'Failed to resign game' });
    }
  }

  /**
   * Handle player disconnection from active game
   * @param {string} gameId - Game ID
   * @param {string} socketId - Socket ID
   */
  async handlePlayerDisconnection(gameId, socketId) {
    try {
      const game = this.games.get(gameId);
      if (!game || game.status !== 'active') return;

      const player = game.players.find(p => p.socketId === socketId);
      if (!player) return;

      // Update game status
      game.status = 'finished';
      game.disconnectedBy = player.userId;
      game.winner = game.players.find(p => p.socketId !== socketId)?.color;
      game.result = 'disconnection';

      // Notify remaining players
      const remainingPlayers = game.players.filter(p => p.socketId !== socketId);
      for (const player of remainingPlayers) {
        // Emit to specific player if they're still connected
        const playerSocket = this.getSocketById(player.socketId);
        if (playerSocket) {
          playerSocket.emit('playerDisconnected', {
            gameId,
            disconnectedPlayer: player.userId,
            winner: game.winner
          });
        }
      }

      logger.info('Player disconnected from game', {
        gameId,
        playerId: player.userId,
        gameStatus: game.status
      });

    } catch (error) {
      logger.error('Player disconnection handling error', {
        gameId,
        socketId,
        error: error.message
      });
    }
  }

  /**
   * Get waiting games
   * @param {Object} socket - Socket instance
   */
  handleGetWaitingGames(socket) {
    try {
      const waitingGames = Array.from(this.games.values())
        .filter(game => game.status === 'waiting')
        .map(game => ({
          id: game.id,
          creator: game.players[0].username,
          rating: game.players[0].rating,
          timeControl: game.timeControl,
          allowSpectators: game.allowSpectators,
          createdAt: game.createdAt
        }));

      socket.emit('waitingGames', waitingGames);

    } catch (error) {
      logger.error('Get waiting games error', {
        socketId: socket.id,
        error: error.message
      });
      socket.emit('error', { message: 'Failed to get waiting games' });
    }
  }

  /**
   * Generate unique game ID
   * @returns {string} Game ID
   */
  generateGameId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get socket by ID (placeholder - would need socket.io instance)
   * @param {string} socketId - Socket ID
   * @returns {Object|null} Socket instance
   */
  getSocketById(socketId) {
    // This would need access to the socket.io instance
    // For now, return null as placeholder
    return null;
  }

  /**
   * Get game statistics
   * @returns {Object} Game statistics
   */
  getStats() {
    return {
      totalGames: this.games.size,
      activeGames: Array.from(this.games.values()).filter(g => g.status === 'active').length,
      waitingGames: Array.from(this.games.values()).filter(g => g.status === 'waiting').length,
      totalUsers: this.users.size,
      waitingPlayers: this.waitingPlayers.length
    };
  }
}

module.exports = SocketController;
