import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Landing.css';

const Landing = () => {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-header">
          <h1 className="landing-title">
            ♟️ Welcome to Chess Game
          </h1>
          <p className="landing-subtitle">
            Experience the ultimate online chess platform with real-time multiplayer, 
            intelligent analysis, and a vibrant community of players.
          </p>
        </div>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Real-time Multiplayer</h3>
            <p>Play chess with players from around the world in real-time</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Smart Analysis</h3>
            <p>Get intelligent move suggestions and position analysis</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Statistics & Ratings</h3>
            <p>Track your progress with detailed statistics and ELO ratings</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your games and data are protected with enterprise security</p>
          </div>
        </div>

        <div className="landing-actions">
          <Link to="/login" className="action-button login-btn">
            Sign In
          </Link>
          <Link to="/register" className="action-button register-btn">
            Create Account
          </Link>
        </div>

        <div className="landing-footer">
          <p>Ready to challenge your mind? Join thousands of players today!</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
