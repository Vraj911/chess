# Chess Game API - Postman Testing Guide

This guide provides comprehensive instructions for testing all authentication and user management APIs using Postman.

## 🚀 Quick Start

1. **Import the Collection**: Import `postman_collection.json` into Postman
2. **Import the Environment**: Import `postman_environment.json` into Postman
3. **Select Environment**: Choose "Chess Game API Environment" from the environment dropdown
4. **Start Backend**: Ensure your backend server is running on `http://localhost:5000`

## 📋 API Endpoints Overview

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### User Profile Endpoints
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/stats` - Get user statistics

## 🧪 Testing Workflow

### Step 1: Setup Test Data
1. **Create Test User 1**: Use "Create Test User 1" request
   - Username: `player1`
   - Email: `player1@chess.com`
   - Password: `chess123`

2. **Create Test User 2**: Use "Create Test User 2" request
   - Username: `player2`
   - Email: `player2@chess.com`
   - Password: `chess123`

### Step 2: Test Authentication Flow
1. **User Registration**: Test with "User Registration" request
   - Expected: 201 Created
   - Token automatically saved to environment variables

2. **User Login**: Test with "User Login" request
   - Expected: 200 OK
   - Token automatically saved to environment variables

3. **Get Profile**: Test with "Get User Profile" request
   - Expected: 200 OK
   - Should return user data

4. **Update Profile**: Test with "Update User Profile" request
   - Expected: 200 OK
   - Profile should be updated

5. **Change Password**: Test with "Change Password" request
   - Expected: 200 OK
   - Password should be changed

6. **Get Statistics**: Test with "Get User Statistics" request
   - Expected: 200 OK
   - Should return user game statistics

7. **Refresh Token**: Test with "Refresh Token" request
   - Expected: 200 OK
   - New token should be generated

8. **User Logout**: Test with "User Logout" request
   - Expected: 200 OK
   - User should be logged out

## 🔐 Authentication Details

### JWT Token Format
- **Type**: Bearer Token
- **Expiration**: 7 days
- **Header**: `Authorization: Bearer <token>`

### Automatic Token Management
The collection automatically:
- Saves tokens from registration/login responses
- Uses saved tokens for authenticated requests
- Refreshes tokens when needed

## 📊 Expected Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## 🧪 Test Cases

### Registration Test Cases
1. **Valid Registration**
   - Input: Valid username, email, password
   - Expected: 201 Created, token returned

2. **Duplicate Email**
   - Input: Email already exists
   - Expected: 400 Bad Request, "Email already registered"

3. **Duplicate Username**
   - Input: Username already exists
   - Expected: 400 Bad Request, "Username already taken"

4. **Missing Fields**
   - Input: Missing required fields
   - Expected: 400 Bad Request, "All fields are required"

### Login Test Cases
1. **Valid Login**
   - Input: Valid email and password
   - Expected: 200 OK, token returned

2. **Invalid Email**
   - Input: Non-existent email
   - Expected: 401 Unauthorized, "Invalid credentials"

3. **Invalid Password**
   - Input: Wrong password
   - Expected: 401 Unauthorized, "Invalid credentials"

4. **Missing Fields**
   - Input: Missing email or password
   - Expected: 400 Bad Request, "Email and password are required"

### Profile Test Cases
1. **Get Profile (Authenticated)**
   - Input: Valid JWT token
   - Expected: 200 OK, user profile data

2. **Get Profile (Unauthenticated)**
   - Input: No token or invalid token
   - Expected: 401 Unauthorized

3. **Update Profile (Valid)**
   - Input: Valid update data
   - Expected: 200 OK, updated profile

4. **Update Profile (Duplicate Username)**
   - Input: Username already taken
   - Expected: 400 Bad Request, "Username already taken"

### Password Change Test Cases
1. **Valid Password Change**
   - Input: Correct current password, valid new password
   - Expected: 200 OK, "Password changed successfully"

2. **Incorrect Current Password**
   - Input: Wrong current password
   - Expected: 401 Unauthorized, "Current password is incorrect"

3. **Missing Fields**
   - Input: Missing current or new password
   - Expected: 400 Bad Request, "Current password and new password are required"

## 🔍 Environment Variables

### Available Variables
- `base_url`: API base URL (http://localhost:5000)
- `auth_token`: JWT authentication token
- `user_id`: Current user ID
- `test_username`: Test username
- `test_email`: Test email
- `test_password`: Test password

### Variable Usage
- Use `{{base_url}}` in URLs
- Use `{{auth_token}}` in Authorization headers
- Use `{{user_id}}` for user-specific requests

## 🚨 Common Issues & Solutions

### 1. Token Not Saved
- Check if registration/login response has `success: true`
- Verify response contains `data.token`
- Check browser console for any JavaScript errors

### 2. 401 Unauthorized
- Verify token is valid and not expired
- Check if token is properly set in environment
- Ensure Authorization header format is correct

### 3. 500 Internal Server Error
- Check backend server logs
- Verify MongoDB connection
- Check if all required environment variables are set

### 4. CORS Issues
- Ensure backend CORS is properly configured
- Check if frontend origin is allowed
- Verify preflight requests are handled

## 📝 Testing Checklist

- [ ] Backend server running on port 5000
- [ ] MongoDB connection established
- [ ] Environment variables loaded
- [ ] Collection imported
- [ ] Environment selected
- [ ] Test users created
- [ ] Authentication flow tested
- [ ] Profile operations tested
- [ ] Password change tested
- [ ] Statistics endpoint tested
- [ ] Token refresh tested
- [ ] Logout tested
- [ ] Error cases tested

## 🔧 Advanced Testing

### Pre-request Scripts
Some requests include pre-request scripts that:
- Set required headers
- Generate dynamic data
- Validate environment variables

### Test Scripts
Some requests include test scripts that:
- Validate response format
- Save tokens automatically
- Check response status codes
- Log important information

### Collection Runner
Use Postman's Collection Runner to:
- Run all tests sequentially
- Generate test reports
- Automate testing workflow
- Set up test environments

## 📚 Additional Resources

- [Postman Documentation](https://learning.postman.com/)
- [JWT Token Testing](https://jwt.io/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [REST API Best Practices](https://restfulapi.net/)

## 🆘 Support

If you encounter issues:
1. Check backend server logs
2. Verify MongoDB connection
3. Check environment variables
4. Review request/response data
5. Check Postman console for errors
