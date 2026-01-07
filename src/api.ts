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

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onFailure: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onFailure(error);
    } else {
      prom.onSuccess(token!);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Add JWT token to Authorization header for all requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('access');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses by attempting token refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors, and avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((onSuccess, onFailure) => {
          failedQueue.push({ onSuccess, onFailure });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refresh');

      if (!refreshToken) {
        // No refresh token available, redirect to login
        Cookies.remove('access');
        Cookies.remove('refresh');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Attempt to refresh the access token
      return api
        .post('/auth/token/refresh/', { refresh: refreshToken })
        .then((response) => {
          const { access } = response.data;
          Cookies.set('access', access);
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          processQueue(null, access);
          return api(originalRequest);
        })
        .catch((err) => {
          // Refresh failed, clear cookies and redirect to login
          Cookies.remove('access');
          Cookies.remove('refresh');
          window.location.href = '/login';
          processQueue(err, null);
          return Promise.reject(err);
        });
    }

    return Promise.reject(error);
  }
);

export default api;
export {};
