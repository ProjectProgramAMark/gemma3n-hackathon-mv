import React, { useState, useEffect } from 'react';
import '../styles/Leaderboard.css';

const API_BASE_URL = import.meta.env.VITE_NGROK_URL;
const AUTH_HEADER = 'Basic ' + btoa('user:password123');
console.log('Leaderboard Component Initialized');
console.log('API Base URL:', API_BASE_URL);
console.log('Auth Header:', AUTH_HEADER);

const Leaderboard = ({ score, onClose, isVisible }) => {
  const [playerName, setPlayerName] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Leaderboard mounted, isVisible:', isVisible);
    if (isVisible) {
      fetchLeaderboard();
      // Fetch leaderboard every 30 seconds
      const interval = setInterval(fetchLeaderboard, 30000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    const url = `${API_BASE_URL}/leaderboard`;
    console.log('Fetching leaderboard...');
    console.log('Full URL:', url);

    try {
      const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
      console.log('Clean URL:', cleanUrl);
      console.log('Making fetch request with headers:', {
        'Authorization': AUTH_HEADER
      });
      
      const response = await fetch(cleanUrl, {
        method: 'GET',
        headers: {
          'Authorization': AUTH_HEADER,
          'Accept': 'application/json'
        }
      });
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!response.ok) {
        console.log('Error response text:', responseText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = JSON.parse(responseText);
      console.log('Leaderboard data:', data);
      setLeaderboardData(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError(`Failed to load leaderboard: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!playerName.trim()) return;

    const url = `${API_BASE_URL}/score/${encodeURIComponent(playerName)}`;
    console.log('Submitting score to:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_HEADER
        }
      });
      
      console.log('Submit response status:', response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.log('Error response text:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setSubmitted(true);
      fetchLeaderboard();
    } catch (error) {
      console.error('Error submitting score:', error);
      setError(`Failed to submit score: ${error.message}`);
    }
  };

  return (
    <div className={`leaderboard-sidebar ${isVisible ? 'visible' : ''}`}>
      <div className="leaderboard-content">
        <div className="leaderboard-header">
          <h2>Top Contributors</h2>
          <button className="minimize-button" onClick={onClose}>×</button>
        </div>
        
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