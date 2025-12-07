import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_API_BASE_URL || 'https://beeve-api.mooo.com/api/v1', // 서버 도메인
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `${token}`;
      console.log('🔑 Token attached to request:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No authToken found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      // localStorage.removeItem('authToken');
      // window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
