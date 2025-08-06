/**
 * @file leaderboard.jsx
 * @description this component displays the leaderboard, fetches data from the api,
 * and allows users to submit their score.
 * @note this component contains hardcoded authentication credentials, which is a security risk.
 * in a production environment, these should be handled securely, for example, using environment variables.
 */
import React, { useState, useEffect } from 'react';
import '../styles/Leaderboard.css';

const API_BASE_URL = import.meta.env.VITE_NGROK_URL;
// warning: hardcoded credentials are a security risk.
const AUTH_HEADER = 'Basic ' + btoa('user:password123');

/**
 * @description a component that displays the leaderboard, fetches data from the api,
 * and allows users to submit their score.
 * @param {object} props - the component props.
 * @param {number} props.score - the user's current score.
 * @param {function} props.onclose - function to close the leaderboard.
 * @param {boolean} props.isvisible - whether the leaderboard is visible.
 */
const Leaderboard = ({ score, onClose, isVisible }) => {
  // state for the player's name input
  const [playerName, setPlayerName] = useState('');
  // state for the leaderboard data
  const [leaderboardData, setLeaderboardData] = useState([]);
  // state to track if the score has been submitted
  const [submitted, setSubmitted] = useState(false);
  // state for loading indicator
  const [loading, setLoading] = useState(true);
  // state for error messages
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isVisible) {
      fetchLeaderboard();
      // fetch leaderboard every 30 seconds
      const interval = setInterval(fetchLeaderboard, 30000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  /**
   * @description fetches the leaderboard data from the api.
   */
  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    const url = `${API_BASE_URL}/leaderboard`;

    try {
      const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
      
      const response = await fetch(cleanUrl, {
        method: 'GET',
        headers: {
          'Authorization': AUTH_HEADER,
          'Accept': 'application/json'
        }
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`http error! status: ${response.status}`);
      }
      
      const data = JSON.parse(responseText);
      setLeaderboardData(data.leaderboard || []);
    } catch (error) {
      console.error('error fetching leaderboard:', error);
      setError(`failed to load leaderboard: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description submits the player's score to the api.
   */
  const handleSubmit = async () => {
    if (!playerName.trim()) return;

    const url = `${API_BASE_URL}/score/${encodeURIComponent(playerName)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_HEADER
        }
      });
      
      if (!response.ok) {
        throw new Error(`http error! status: ${response.status}`);
      }
      
      setSubmitted(true);
      fetchLeaderboard();
    } catch (error) {
      console.error('error submitting score:', error);
      setError(`failed to submit score: ${error.message}`);
    }
  };

  return (
    <div className={`leaderboard-sidebar ${isVisible ? 'visible' : ''}`}>
      <div className="leaderboard-content">
        <div className="leaderboard-header">
          <h2>Top Contributors</h2>
          <button className="minimize-button" onClick={onClose}>×</button>
        </div>
        
        {/* score submission form */}
        {!submitted && score > 0 && (
          <div className="submit-score">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
            />
            <button onClick={handleSubmit}>Submit Score</button>
          </div>
        )}

        {/* leaderboard list */}
        <div className="leaderboard-list">
          {loading ? (
            <div className="leaderboard-message">Loading...</div>
          ) : error ? (
            <div className="leaderboard-message error">{error}</div>
          ) : leaderboardData.length === 0 ? (
            <div className="leaderboard-message">No scores yet!</div>
          ) : (
            leaderboardData.map((entry, index) => (
              <div key={index} className="leaderboard-entry">
                <span className="rank">#{index + 1}</span>
                <span className="name">{entry.name}</span>
                <span className="score">{entry.score}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;