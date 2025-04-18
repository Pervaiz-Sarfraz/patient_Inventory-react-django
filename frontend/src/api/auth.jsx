import axios from 'axios';

export const registerUser = async (username, password) => {
  return axios.post('http://127.0.0.1:8001/register/', { username, password });
};