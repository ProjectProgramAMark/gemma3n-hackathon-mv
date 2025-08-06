/**
 * @file app.jsx
 * @description this is the main application component. it handles routing and manages the state for the leaderboard.
 */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import PrivacyPolicy from './components/PrivacyPolicy';
import Leaderboard from './components/Leaderboard';

function App() {
  // state to manage the visibility of the leaderboard
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  // state to manage the current score
  const [currentScore, setCurrentScore] = useState(0);

  /**
   * @description updates the score.
   * @param {number} newscore - the new score.
   */
  const updateScore = (newScore) => {
    setCurrentScore(newScore);
  };

  return (
    <Router>
      {/* main application content */}
      <div>
        <Routes>
          <Route path="/" element={<Home onScoreUpdate={updateScore} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </div>

      {/* button to toggle the leaderboard visibility */}
      <button
        className="leaderboard-button"
        onClick={() => setShowLeaderboard(!showLeaderboard)}
      >
        {showLeaderboard ? 'Hide Leaderboard' : 'View Leaderboard'}
      </button>

      {/* leaderboard component */}
      <Leaderboard
        score={currentScore}
        onClose={() => setShowLeaderboard(false)}
        isVisible={showLeaderboard}
      />
    </Router>
  );
}

export default App;
