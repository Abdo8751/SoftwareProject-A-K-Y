import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1', // Updated to match backend routes
  withCredentials: true, // if you're using cookies for auth
});

export default api;
