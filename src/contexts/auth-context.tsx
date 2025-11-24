'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { KakaoUser } from '@/lib/kakao-auth';
import { GoogleUser } from '@/lib/google-auth';

interface User {
  id: string;
  nickname: string;
  email?: string;
  profileImage?: string;
  provider: 'kakao' | 'google';
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_COOKIE_KEY = 'beeve_auth';
const TOKEN_COOKIE_KEY = 'beeve_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 쿠키와 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    try {
      // 먼저 쿠키에서 시도
      let savedUser = Cookies.get(AUTH_COOKIE_KEY);
      let savedToken = Cookies.get(TOKEN_COOKIE_KEY);
      
      // 쿠키에 없으면 로컬 스토리지에서 시도
      if (!savedUser || !savedToken) {
        const localUser = localStorage.getItem('beeve_user_info');
        const localToken = localStorage.getItem('beeve_access_token');
        
        if (localUser && localToken) {
          savedUser = localUser;
          savedToken = localToken;
          console.log('로컬 스토리지에서 사용자 정보를 복원했습니다.');
        }
      }
      
      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        setUser({ ...parsedUser, accessToken: savedToken });
      }
    } catch (error) {
      console.error('사용자 정보 복원 실패:', error);
      // 손상된 데이터 제거
      Cookies.remove(AUTH_COOKIE_KEY);
      Cookies.remove(TOKEN_COOKIE_KEY);
      localStorage.removeItem('beeve_user_info');
      localStorage.removeItem('beeve_access_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userData: User) => {
    setUser(userData);
    
    // 토큰과 사용자 정보를 분리하여 저장
    const { accessToken, ...userWithoutToken } = userData;
    
    // 쿠키에 저장 (7일간 유지)
    Cookies.set(AUTH_COOKIE_KEY, JSON.stringify(userWithoutToken), { 
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    Cookies.set(TOKEN_COOKIE_KEY, accessToken, { 
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // 로컬 스토리지에도 회원 정보 저장
    try {
      localStorage.setItem('beeve_user_info', JSON.stringify(userWithoutToken));
      localStorage.setItem('beeve_access_token', accessToken);
      console.log('회원 정보가 로컬 스토리지에 저장되었습니다:', userWithoutToken);
    } catch (error) {
      console.error('로컬 스토리지 저장 실패:', error);
    }
  }, []); // 의존성 없음 - 함수가 변경되지 않음

  const logout = useCallback(() => {
    setUser(null);
    Cookies.remove(AUTH_COOKIE_KEY);
    Cookies.remove(TOKEN_COOKIE_KEY);
    
    // 로컬 스토리지도 정리
    try {
      localStorage.removeItem('beeve_user_info');
      localStorage.removeItem('beeve_access_token');
      console.log('로컬 스토리지가 정리되었습니다.');
    } catch (error) {
      console.error('로컬 스토리지 정리 실패:', error);
    }
  }, []); // 의존성 없음 - 함수가 변경되지 않음

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 카카오 사용자 정보를 내부 User 형식으로 변환
export function convertKakaoUserToUser(kakaoUser: KakaoUser, accessToken: string): User {
  return {
    id: kakaoUser.id.toString(),
    nickname: kakaoUser.kakao_account?.profile?.nickname || kakaoUser.properties?.nickname || '사용자',
    email: kakaoUser.kakao_account?.email || undefined,
    profileImage: kakaoUser.kakao_account?.profile?.profile_image_url || kakaoUser.properties?.profile_image || undefined,
    provider: 'kakao',
    accessToken,
  };
}

// 구글 사용자 정보를 내부 User 형식으로 변환
export function convertGoogleUserToUser(googleUser: GoogleUser, accessToken: string): User {
  return {
    id: googleUser.id,
    nickname: googleUser.name || googleUser.given_name || '사용자',
    email: googleUser.email || undefined,
    profileImage: googleUser.picture || undefined,
    provider: 'google',
    accessToken,
  };
}
