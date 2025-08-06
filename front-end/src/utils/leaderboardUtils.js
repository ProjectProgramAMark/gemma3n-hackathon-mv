const LEADERBOARD_KEY = 'mosaic_leaderboard';
const USER_INFO_KEY = 'mosaic_user_info';

export const getUserInfo = () => {
  return JSON.parse(localStorage.getItem(USER_INFO_KEY)) || { name: '', score: 0 };
};

export const setUserInfo = (name, score) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify({ name, score }));
};

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