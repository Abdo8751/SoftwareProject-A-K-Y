import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ✅ update this
  withCredentials: true, // if you're using cookies for auth
});

export default api;
