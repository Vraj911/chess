import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/UserSettings.css';

const UserSettings = () => {
  const [userStats, setUserStats] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUserStats(response.data.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/auth/change-password', 
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleRefreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        setSuccess('Token refreshed successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to refresh token');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>User Settings</h2>
        <p>Manage your account settings and security</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-grid">
        {/* User Statistics Section */}
        <div className="settings-section">
          <h3>Account Statistics</h3>
          {userStats && (
            <div className="stats-content">
              <div className="stat-item">
                <span className="label">Rating:</span>
                <span className="value rating">{userStats.rating}</span>
              </div>
              <div className="stat-item">
                <span className="label">Games Played:</span>
                <span className="value">{userStats.gamesPlayed}</span>
              </div>
              <div className="stat-item">
                <span className="label">Wins:</span>
                <span className="value wins">{userStats.gamesWon}</span>
              </div>
              <div className="stat-item">
                <span className="label">Draws:</span>
                <span className="value draws">{userStats.gamesDrawn}</span>
              </div>
              <div className="stat-item">
                <span className="label">Losses:</span>
                <span className="value losses">{userStats.gamesLost}</span>
              </div>
              <div className="stat-item">
                <span className="label">Win Rate:</span>
                <span className="value win-rate">{userStats.winRate}%</span>
              </div>
              <div className="stat-item">
                <span className="label">Total Score:</span>
                <span className="value score">{userStats.totalScore}</span>
              </div>
            </div>
          )}
          <button onClick={fetchUserStats} className="refresh-stats-button">
            🔄 Refresh Stats
          </button>
        </div>

        {/* Password Change Section */}
        <div className="settings-section">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="input-group">
              <label htmlFor="current-password">Current Password:</label>
              <input
                type="password"
                id="current-password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
                required
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="new-password">New Password:</label>
              <input
                type="password"
                id="new-password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirm-password">Confirm New Password:</label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className="change-password-button"
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
                <div className="settings-section">
          <h3>Security & Tokens</h3>
          <div className="security-content">
            <p>Manage your account security and authentication tokens.</p>
            
            <div className="security-actions">
              <button onClick={handleRefreshToken} className="refresh-token-button">
                🔄 Refresh Token
              </button>
              
              <div className="security-info">
                <h4>Security Tips:</h4>
                <ul className="security-tips">
                  <li>Use a strong, unique password</li>
                  <li>Never share your credentials</li>
                  <li>Log out from shared devices</li>
                  <li>Keep your token secure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
