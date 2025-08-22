import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setEditData({
        username: userData.username,
        email: userData.email
      });
    }
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData({
      username: user.username,
      email: user.email
    });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/auth/profile', editData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        setEditMode(false);
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Profile</h1>
          <p>Manage your account information</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-section">
          <h3>Account Information</h3>
          
          <div className="profile-field">
            <label>Username</label>
            {editMode ? (
              <input
                type="text"
                name="username"
                value={editData.username}
                onChange={handleChange}
                placeholder="Enter username"
                minLength={3}
                maxLength={20}
              />
            ) : (
              <span className="profile-value">{user.username}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Email</label>
            {editMode ? (
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            ) : (
              <span className="profile-value">{user.email}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Rating</label>
            <span className="profile-value rating">{user.rating}</span>
          </div>

          <div className="profile-field">
            <label>Member Since</label>
            <span className="profile-value">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="profile-section">
          <h3>Game Statistics</h3>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{user.gamesPlayed}</span>
              <span className="stat-label">Games Played</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{user.gamesWon}</span>
              <span className="stat-label">Wins</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{user.gamesDrawn}</span>
              <span className="stat-label">Draws</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{user.gamesLost}</span>
              <span className="stat-label">Losses</span>
            </div>
          </div>

          <div className="win-rate">
            <span className="win-rate-label">Win Rate:</span>
            <span className="win-rate-value">{user.winRate || 0}%</span>
          </div>
        </div>

        <div className="profile-actions">
          {editMode ? (
            <>
              <button 
                onClick={handleSave} 
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={handleCancel} className="cancel-button">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={handleEdit} className="edit-button">
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
