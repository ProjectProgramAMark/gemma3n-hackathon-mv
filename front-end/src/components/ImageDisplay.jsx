/**
 * @file imagedisplay.jsx
 * @description this component displays a random set of cards, allows the user to submit a sentence
 * describing them, and handles the interaction with the backend to save the data and update scores.
 */
import React, { useState, useEffect } from 'react';
import '../App.css';
import cards from '../assets/data/mulberry_cards';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUserInfo, setUserInfo, incrementScore } from '../utils/leaderboardUtils';

function ImageDisplay() {
  // state for the currently displayed cards
  const [images, setImages] = useState([]);
  // state for the user's input text
  const [inputText, setInputText] = useState('');
  // state to manage the loading spinner
  const [isLoading, setIsLoading] = useState(false);
  // state for the user's score
  const [userScore, setUserScore] = useState(0);

  // fetch initial cards when the component mounts
  useEffect(() => {
    refreshCards();
  }, []);

  useEffect(() => {
  }, [images]);

  useEffect(() => {
    const savedScore = localStorage.getItem('userScore') || 0;
    setUserScore(parseInt(savedScore));
  }, []);

  /**
   * @description fetches a new random set of cards to display.
   * it also cleans the card titles for display.
   */
  const refreshCards = () => {
    const randomCount = Math.floor(Math.random() * 3) + 2; // random number between 2 and 4
    const shuffled = cards.sort(() => 0.5 - Math.random()); // shuffle the array
    const modifiedCards = shuffled.slice(0, randomCount).map((card) => ({
      ...card,
      cleanTitle: card.title
        .replace(/(.*),_to$/, 'to $1')
        .replace(/^(favorite_|recent_)?(.+?)(_?\d+[a-zA-Z]*)?$/, '$2')
        .replace(/_/g, ' '),
    }));
    setImages(modifiedCards);
  };

  /**
   * @description removes a card from the display when the user clicks the 'x' button.
   * @param {number} index - the index of the card to remove.
   */
  const removeCard = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  /**
   * @description handles the form submission, prevents default form behavior,
   * sends the sentence, and refreshes the cards.
   * @param {object} e - the event object.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    sendSentence(inputText);
    refreshCards();
  };

  /**
   * @description sends the user's sentence and the associated card data to the backend.
   * it also handles updating the user's score and displaying toast notifications.
   * @param {string} text - the sentence submitted by the user.
   */
  const sendSentence = async (text) => {
    setIsLoading(true);
    try {
      var query = images.map((card) => card.cleanTitle); // Use cleanTitle from images
      var responseBody = JSON.stringify({
        query: query,
        response: text,
        username: 'general'
      });
      const response = await fetch(import.meta.env.VITE_NGROK_URL + "/save-website-sentence", {
        mode: "cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: responseBody,
      });
      const data = await response.json();
      
      // After successful submission, update user's score
      const userInfo = getUserInfo();
      try {
        // After successful submission
        const newScore = await incrementScore(userInfo.name);
        setUserInfo(userInfo.name, newScore);
        showToast('Thank you! Your response has been submitted', true);
      } catch (error) {
        showToast('Error updating score', false);
      }
    } catch (error) {
      showToast('Uh oh! There was an error in your response. Please contact me and tell me you had the following error: ' 
      + error, false);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  }

  /**
   * @description displays a toast notification to the user.
   * @param {string} toastmessage - the message to display.
   * @param {boolean} issuccess - determines if the toast is a success or error message.
   */
  const showToast = (toastMessage, isSuccess) => {
    let options = {
      position: "bottom-right",
      autoClose: 500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Bounce,
    }
    toast.success(toastMessage, options) ? isSuccess : toast.error(toastMessage, options);
  }

  return (
    <div>
      <div style={styles.cardContainer}>
        {images.map((card, index) => (
          <div key={card.id} style={styles.card}>
            <img src={card.image} alt={card.title} style={styles.cardImage} />
            <button
              style={styles.closeButton}
              onClick={() => removeCard(index)}
            >
              X
            </button>
            <p style={styles.cardTitle}>{card.cleanTitle}</p>
          </div>
        ))}
      </div>
      <button onClick={refreshCards} style={styles.refreshButton}>Refresh Cards</button>
      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea 
          type="text" 
          rows={4}
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)} 
          style={styles.inputField}
        />
        {
          isLoading ? (
            <div className="spinner">Loading...</div> // Replace with your spinner component or CSS
          ) : (
            <button onClick={handleSubmit} style={styles.submitButton}>Submit</button> // Your existing submit button
            // <button type="submit" style={styles.submitButton}>Submit</button>
            )
          }
      </form>
      <ToastContainer />
    </div>
  );
}

export default ImageDisplay;

const styles = {
  cardContainer: {
    display: 'flex', // use flexbox to layout cards side by side
    justifyContent: 'space-around', // space out the cards evenly
    flexWrap: 'wrap', // allow cards to wrap to next line if there's not enough space
    padding: '10px',
  },
  card: {
    border: '1px solid black', // add a thin black border around the card
    borderRadius: '5px',
    textAlign: 'center',
    margin: '10px',
    backgroundColor: 'white', // set background color of each card
    padding: '10px',
    boxShadow: '0px 2px 5px rgba(0,0,0,0.1)', // optional: add a subtle shadow to each card
    display: 'inline-block', // ensure the background applies only to the content
    position: 'relative', // add position relative to the card
  },
  cardImage: {
    maxWidth: '100px',
    maxHeight: '100px',
  },
  cardTitle: {
    fontSize: '18px',
    color: '#333'
  },
  closeButton: {
    position: 'absolute', // position the close button absolutely
    top: '5px', // adjust the top position
    right: '5px', // adjust the right position
    borderRadius: '50%', // make the button rounded
    width: '20px',
    height: '20px',
    backgroundColor: 'black',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column', // stack the input field and button vertically
    alignItems: 'center', // center the form items
    marginTop: '20px', // add some space between the cards and the form
  },
  inputField: {
    width: '100%', // make input field take full width of its container
    padding: '10px',
    fontSize: '16px',
    marginBottom: '10px', // add some space between the input field and the button
  },
  submitButton: {
    width: '100%', // make button take full width of its container
    padding: '10px 15px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  refreshButton: {
    padding: '10px 15px',
    fontSize: '16px',
    cursor: 'pointer',
    margin: '20px'
  },
};
