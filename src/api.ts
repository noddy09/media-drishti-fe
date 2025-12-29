import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // Use full backend URL for local dev
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
