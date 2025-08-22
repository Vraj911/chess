# Chess Game Backend with JWT Authentication

A scalable, clean, and production-ready backend for a Chess Game application built with Node.js, Express, MongoDB, and Socket.IO. Features comprehensive JWT authentication, real-time multiplayer gameplay, and a robust policy-based authorization system.

## 🏗️ Architecture Overview

### **Layered Architecture**
- **Routes Layer**: API endpoint definitions and request handling
- **Controller Layer**: Business logic coordination and response formatting
- **Service Layer**: Core business operations and data processing
- **Model Layer**: Data structure definitions and database interactions
- **Policy Layer**: Authorization rules and business logic enforcement
- **Middleware Layer**: Cross-cutting concerns (auth, validation, logging, etc.)
- **Utility Layer**: Reusable helper functions and utilities

### **Key Features**
- **Policy Pattern**: Centralized authorization and business rule enforcement
- **Service-Oriented Architecture**: Business logic encapsulated in dedicated services
- **Middleware Pattern**: Reusable components for cross-cutting concerns
- **Centralized Error Handling**: Global error middleware with specific error types
- **Input Validation & Sanitization**: Dedicated utility for data integrity
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Rate Limiting**: API protection against abuse and DDoS attacks
- **Structured Logging**: Comprehensive logging with Winston
- **Performance Monitoring**: Response time tracking and optimization
- **Real-time Communication**: Socket.IO integration for multiplayer gameplay

## 📁 Project Structure

```
backend/
├── config/                 # Configuration files
│   ├── constants.js       # Application constants
│   └── database.js        # Database connection
├── middleware/            # Express middleware
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Global error handling
│   ├── policyMiddleware.js # Policy-based authorization
│   ├── rateLimiter.js    # Rate limiting
│   └── performance.js    # Performance monitoring
├── models/                # Mongoose models
│   ├── User.js           # User schema and model
│   └── Game.js           # Game schema and model
├── policies/              # Policy Pattern implementation
│   ├── basePolicy.js     # Base policy class
│   ├── userPolicy.js     # User-related policies
│   ├── gamePolicy.js     # Game-related policies
│   └── policyManager.js  # Policy coordination
├── routes/                # API route definitions
│   ├── auth.js           # Authentication routes
│   └── routes.js         # Game routes
├── services/              # Business logic services
│   └── authService.js    # Authentication service
├── sockets/               # Socket.IO handlers
│   ├── socketHandler.js  # Socket connection management
│   └── socketController.js # Game logic controller
├── utils/                 # Utility functions
│   ├── responseHandler.js # Standardized API responses
│   ├── validation.js     # Input validation
│   ├── jwt.js            # JWT operations
│   └── logger.js         # Logging configuration
├── logs/                  # Log files
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- MongoDB >= 5.0
- npm >= 8.0.0

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd chess-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

### Environment Setup
Create a `.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chess-game
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
LOG_LEVEL=info
```

### Start Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## 🔐 Policy Pattern Architecture

### **Overview**
The Policy Pattern provides a centralized, maintainable way to enforce business rules and authorization logic. It separates concerns by moving complex permission checks out of route handlers and into dedicated policy classes.

### **Core Components**

#### **BasePolicy Class**
- Abstract base class that all policies extend
- Provides common validation and utility methods
- Ensures consistent behavior across all policies

#### **UserPolicy**
- Handles user-related permissions (profile access, editing, etc.)
- Manages user account operations and privacy settings
- Controls access to user statistics and game history

#### **GamePolicy**
- Manages game-related permissions (moves, resigning, etc.)
- Controls game access, joining, and spectating
- Handles tournament and analysis permissions

#### **PolicyManager**
- Coordinates all policies and provides unified interface
- Manages policy lifecycle and metadata
- Supports multiple permission checks and custom policies

### **Usage Examples**

#### **Route-Level Authorization**
```javascript
const PolicyMiddleware = require('../middleware/policyMiddleware');

// Simple permission check
router.put('/profile', 
  authenticateToken, 
  PolicyMiddleware.canEditProfile(), 
  updateProfile
);

// Permission with custom context
router.get('/user/:userId', 
  authenticateToken, 
  PolicyMiddleware.canViewProfile(async (req) => {
    const targetUser = await User.findById(req.params.userId);
    return { targetUser };
  }), 
  getUserProfile
);

// Game permission check
router.post('/game/:gameId/move', 
  authenticateToken, 
  PolicyMiddleware.canMakeMove(async (req) => {
    const game = await Game.findById(req.params.gameId);
    return { game, move: req.body };
  }), 
  makeMove
);
```

#### **Service-Level Policy Checks**
```javascript
const policyManager = require('../policies/policyManager');

class GameService {
  async makeMove(userId, gameId, moveData) {
    const user = await User.findById(userId);
    const game = await Game.findById(gameId);
    
    // Check permission using policy
    const canMove = await policyManager.can('game', 'make_move', {
      user,
      game,
      move: moveData
    });
    
    if (!canMove) {
      throw new Error('Cannot make this move');
    }
    
    // Execute move logic...
  }
}
```

#### **Socket.IO Policy Integration**
```javascript
const policyManager = require('../policies/policyManager');

class SocketController {
  async handleMove(socket, data) {
    const user = await User.findById(socket.userId);
    const game = this.games.get(data.gameId);
    
    // Check move permission
    const canMove = await policyManager.can('game', 'make_move', {
      user,
      game,
      move: data
    });
    
    if (!canMove) {
      socket.emit('error', { message: 'Cannot make this move' });
      return;
    }
    
    // Execute move...
  }
}
```

### **Policy Context Objects**
Policies receive context objects containing relevant information:

```javascript
// User policy context
{
  user: currentUser,           // User making the request
  targetUser: targetUser,      // User being acted upon
  resource: additionalData     // Additional context
}

// Game policy context
{
  user: currentUser,           // User making the request
  game: gameInstance,          // Game being acted upon
  move: moveData,              // Move being made
  targetGame: tournament       // Additional game context
}
```

### **Benefits of Policy Pattern**
1. **Separation of Concerns**: Authorization logic separated from business logic
2. **Reusability**: Policies can be used across routes, services, and sockets
3. **Maintainability**: Business rules centralized in one place
4. **Testability**: Policies can be unit tested independently
5. **Flexibility**: Easy to modify rules without changing route handlers
6. **Consistency**: Uniform permission checking across the application
7. **Scalability**: New policies can be added without affecting existing code

## 🔒 Authentication Flow

### **Registration**
1. User submits registration data
2. System validates input and checks for existing users
3. Password is hashed using bcrypt
4. User account is created with default rating
5. JWT access and refresh tokens are generated
6. User is automatically logged in

### **Login**
1. User submits credentials
2. System validates email and password
3. JWT tokens are generated
4. User online status is updated
5. Tokens are returned to client

### **Token Management**
- **Access Token**: Short-lived (7 days) for API requests
- **Refresh Token**: Long-lived (30 days) for token renewal
- **Automatic Refresh**: Client can refresh tokens before expiration
- **Secure Storage**: Tokens stored in HTTP-only cookies or secure storage

### **Protected Routes**
All game and user routes require valid JWT tokens:
```javascript
// Authentication middleware
const { authenticateToken } = require('../middleware/auth');

// Protected route
router.get('/profile', authenticateToken, getUserProfile);
```

## 🎮 Game Features

### **Real-time Multiplayer**
- **Socket.IO Integration**: Real-time communication for live gameplay
- **Game Rooms**: Players join specific game sessions
- **Live Updates**: Board state, moves, and game status updates
- **Spectator Mode**: Watch games without participating

### **Game Logic**
- **chess.js Library**: Professional-grade chess engine
- **Move Validation**: Server-side move verification
- **Game State Management**: FEN notation, PGN export
- **Game History**: Complete move history and analysis

### **Game Controls**
- **Move Execution**: Validated chess moves
- **Game Resignation**: Player surrender functionality
- **Draw Offers**: Draw request and response system
- **Game Analysis**: Post-game analysis and statistics

## 🛡️ Security Features

### **JWT Security**
- **Secret Key**: Environment variable-based secret
- **Token Expiration**: Configurable token lifetimes
- **Refresh Mechanism**: Secure token renewal
- **Blacklisting**: Logout token invalidation

### **Input Validation**
- **Data Sanitization**: XSS and injection prevention
- **Schema Validation**: Mongoose model validation
- **Custom Validators**: Business rule enforcement
- **Error Handling**: Graceful validation failures

### **Rate Limiting**
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Game Operations**: 50 requests per 15 minutes
- **Dynamic Limits**: Adjusts based on user status

### **CORS & Headers**
- **CORS Configuration**: Configurable origin settings
- **Security Headers**: Helmet.js security middleware
- **Content Security**: XSS protection headers
- **HTTPS Enforcement**: Production security requirements

## 📊 Performance Features

### **Monitoring**
- **Response Time Tracking**: API performance measurement
- **Database Query Monitoring**: Query performance analysis
- **Memory Usage Tracking**: Resource utilization monitoring
- **Request Size Limiting**: Payload size restrictions

### **Optimization**
- **Response Compression**: Gzip compression middleware
- **Cache Control**: HTTP caching headers
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: MongoDB connection management

### **Scalability**
- **Horizontal Scaling**: Stateless application design
- **Load Balancing**: Multiple instance support
- **Database Sharding**: MongoDB sharding capabilities
- **Microservice Ready**: Modular architecture design

## 🧪 Testing

### **Unit Testing**
```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "User Policy"

# Coverage report
npm run test:coverage
```

### **API Testing**
```bash
# Run API tests
npm run test:api

# Test specific endpoint
npm run test:api -- --grep "POST /auth/login"
```

### **Manual Testing**
- **Postman Collection**: Complete API test suite
- **Environment Variables**: Test data configuration
- **Test Scripts**: Automated response validation
- **Error Scenarios**: Edge case testing

## 📝 Logging

### **Log Levels**
- **Error**: Application errors and exceptions
- **Warn**: Warning conditions and issues
- **Info**: General information and events
- **Debug**: Detailed debugging information

### **Log Files**
- **error.log**: Error-level messages only
- **combined.log**: All log levels
- **exceptions.log**: Uncaught exceptions
- **rejections.log**: Unhandled promise rejections

### **Structured Logging**
```javascript
logger.info('User action performed', {
  userId: user._id,
  action: 'profile_update',
  timestamp: new Date().toISOString(),
  metadata: { field: 'username' }
});
```

## 🚀 Deployment

### **Production Checklist**
- [ ] Environment variables configured
- [ ] Database connection secured
- [ ] SSL/TLS certificates installed
- [ ] Rate limiting enabled
- [ ] Logging configured for production
- [ ] Error handling optimized
- [ ] Performance monitoring active
- [ ] Security headers enabled

### **Docker Support**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### **Environment Variables**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://production-db:27017/chess-game
JWT_SECRET=production-secret-key
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=warn
RATE_LIMIT_ENABLED=true
```

## 🤝 Contributing

### **Development Guidelines**
1. **Code Style**: Follow ESLint configuration
2. **Testing**: Write tests for new features
3. **Documentation**: Update README for API changes
4. **Policy Updates**: Modify policies for new rules
5. **Error Handling**: Use standardized error responses

### **Policy Development**
1. **Extend BasePolicy**: Create new policy classes
2. **Define Actions**: Specify permission actions
3. **Context Validation**: Validate required context fields
4. **Business Logic**: Implement permission rules
5. **Testing**: Test policy behavior thoroughly

## 📚 Additional Resources

- **Express.js**: https://expressjs.com/
- **MongoDB**: https://docs.mongodb.com/
- **Socket.IO**: https://socket.io/docs/
- **JWT**: https://jwt.io/introduction
- **Policy Pattern**: https://en.wikipedia.org/wiki/Policy_pattern

## 🆘 Support

### **Common Issues**
- **Token Expiration**: Check JWT token validity
- **Database Connection**: Verify MongoDB connection string
- **Policy Errors**: Check policy context and permissions
- **Rate Limiting**: Monitor API usage limits

### **Debugging**
- **Logs**: Check application logs for errors
- **Policy Manager**: Verify policy configuration
- **Middleware Chain**: Check middleware execution order
- **Context Objects**: Validate policy context data

## 📈 Success Metrics

### **Performance Indicators**
- **Response Time**: < 200ms for API requests
- **Uptime**: > 99.9% availability
- **Error Rate**: < 0.1% error rate
- **Throughput**: Handle 1000+ concurrent users

### **Security Metrics**
- **Authentication Success**: > 99% success rate
- **Policy Enforcement**: 100% route protection
- **Rate Limit Effectiveness**: Block 100% of abuse attempts
- **Token Security**: 0% unauthorized access

---

**Built with ❤️ using Node.js, Express, MongoDB, and Socket.IO**
