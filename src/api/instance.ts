import axios from 'axios';
import { ERROR_CODES } from '@/constants/errorCodes';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://beeve-api-179219167030.asia-northeast3.run.app/api/v1', //'http://localhost:3000/api/v1', // 서버 도메인
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')?.trim();
    if (token) {
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
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

// refresh 중복 실행 방지용
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: string) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const clearAuthStorage = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
};

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // AUTH101 (회원 없음) 에러는 auth.api.ts에서 처리하므로 그대로 통과
    if (
      error.response?.data?.code === ERROR_CODES.AUTH_USER_NOT_FOUND ||
      error.response?.data?.code === ERROR_CODES.MEMBER_NOT_FOUND
    ) {
      console.log('⚠️ User not found - will be handled by auth.api.ts');
      return Promise.reject(error);
    }

    // AUTH104: 탈퇴된 사용자의 토큰 → 즉시 강제 로그아웃
    if (error.response?.data?.code === ERROR_CODES.AUTH_TOKEN_REQUIRED) {
      console.log('⚠️ Withdrawn user token detected - forcing logout');
      clearAuthStorage();
      window.location.href = '/';
      return Promise.reject(error);
    }

    // AUTH102 응답 처리 (토큰 만료) - race condition 방지 처리 포함
    if (error.response?.data?.code === ERROR_CODES.AUTH_TOKEN_EXPIRED && !originalRequest._retry) {
      // 이미 refresh 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        processQueue(new Error('No refresh token'));
        clearAuthStorage();
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://beeve-api-179219167030.asia-northeast3.run.app/api/v1'}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { data } = refreshResponse.data;

        localStorage.setItem('authToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        console.log('✅ Token refreshed successfully');
        processQueue(null, data.accessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        processQueue(refreshError);
        isRefreshing = false;

        clearAuthStorage();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    // 그 외 401은 토큰을 삭제하지 않고 에러만 전파 (엔드포인트 권한 문제 등)
    return Promise.reject(error);
  }
);

export default instance;
