import axios from 'axios';
import { ERROR_CODES } from '@/constants/errorCodes';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1', //'https://beeve-api.mooo.com/api/v1', // 서버 도메인
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
  async (error) => {
    const originalRequest = error.config;
    
    // AUTH102 응답 처리 (토큰 만료)
    if (error.response?.data?.code === ERROR_CODES.AUTH_TOKEN_EXPIRED && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // refresh token으로 새 토큰 요청
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        const { data } = refreshResponse.data;
        
        // 새 토큰들을 localStorage에 저장
        localStorage.setItem('authToken', data.accessToken);

        
        console.log('✅ Token refreshed successfully');
        
        // 원래 요청에 새 토큰을 추가하여 재시도
        originalRequest.headers.Authorization = `${data.accessToken}`;
        return instance(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // refresh 실패 시 로그아웃 처리
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        
        // 로그인 페이지로 리다이렉트
        window.location.href = '/';
        
        return Promise.reject(refreshError);
      }
    }
    
    // AUTH101 (회원 없음) 에러는 auth.api.ts에서 처리하므로 그대로 통과
    if (error.response?.data?.code === ERROR_CODES.AUTH_USER_NOT_FOUND || error.response?.data?.code === ERROR_CODES.MEMBER_NOT_FOUND) {
      console.log('⚠️ User not found - will be handled by auth.api.ts');
      return Promise.reject(error);
    }
    
    // 기타 401 에러 처리 (토큰 없음 등)
    if (error.response?.status === 401) {
      console.log('⚠️ Unauthorized access - redirecting to login');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      // window.location.href = '/'; TODO : 서버랑 프론트랑 가까워질때까지 잠시 주석처리...
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default instance;
