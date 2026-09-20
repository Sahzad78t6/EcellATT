import axios from 'axios';

// Resolve base API URL smartly
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If explicitly specified with full URL
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api/v1`;
  }
  
  // In production (e.g. Vercel deployment), point directly to the Render backend
  if (import.meta.env.PROD || (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1'))) {
    return 'https://ecellatt.onrender.com/api/v1';
  }
  
  // In local development, use Vite proxy
  return '/api/v1';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token if available in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to unwrap { success, data, message, error }
api.interceptors.response.use(
  (response) => {
    // If response is a blob/file download, return as is
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      details: error.response?.data?.error || null
    };
    return Promise.reject(customError);
  }
);

export default api;
