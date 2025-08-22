# Chess Game Backend - Scalable Architecture

A modern, scalable, and maintainable backend for the Chess Game application built with Node.js, Express, and MongoDB.

## 🏗️ Architecture Overview

### **Layered Architecture**
```
┌─────────────────────────────────────┐
│           Routes Layer              │  ← API endpoints and request handling
├─────────────────────────────────────┤
│         Controllers Layer           │  ← Request/response logic
├─────────────────────────────────────┤
│          Services Layer             │  ← Business logic
├─────────────────────────────────────┤
│          Models Layer               │  ← Data models and database operations
├─────────────────────────────────────┤
│        Database Layer               │  ← MongoDB connection and queries
└─────────────────────────────────────┘
```

### **Key Features**
- ✅ **Separation of Concerns** - Clean separation between layers
- ✅ **Service-Oriented Architecture** - Business logic in dedicated services
- ✅ **Middleware Pattern** - Reusable middleware components
- ✅ **Error Handling** - Centralized error handling and logging
- ✅ **Validation** - Input validation and sanitization
- ✅ **Rate Limiting** - API protection against abuse
- ✅ **Performance Monitoring** - Response time and memory monitoring
- ✅ **Logging** - Structured logging with Winston
- ✅ **Security** - JWT authentication, CORS, Helmet

## 📁 Project Structure

```
backend/
├── config/                 # Configuration files
│   ├── constants.js       # Application constants
│   └── database.js        # Database configuration
├── middleware/            # Express middleware
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Error handling middleware
│   ├── rateLimiter.js    # Rate limiting middleware
│   └── performance.js    # Performance monitoring
├── models/                # Mongoose models
│   ├── User.js           # User model
│   └── Game.js           # Game model
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   └── routes.js         # Game routes
├── services/              # Business logic services
│   └── authService.js    # Authentication service
├── sockets/               # Socket.IO handlers
│   ├── socketHandler.js  # Socket connection handler
│   └── socketController.js # Game logic controller
├── utils/                 # Utility functions
│   ├── responseHandler.js # API response utilities
│   ├── validation.js     # Input validation
│   ├── jwt.js            # JWT utilities
│   └── logger.js         # Logging utilities
├── logs/                  # Log files (auto-generated)
├── server.js              # Main server file
├── package.json           # Dependencies
└── .env                   # Environment variables
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chess-game
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Start Production Server
```bash
npm start
```

## 🔧 Development Scripts

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run tests
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🏛️ Architecture Components

### **1. Constants (`config/constants.js`)**
Centralized configuration for:
- JWT settings
- User validation rules
- HTTP status codes
- Error messages
- Success messages

### **2. Response Handler (`utils/responseHandler.js`)**
Standardized API responses:
- Success responses
- Error responses
- Validation errors
- HTTP status codes

### **3. Validation (`utils/validation.js`)**
Input validation for:
- User registration
- User login
- Profile updates
- Password changes
- Input sanitization

### **4. JWT Service (`utils/jwt.js`)**
Token management:
- Access token generation
- Refresh token generation
- Token verification
- Token expiration checking

### **5. Auth Service (`services/authService.js`)**
Business logic for:
- User registration
- User authentication
- Profile management
- Password management
- Token refresh

### **6. Error Handling (`middleware/errorHandler.js`)**
Centralized error handling:
- Mongoose errors
- JWT errors
- Custom errors
- Development vs production

### **7. Rate Limiting (`middleware/rateLimiter.js`)**
API protection:
- General rate limiting
- Authentication rate limiting
- Game-specific rate limiting
- Dynamic limits based on user status

### **8. Performance Monitoring (`middleware/performance.js`)**
Performance tracking:
- Response time monitoring
- Database query performance
- Memory usage monitoring
- Request size limiting

### **9. Logging (`utils/logger.js`)**
Structured logging:
- Console and file logging
- Error logging
- Performance metrics
- Request/response logging

## 🔐 Authentication Flow

### **Registration**
1. Validate input data
2. Check for existing users
3. Hash password
4. Create user
5. Generate JWT tokens
6. Return user data and tokens

### **Login**
1. Validate credentials
2. Verify password
3. Generate new JWT tokens
4. Update user status
5. Return user data and tokens

### **Token Refresh**
1. Verify refresh token
2. Generate new token pair
3. Return new tokens

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt password encryption
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - Sanitization and validation
- **CORS Protection** - Cross-origin request control
- **Helmet Security** - Security headers
- **Request Size Limiting** - Protection against large payload attacks

## 📊 Performance Features

- **Response Time Monitoring** - Track API performance
- **Database Query Monitoring** - Monitor database performance
- **Memory Usage Tracking** - Monitor application memory
- **Compression** - Response compression for better performance
- **Caching Headers** - Appropriate cache control
- **Async Operations** - Non-blocking I/O operations

## 🧪 Testing

### **Unit Tests**
```bash
npm test
```

### **API Testing**
Use the provided Postman collection:
- `postman_collection.json` - Complete API collection
- `postman_environment.json` - Environment variables

### **Manual Testing**
```bash
# Test API endpoints
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'
```

## 📝 Logging

### **Log Levels**
- `error` - Error messages
- `warn` - Warning messages
- `info` - General information
- `debug` - Debug information

### **Log Files**
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled rejections

## 🔄 API Response Format

### **Success Response**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## 🚨 Error Handling

### **Validation Errors**
- Input validation failures
- Business rule violations
- Duplicate data conflicts

### **Authentication Errors**
- Invalid tokens
- Expired tokens
- Insufficient permissions

### **System Errors**
- Database connection issues
- External service failures
- Internal server errors

## 📈 Scalability Features

### **Horizontal Scaling**
- Stateless authentication
- Database connection pooling
- Load balancer ready

### **Performance Optimization**
- Async/await operations
- Database indexing
- Response compression
- Caching strategies

### **Monitoring & Alerting**
- Performance metrics
- Error tracking
- Resource monitoring
- Health checks

## 🔧 Configuration

### **Environment Variables**
```env
NODE_ENV=development|production|test
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chess-game
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info|warn|error|debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Database Configuration**
- Connection pooling
- Replica set support
- SSL/TLS encryption
- Authentication

## 🚀 Deployment

### **Production Checklist**
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB production URI
- [ ] Set strong JWT secret
- [ ] Configure CORS origins
- [ ] Set up logging
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] SSL/TLS certificates
- [ ] Load balancer configuration

### **Docker Support**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

### **Code Style**
- Use ESLint configuration
- Follow JSDoc comments
- Maintain consistent naming
- Write unit tests

### **Pull Request Process**
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Update documentation
6. Submit PR

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Winston Logging](https://github.com/winstonjs/winston)

## 🆘 Support

For issues and questions:
1. Check the logs in `logs/` directory
2. Review error messages
3. Check environment variables
4. Verify database connection
5. Check rate limiting settings

## 🎉 Success Metrics

- **Response Time**: < 200ms average
- **Error Rate**: < 1% of requests
- **Uptime**: > 99.9%
- **Memory Usage**: < 512MB
- **Database Queries**: < 100ms average
