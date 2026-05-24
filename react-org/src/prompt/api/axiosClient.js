import axios from 'axios';
import { API_URL } from '../../config/api';

const axiosClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 90000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - CSRF 토큰 자동 추가
axiosClient.interceptors.request.use(
  (config) => {
    if (config.method !== 'get') {
      const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
      if (match) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(match[1]);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    // Return data directly if response has standard ApiResponse format
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      if (status === 401) {
        console.error('Unauthorized access - session expired');
        window.dispatchEvent(new Event('auth:expired'));
      } else if (status === 403) {
        console.error('Forbidden');
      } else if (status === 404) {
        console.error('Resource not found');
      }

      return Promise.reject(data || error);
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server');
      return Promise.reject({ message: '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.' });
    } else {
      // Something else happened
      console.error('Request error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default axiosClient;
