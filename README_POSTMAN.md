# Chess Game API - Postman Testing

This directory contains all the necessary files for testing the Chess Game authentication and user management APIs using Postman.

## 📁 Files Included

- **`postman_collection.json`** - Complete Postman collection with all API endpoints
- **`postman_environment.json`** - Postman environment with variables
- **`POSTMAN_TESTING_GUIDE.md`** - Comprehensive testing guide
- **`test_api.js`** - Node.js script for testing APIs without Postman
- **`README_POSTMAN.md`** - This file

## 🚀 Quick Start with Postman

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select `postman_collection.json`
4. The collection will be imported with all endpoints

### 2. Import Environment
1. In Postman, click "Import" again
2. Select `postman_environment.json`
3. The environment will be imported with variables

### 3. Select Environment
1. In the top-right corner, select "Chess Game API Environment"
2. This will enable all environment variables

### 4. Start Testing
1. Ensure your backend server is running on `http://localhost:5000`
2. Start with "User Registration" request
3. Follow the testing workflow in the guide

## 🔧 Alternative: Node.js Testing

If you prefer not to use Postman, you can use the included Node.js test script:

```bash
# Install dependencies
npm install axios

# Run tests
node test_api.js
```

## 📋 API Endpoints Tested

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### User Management
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/stats` - Get user statistics

## 🎯 Testing Workflow

1. **Setup**: Create test users
2. **Authentication**: Test registration, login, logout
3. **Profile**: Test profile operations
4. **Security**: Test password changes and token refresh
5. **Error Handling**: Test invalid inputs and edge cases

## 🔐 Authentication Flow

1. **Register** → Get JWT token
2. **Login** → Get JWT token  
3. **Use token** → Access protected endpoints
4. **Refresh** → Get new token when needed
5. **Logout** → Invalidate session

## 📊 Expected Responses

All successful responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details"
}
```

## 🚨 Common Issues

### Token Not Working
- Check if token is saved in environment variables
- Verify token format: `Bearer <token>`
- Check if token has expired

### CORS Errors
- Ensure backend CORS is configured
- Check if frontend origin is allowed

### 500 Server Errors
- Check backend server logs
- Verify MongoDB connection
- Check environment variables

## 📚 Additional Resources

- [Postman Learning Center](https://learning.postman.com/)
- [JWT Token Testing](https://jwt.io/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

## 🆘 Need Help?

1. Check the comprehensive guide: `POSTMAN_TESTING_GUIDE.md`
2. Review backend server logs
3. Verify all environment variables are set
4. Check MongoDB connection status
5. Ensure backend server is running on port 5000

## 🎉 Success Criteria

All tests should pass with:
- ✅ Registration: 201 Created
- ✅ Login: 200 OK  
- ✅ Profile operations: 200 OK
- ✅ Password change: 200 OK
- ✅ Statistics: 200 OK
- ✅ Token refresh: 200 OK
- ✅ Logout: 200 OK
- ✅ Error cases: Proper error responses
