import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import ChessBoard from './components/ChessBoard';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route 
            path="/game" 
            element={
              <ProtectedRoute>
                <div>
                  <Header />
                  <div className="board-container">
                    <div className="game-header">
                      <h1 className="game-title">Chess Game</h1>
                      <p className="game-subtitle">Play chess online with real-time multiplayer</p>
                    </div>
                    <div className="chess-wrapper">
                      <ChessBoard />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <div>
                  <Header />
                  <Profile />
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
