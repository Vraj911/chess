# Chess Game Backend with JWT Authentication

A complete chess game backend with real-time multiplayer support, JWT authentication, and MongoDB integration.

## Features

- 🔐 **JWT Authentication**: Secure user registration, login, and session management
- ♟️ **Chess Game Engine**: Full chess rules with move validation
- 🌐 **Real-time Multiplayer**: Socket.IO for live game updates
- 📊 **User Statistics**: Track wins, losses, ratings, and game history
- 🗄️ **MongoDB Integration**: Persistent data storage for users and games
- 🔒 **Secure Routes**: Protected endpoints with middleware
- 📈 **Game Analysis**: Position evaluation and move suggestions

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   ```

4. **Configure your .env file:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/chess_game
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

6. **Start the server:**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout (requires auth)
- `GET /profile` - Get user profile (requires auth)
- `PUT /profile` - Update user profile (requires auth)
- `PUT /change-password` - Change password (requires auth)
- `GET /stats` - Get user statistics (requires auth)
- `POST /refresh` - Refresh JWT token (requires auth)

### Game Routes (`/api/game`)

- `GET /status` - Get current game status
- `GET /board` - Get current board state
- `GET /history` - Get move history
- `GET /moves/:square` - Get valid moves for a square
- `POST /new` - Start a new game
- `POST /resign` - Resign current game
- `GET /pgn` - Get game in PGN format
- `POST /load` - Load game from FEN string
- `GET /stats` - Get game statistics
- `GET /analysis` - Get game analysis

### Health Check

- `GET /health` - Server health status

## Authentication

### JWT Token Format
```
Authorization: Bearer <your_jwt_token>
```

### Token Expiration
- Default: 7 days
- Configurable via `JWT_EXPIRES_IN` environment variable

### Protected Routes
All game modification routes require authentication. Spectator routes are public.

## Database Models

### User Model
- Username, email, password
- Rating system (1200 default)
- Game statistics (wins, losses, draws)
- Online status tracking

### Game Model
- Player information (white/black)
- Move history with timestamps
- Game results and status
- PGN and FEN support

## Socket.IO Events

### Client to Server
- `move` - Make a chess move
- `resign` - Resign the game
- `newGame` - Request new game
- `getValidMoves` - Get legal moves for a square
- `getGameStatus` - Get current game status
- `getMoveHistory` - Get move history

### Server to Client
- `playerRole` - Assign player color
- `spectatorRole` - Assign spectator role
- `boardState` - Update board state
- `gameStatus` - Update game status
- `move` - Broadcast move to all players
- `check` - Notify check situation
- `checkmate` - Notify checkmate
- `gameOver` - Game end notification

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Verification**: Secure token validation
- **Input Validation**: Request data sanitization
- **CORS Protection**: Configurable origin restrictions
- **Rate Limiting**: Built-in protection (can be enhanced)

## Development

### File Structure
```
backend/
├── config/          # Database configuration
├── controller/      # Business logic controllers
├── middleware/      # Authentication middleware
├── models/          # Database models
├── routes/          # API route definitions
├── service/         # Chess game service
├── sockets/         # Socket.IO handlers
├── .env             # Environment variables
├── server.js        # Main server file
└── package.json     # Dependencies
```

### Adding New Features
1. Create models in `models/` directory
2. Add routes in `routes/` directory
3. Implement business logic in `controller/` directory
4. Update socket handlers if needed
5. Add tests (recommended)

## Testing

### Manual Testing
1. Start the server
2. Use Postman or similar tool to test API endpoints
3. Test authentication flow:
   - Register a new user
   - Login with credentials
   - Use token for protected routes
   - Test logout

### API Testing Examples

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","email":"player1@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"player1@example.com","password":"password123"}'
```

**Protected Route:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production MongoDB URI
- Set appropriate CORS origins

### Security Considerations
- Use HTTPS in production
- Implement rate limiting
- Add request logging
- Monitor database connections
- Regular security updates

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string in .env
   - Check network connectivity

2. **JWT Token Invalid**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper Authorization header format

3. **CORS Errors**
   - Verify CORS_ORIGIN in .env
   - Check frontend origin matches

4. **Socket Connection Issues**
   - Verify Socket.IO CORS settings
   - Check authentication token format
   - Ensure proper event handling

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review error logs in console
3. Verify environment configuration
4. Test with minimal setup

## License

This project is licensed under the ISC License.
