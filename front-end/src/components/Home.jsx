/**
 * @file home.jsx
 * @description this component renders the home page of the application.
 * it displays an introduction and instructions for the user,
 * and it contains the imagedisplay and leaderboard components.
 */
import '../App.css';
import ImageDisplay from './ImageDisplay.jsx';
import Leaderboard from './Leaderboard';

function Home() {
  return (
    <div className="Home">
      {/* page header */}
      <h1>Mosaic AAC Data Generation Portal</h1>
      {/* instructions for the user */}
      <p>
        There will be 2 - 5 random cards displayed here. If they make sense together, please create a
        sentence that you think someone might want to convey if they select these cards. The goal is to
        eventually create a voice for those who are otherwise non-verbal, and as such you should approach
        this task from the perspective of someone using these cards to communicate.

        If the cards do not make sense, please feel free to refresh the webapp to generate new cards.

        Thank you so much for your help! Every submission is greatly appreciated.
      </p>
      {/* component to display images for user input */}
      <ImageDisplay />
      {/* component to display the leaderboard */}
      <Leaderboard />
    </div>
  );
}

export default Home