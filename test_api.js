const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
let authToken = '';
let userId = '';

// Test data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

const updatedUser = {
  username: 'updateduser',
  email: 'updated@example.com',
  profilePicture: 'https://example.com/avatar.jpg'
};

// Helper function to make authenticated requests
const makeAuthRequest = (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test functions
const testRegistration = async () => {
  console.log('\n🧪 Testing User Registration...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    if (response.data.success) {
      authToken = response.data.data.token;
      userId = response.data.data.user._id;
      console.log('✅ Registration successful');
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
      console.log(`   User ID: ${userId}`);
    }
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data?.error || error.message);
  }
};

const testLogin = async () => {
  console.log('\n🧪 Testing User Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    if (response.data.success) {
      authToken = response.data.data.token;
      userId = response.data.data.user._id;
      console.log('✅ Login successful');
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
    }
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.error || error.message);
  }
};

const testGetProfile = async () => {
  console.log('\n🧪 Testing Get Profile...');
  try {
    const response = await makeAuthRequest('GET', '/api/auth/profile');
    if (response.data.success) {
      console.log('✅ Get profile successful');
      console.log(`   Username: ${response.data.data.user.username}`);
      console.log(`   Email: ${response.data.data.user.email}`);
    }
  } catch (error) {
    console.log('❌ Get profile failed:', error.response?.data?.error || error.message);
  }
};

const testUpdateProfile = async () => {
  console.log('\n🧪 Testing Update Profile...');
  try {
    const response = await makeAuthRequest('PUT', '/api/auth/profile', updatedUser);
    if (response.data.success) {
      console.log('✅ Update profile successful');
      console.log(`   Updated username: ${response.data.data.user.username}`);
      console.log(`   Updated email: ${response.data.data.user.email}`);
    }
  } catch (error) {
    console.log('❌ Update profile failed:', error.response?.data?.error || error.message);
  }
};

const testChangePassword = async () => {
  console.log('\n🧪 Testing Change Password...');
  try {
    const response = await makeAuthRequest('PUT', '/api/auth/change-password', {
      currentPassword: testUser.password,
      newPassword: 'newpassword123'
    });
    if (response.data.success) {
      console.log('✅ Password change successful');
      // Update the stored password for future tests
      testUser.password = 'newpassword123';
    }
  } catch (error) {
    console.log('❌ Password change failed:', error.response?.data?.error || error.message);
  }
};

const testGetStats = async () => {
  console.log('\n🧪 Testing Get Statistics...');
  try {
    const response = await makeAuthRequest('GET', '/api/auth/stats');
    if (response.data.success) {
      console.log('✅ Get stats successful');
      const stats = response.data.data.stats;
      console.log(`   Rating: ${stats.rating}`);
      console.log(`   Games Played: ${stats.gamesPlayed}`);
      console.log(`   Win Rate: ${stats.winRate}%`);
    }
  } catch (error) {
    console.log('❌ Get stats failed:', error.response?.data?.error || error.message);
  }
};

const testRefreshToken = async () => {
  console.log('\n🧪 Testing Refresh Token...');
  try {
    const response = await makeAuthRequest('POST', '/api/auth/refresh');
    if (response.data.success) {
      const newToken = response.data.data.token;
      console.log('✅ Token refresh successful');
      console.log(`   New token: ${newToken.substring(0, 20)}...`);
      authToken = newToken;
    }
  } catch (error) {
    console.log('❌ Token refresh failed:', error.response?.data?.error || error.message);
  }
};

const testLogout = async () => {
  console.log('\n🧪 Testing Logout...');
  try {
    const response = await makeAuthRequest('POST', '/api/auth/logout');
    if (response.data.success) {
      console.log('✅ Logout successful');
      authToken = '';
      userId = '';
    }
  } catch (error) {
    console.log('❌ Logout failed:', error.response?.data?.error || error.message);
  }
};

const testErrorCases = async () => {
  console.log('\n🧪 Testing Error Cases...');
  
  // Test invalid token
  try {
    await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { 'Authorization': 'Bearer invalid_token' }
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Invalid token properly rejected');
    }
  }
  
  // Test duplicate registration
  try {
    await axios.post(`${BASE_URL}/api/auth/register`, testUser);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Duplicate registration properly rejected');
    }
  }
  
  // Test invalid login
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: 'wrongpassword'
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Invalid login properly rejected');
    }
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Chess Game API Tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  try {
    // Run all tests
    await testRegistration();
    await testLogin();
    await testGetProfile();
    await testUpdateProfile();
    await testChangePassword();
    await testGetStats();
    await testRefreshToken();
    await testLogout();
    await testErrorCases();
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testRegistration,
  testLogin,
  testGetProfile,
  testUpdateProfile,
  testChangePassword,
  testGetStats,
  testRefreshToken,
  testLogout,
  testErrorCases,
  runTests
};
