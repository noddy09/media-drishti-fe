import axios from 'axios';
import Cookies from 'js-cookie';

// Resolve API base URL:
// - REACT_APP_API_BASE takes precedence when provided
// - In production builds, default to same-origin '/api/' so nginx can proxy
// - In development, fall back to Django dev server on 8000
const apiBase =
  process.env.REACT_APP_API_BASE ||
  (process.env.NODE_ENV === 'production'
    ? '/api/'
    : 'http://127.0.0.1:8000/api/');

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

// Add JWT token to Authorization header for all requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('access');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses by logging out and redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access');
      Cookies.remove('refresh');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export {};
