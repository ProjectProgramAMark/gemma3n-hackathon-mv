/**
 * @file leaderboardutils.js
 * @description this file contains utility functions for managing the leaderboard and user information
 * using local storage and api calls.
 */
const LEADERBOARD_KEY = 'mosaic_leaderboard';
const USER_INFO_KEY = 'mosaic_user_info';

/**
 * @description gets the user's information from local storage.
 * @returns {object} the user's information, including name and score.
 */
export const getUserInfo = () => {
  return JSON.parse(localStorage.getItem(USER_INFO_KEY)) || { name: '', score: 0 };
};

/**
 * @description sets the user's information in local storage.
 * @param {string} name - the user's name.
 * @param {number} score - the user's score.
 */
export const setUserInfo = (name, score) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify({ name, score }));
};

/**
 * @description fetches the leaderboard data from the api.
 * @returns {promise<array>} a promise that resolves to an array of leaderboard entries.
 */
export const getLeaderboard = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_NGROK_URL}/leaderboard`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Received non-JSON response from server");
    }
    const data = await response.json();
    return data.leaderboard || [];
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
};

/**
 * @description updates the leaderboard with the user's score by making a post request to the api.
 * @param {string} name - the user's name.
 * @param {number} score - the user's score.
 * @returns {promise<void>}
 */
export const updateLeaderboard = async (name, score) => {
  try {
    await fetch(import.meta.env.VITE_NGROK_URL + "/leaderboard", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, score }),
    });
  } catch (error) {
    console.error('Failed to update leaderboard:', error);
  }
};

/**
 * @description fetches the user's score from the api.
 * @param {string} username - the user's name.
 * @returns {promise<number>} a promise that resolves to the user's score.
 */
export const getUserScore = async (username) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_NGROK_URL}/score/${username}`);
    const data = await response.json();
    return data.score;
  } catch (error) {
    console.error('Failed to fetch user score:', error);
    return 0;
  }
};

/**
 * @description increments the user's score by making a post request to the api.
 * @param {string} username - the user's name.
 * @returns {promise<number>} a promise that resolves to the user's new score.
 */
export const incrementScore = async (username) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_NGROK_URL}/score/${username}`, {
      method: 'POST'
    });
    const data = await response.json();
    return data.score;
  } catch (error) {
    console.error('Failed to increment score:', error);
    throw error;
  }
};