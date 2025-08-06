import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import PrivacyPolicy from './components/PrivacyPolicy';
import Leaderboard from './components/Leaderboard';

function App() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  const updateScore = (newScore) => {
    setCurrentScore(newScore);
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home onScoreUpdate={updateScore} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </div>

      <button 
        className="leaderboard-button"
        onClick={() => setShowLeaderboard(!showLeaderboard)}
      >
        {showLeaderboard ? 'Hide Leaderboard' : 'View Leaderboard'}
      </button>

      <Leaderboard
        score={currentScore}
        onClose={() => setShowLeaderboard(false)}
        isVisible={showLeaderboard}
      />
    </Router>
  );
}

export default App;
