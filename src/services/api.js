// client/src/services/api.js
import axios from 'axios';

// Prefer environment variable; fallback to localhost for dev
const apiBase =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: apiBase });

// Always attach the token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
