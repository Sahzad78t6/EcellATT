import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
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
