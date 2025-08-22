import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('http://localhost:5000/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
      setLoading(false);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  if (!user) {
    return null; // Don't show header for unauthenticated users
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/game" className="logo">
            ♟️ Chess Game
          </Link>
        </div>

        <nav className="header-nav">
          <Link 
            to="/game" 
            className={`nav-link ${isActiveRoute('/game') ? 'active' : ''}`}
          >
            Play Game
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${isActiveRoute('/profile') ? 'active' : ''}`}
          >
            Profile
          </Link>
          <Link 
            to="/stats" 
            className={`nav-link ${isActiveRoute('/stats') ? 'active' : ''}`}
          >
            Statistics
          </Link>
        </nav>

        <div className="header-right">
          <div className="user-info">
            <span className="username">{user.username}</span>
            <span className="rating">Rating: {user.rating}</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="logout-button"
            disabled={loading}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
