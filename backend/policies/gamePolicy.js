const BasePolicy = require('./basePolicy');

/**
 * Game Policy
 * Handles game-related permissions and business rules
 */
class GamePolicy extends BasePolicy {
  constructor() {
    super();
    this.description = 'Policy for game-related operations';
    this.version = '1.0.0';
    this.author = 'Chess Game System';
  }

  /**
   * Check if user can perform action
   * @param {Object} context - Context object
   * @param {string} action - Action being performed
   * @returns {boolean} True if allowed
   */
  async can(context, action) {
    // Validate context
    if (!this.validateContext(context, ['user', 'game'])) {
      return false;
    }

    const { user, game, move, targetGame } = context;

    switch (action) {
      case 'make_move':
        return this.canMakeMove(user, game, move);
      
      case 'resign_game':
        return this.canResignGame(user, game);
      
      case 'offer_draw':
        return this.canOfferDraw(user, game);
      
      case 'accept_draw':
        return this.canAcceptDraw(user, game);
      
      case 'decline_draw':
        return this.canDeclineDraw(user, game);
      
      case 'request_analysis':
        return this.canRequestAnalysis(user, game);
      
      case 'view_game':
        return this.canViewGame(user, game);
      
      case 'join_game':
        return this.canJoinGame(user, game);
      
      case 'spectate_game':
        return this.canSpectateGame(user, game);
      
      case 'create_tournament':
        return this.canCreateTournament(user);
      
      case 'join_tournament':
        return this.canJoinTournament(user, targetGame);
      
      case 'administer_game':
        return this.canAdministerGame(user, game);
      
      default:
        return false;
    }
  }

  /**
   * Check if user can make a move
   * @param {Object} user - Current user
   * @param {Object} game - Current game
   * @param {Object} move - Move being made
   * @returns {boolean} True if allowed
   */
  canMakeMove(user, game, move) {
    // Game must be active
    if (game.status !== 'active') {
      return false;
    }

    // User must be a player in the game
    if (!game.players.includes(user._id)) {
      return false;
    }

    // Must be user's turn
    if (game.currentTurn !== user._id.toString()) {
      return false;
    }

    // Game must not be paused
    if (game.isPaused) {
      return false;
    }

    // Move must be valid (basic validation)
    if (!move || !move.from || !move.to) {
      return false;
    }

    // Check if move is within time limits
    if (game.timeControl && game.timeControl.type === 'blitz') {
      const timeRemaining = this.getTimeRemaining(user, game);
      if (timeRemaining <= 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if user can resign game
   * @param {Object} user - Current user
   * @param {Object} game - Current game
   * @returns {boolean} True if allowed
   */
  canResignGame(user, game) {
    // Game must be active
    if (game.status !== 'active') {
      return false;
    }

    // User must be a player in the game
    if (!game.players.includes(user._id)) {
      return false;
    }

    // Game must have started (not in waiting state)
    if (game.status === 'waiting') {
      return false;
    }

    return true;
  }

  /**
   * Check if user can offer draw
   * @param {Object} user - Current user
   * @param {Object} game - Current game
   * @returns {boolean} True if allowed
   */
  canOfferDraw(user, game) {
    // Game must be active
    if (game.status !== 'active') {
      return false;
    }

    // User must be a player in the game
    if (!game.players.includes(user._id)) {
      return false;
    }

    // Game must have minimum moves for draw offer
    if (game.moveCount < 30) {
      return false;
    }

    // No pending draw offer
    if (game.pendingDrawOffer) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can accept draw
   * @param {Object} user - Current user
   * @param {Object} game - Current game
   * @returns {boolean} True if allowed
   */
  canAcceptDraw(user, game) {
    // Game must be active
    if (game.status !== 'active') {
      return false;
    }

    // User must be a player in the game
    if (!game.players.includes(user._id)) {
      return false;
    }

    // Must be pending draw offer
    if (!game.pendingDrawOffer) {
      return false;
    }

    // Must not be the user who offered the draw
    if (game.pendingDrawOffer.from === user._id.toString()) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can decline draw
   * @param {Object} user - Current user
   * @param {Object} game - Current game
   * @returns {boolean} True if allowed
   */
  canDeclineDraw(user, game) {
    // Game must be active
    if (game.status !== 'active') {
      return false;
    }

    // User must be a player in the game
    if (!game.players.includes(user._id)) {
      return false;
    }

    // Must be pending draw offer
    if (!game.pendingDrawOffer) {
      return false;
    }

    // Must not be the user who offered the draw
    if (game.pendingDrawOffer.from === user._id.toString()) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can request analysis
   * @param {Object} user - Current user
   * @param {Object} game - Current game
   * @returns {boolean} True if allowed
   */
  canRequestAnalysis(user, game) {
    // Game must be finished
    if (game.status !== 'finished') {
      return false;
    }

    // User must be a player in the game
    if (!game.players.includes(user._id)) {
      return false;
    }

    // Check if user has analysis credits
    if (user.analysisCredits <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can view game
   * @param {Object} user - Current user
   * @param {Object} game - Game to view
   * @returns {boolean} True if allowed
   */
  canViewGame(user, game) {
    // User must be a player in the game
    if (game.players.includes(user._id)) {
      return true;
    }

    // Game must allow spectators
    if (game.allowSpectators) {
      return true;
    }

    // Admins can view any game
    if (user.role === 'admin') {
      return true;
    }

    // Game must be public
    if (game.isPublic) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can join game
   * @param {Object} user - Current user
   * @param {Object} game - Game to join
   * @returns {boolean} True if allowed
   */
  canJoinGame(user, game) {
    // Game must be waiting for players
    if (game.status !== 'waiting') {
      return false;
    }

    // User must not already be in the game
    if (game.players.includes(user._id)) {
      return false;
    }

    // Game must not be full
    if (game.players.length >= 2) {
      return false;
    }

    // User must meet game requirements
    if (game.minRating && user.rating < game.minRating) {
      return false;
    }

    if (game.maxRating && user.rating > game.maxRating) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can spectate game
   * @param {Object} user - Current user
   * @param {Object} game - Game to spectate
   * @returns {boolean} True if allowed
   */
  canSpectateGame(user, game) {
    // Game must allow spectators
    if (!game.allowSpectators) {
      return false;
    }

    // User must not be a player
    if (game.players.includes(user._id)) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can create tournament
   * @param {Object} user - Current user
   * @returns {boolean} True if allowed
   */
  canCreateTournament(user) {
    // User must be authenticated
    if (!user) {
      return false;
    }

    // User must have sufficient rating
    if (user.rating < 1000) {
      return false;
    }

    // User must not be banned
    if (user.isBanned) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can join tournament
   * @param {Object} user - Current user
   * @param {Object} tournament - Tournament to join
   * @returns {boolean} True if allowed
   */
  canJoinTournament(user, tournament) {
    // Tournament must be open for registration
    if (tournament.status !== 'registration') {
      return false;
    }

    // User must meet rating requirements
    if (tournament.minRating && user.rating < tournament.minRating) {
      return false;
    }

    if (tournament.maxRating && user.rating > tournament.maxRating) {
      return false;
    }

    // User must not already be registered
    if (tournament.participants.includes(user._id)) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can administer game
   * @param {Object} user - Current user
   * @param {Object} game - Game to administer
   * @returns {boolean} True if allowed
   */
  canAdministerGame(user, game) {
    // User must be admin
    if (user.role === 'admin') {
      return true;
    }

    // User must be tournament organizer
    if (game.tournament && game.tournament.organizer === user._id) {
      return true;
    }

    return false;
  }

  /**
   * Get remaining time for user in game
   * @param {Object} user - Current user
   * @param {Object} game - Current game
   * @returns {number} Time remaining in seconds
   */
  getTimeRemaining(user, game) {
    if (!game.timeControl || !game.playerTimers) {
      return Infinity;
    }

    const playerTimer = game.playerTimers.find(timer => 
      timer.playerId.toString() === user._id.toString()
    );

    return playerTimer ? playerTimer.timeRemaining : 0;
  }
}

module.exports = GamePolicy;
