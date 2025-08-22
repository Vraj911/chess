import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/GameAnalysis.css';

const GameAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [stats, setStats] = useState(null);
  const [pgn, setPgn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all game data in parallel
      const [analysisRes, statsRes, pgnRes] = await Promise.all([
        axios.get('http://localhost:5000/api/game/analysis', { headers }),
        axios.get('http://localhost:5000/api/game/stats', { headers }),
        axios.get('http://localhost:5000/api/game/pgn', { headers })
      ]);

      setAnalysis(analysisRes.data);
      setStats(statsRes.data);
      setPgn(pgnRes.data.data.pgn);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch game data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchGameData();
  };

  if (loading) {
    return (
      <div className="analysis-container">
        <div className="loading-spinner">Loading analysis...</div>
      </div>
    );
  }

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <h2>Game Analysis</h2>
        <button onClick={handleRefresh} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="analysis-grid">
        {/* Game Analysis Section */}
        <div className="analysis-section">
          <h3>Position Analysis</h3>
          {analysis && (
            <div className="analysis-content">
              <div className="analysis-item">
                <span className="label">Game Phase:</span>
                <span className="value">{analysis.data?.gamePhase || 'Unknown'}</span>
              </div>
              <div className="analysis-item">
                <span className="label">Material Advantage:</span>
                <span className="value">{analysis.data?.materialCount || '0'}</span>
              </div>
              <div className="analysis-item">
                <span className="label">Position Evaluation:</span>
                <span className="value">{analysis.data?.positionEvaluation || 'Neutral'}</span>
              </div>
              <div className="analysis-item">
                <span className="label">Threats:</span>
                <span className="value">{analysis.data?.threats || 'None detected'}</span>
              </div>
              <div className="analysis-item">
                <span className="label">Opportunities:</span>
                <span className="value">{analysis.data?.opportunities || 'None detected'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Game Statistics Section */}
        <div className="analysis-section">
          <h3>Game Statistics</h3>
          {stats && (
            <div className="analysis-content">
              <div className="analysis-item">
                <span className="label">Total Moves:</span>
                <span className="value">{stats.data?.moveCount || '0'}</span>
              </div>
              <div className="analysis-item">
                <span className="label">Game Duration:</span>
                <span className="value">{stats.data?.duration || '0'}s</span>
              </div>
              <div className="analysis-item">
                <span className="label">Current Status:</span>
                <span className="value">{stats.data?.status || 'Unknown'}</span>
              </div>
              <div className="analysis-item">
                <span className="label">Current Turn:</span>
                <span className="value">{stats.data?.turn === 'w' ? 'White' : 'Black'}</span>
              </div>
              <div className="analysis-item">
                <span className="label">Check Status:</span>
                <span className="value">{stats.data?.isCheck ? 'Check!' : 'No Check'}</span>
              </div>
            </div>
          )}
        </div>

        {/* PGN Section */}
        <div className="analysis-section pgn-section">
          <h3>Game PGN</h3>
          <div className="pgn-content">
            <textarea
              value={pgn}
              readOnly
              placeholder="Game moves will appear here..."
              className="pgn-textarea"
            />
            <button 
              onClick={() => navigator.clipboard.writeText(pgn)}
              className="copy-button"
            >
              📋 Copy PGN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameAnalysis;
