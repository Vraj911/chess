import React, { useState } from 'react';
import axios from 'axios';
import '../css/GameTools.css';

const GameTools = () => {
  const [fenInput, setFenInput] = useState('');
  const [moveInput, setMoveInput] = useState({ from: '', to: '' });
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoadGame = async () => {
    if (!fenInput.trim()) {
      setError('Please enter a FEN string');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/game/load', 
        { fen: fenInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Game loaded successfully!');
        setFenInput('');
        // You could emit a socket event here to update the game board
        window.location.reload(); // Simple refresh for now
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateMove = async () => {
    if (!moveInput.from || !moveInput.to) {
      setError('Please enter both from and to squares');
      return;
    }

    setLoading(true);
    setError('');
    setValidationResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/game/validate-move', 
        { move: moveInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setValidationResult(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to validate move');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFenInput('');
    setMoveInput({ from: '', to: '' });
    setValidationResult(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="tools-container">
      <div className="tools-header">
        <h2>Game Tools</h2>
        <p>Advanced chess tools and utilities</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="tools-grid">
        {/* Game Loading Section */}
        <div className="tool-section">
          <h3>Load Game from FEN</h3>
          <div className="tool-content">
            <div className="input-group">
              <label htmlFor="fen-input">FEN String:</label>
              <input
                type="text"
                id="fen-input"
                value={fenInput}
                onChange={(e) => setFenInput(e.target.value)}
                placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                className="fen-input"
              />
            </div>
            <div className="button-group">
              <button 
                onClick={handleLoadGame} 
                className="tool-button load-button"
                disabled={loading || !fenInput.trim()}
              >
                {loading ? 'Loading...' : 'Load Game'}
              </button>
              <button 
                onClick={() => setFenInput('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')}
                className="tool-button sample-button"
              >
                Load Sample
              </button>
            </div>
          </div>
        </div>

        {/* Move Validation Section */}
        <div className="tool-section">
          <h3>Move Validation</h3>
          <div className="tool-content">
            <div className="move-inputs">
              <div className="input-group">
                <label htmlFor="from-square">From Square:</label>
                <input
                  type="text"
                  id="from-square"
                  value={moveInput.from}
                  onChange={(e) => setMoveInput({ ...moveInput, from: e.target.value })}
                  placeholder="e2"
                  className="square-input"
                  maxLength={2}
                />
              </div>
              <div className="input-group">
                <label htmlFor="to-square">To Square:</label>
                <input
                  type="text"
                  id="to-square"
                  value={moveInput.to}
                  onChange={(e) => setMoveInput({ ...moveInput, to: e.target.value })}
                  placeholder="e4"
                  className="square-input"
                  maxLength={2}
                />
              </div>
            </div>
            <button 
              onClick={handleValidateMove} 
              className="tool-button validate-button"
              disabled={loading || !moveInput.from || !moveInput.to}
            >
              {loading ? 'Validating...' : 'Validate Move'}
            </button>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className="validation-result">
              <h4>Validation Result:</h4>
              <div className="result-content">
                <div className="result-item">
                  <span className="label">Valid:</span>
                  <span className={`value ${validationResult.isValid ? 'valid' : 'invalid'}`}>
                    {validationResult.isValid ? 'Yes' : 'No'}
                  </span>
                </div>
                {validationResult.reason && (
                  <div className="result-item">
                    <span className="label">Reason:</span>
                    <span className="value">{validationResult.reason}</span>
                  </div>
                )}
                {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                  <div className="result-item">
                    <span className="label">Suggestions:</span>
                    <span className="value">{validationResult.suggestions.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Game History Section */}
        <div className="tool-section">
          <h3>Game Information</h3>
          <div className="tool-content">
            <p>Use these tools to:</p>
            <ul className="tools-list">
              <li>Load games from FEN notation</li>
              <li>Validate moves before making them</li>
              <li>Check game state and rules</li>
              <li>Analyze positions</li>
            </ul>
            <button onClick={handleReset} className="tool-button reset-button">
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTools;
