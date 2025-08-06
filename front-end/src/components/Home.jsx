import { useState } from 'react'
import '../App.css'
import ImageDisplay from './ImageDisplay.jsx';
import Leaderboard from './Leaderboard';

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="Home">
      <h1>Mosaic AAC Data Generation Portal</h1>
      <p>
        There will be 2 - 5 random cards displayed here. If they make sense together, please create a
        sentence that you think someone might want to convey if they select these cards. The goal is to
        eventually create a voice for those who are otherwise non-verbal, and as such you should approach
        this task from the perspective of someone using these cards to communicate.

        If the cards do not make sense, please feel free to refresh the webapp to generate new cards.

        Thank you so much for your help! Every submission is greatly appreciated.
      </p>
      <ImageDisplay />
      <Leaderboard />
    </div>
  )
}

export default Home