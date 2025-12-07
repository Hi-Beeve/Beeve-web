'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  // 쿠키에서 사용자 정보 복원
  useEffect(() => {
    try {
      const savedUser = Cookies.get(AUTH_COOKIE_KEY);
      const savedToken = Cookies.get(TOKEN_COOKIE_KEY);
      
      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        setUser({ ...parsedUser, accessToken: savedToken });
      }
    } catch (error) {
      console.error('사용자 정보 복원 실패:', error);
      // 손상된 쿠키 제거
      Cookies.remove(AUTH_COOKIE_KEY);
      Cookies.remove(TOKEN_COOKIE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    console.log('🔍 AuthContext login called with:', userData);
    
    // 토큰은 이미 localStorage에 저장되어 있으므로 여기서는 사용자 상태만 업데이트
    console.log('✅ User state updated in AuthContext');
  };

  const logout = () => {
    setUser(null);
    
    // localStorage에서 토큰 제거
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    console.log('🗑️ Tokens removed from localStorage');
    
    // 기존 쿠키도 정리 (혹시 남아있을 수 있으므로)
    Cookies.remove(AUTH_COOKIE_KEY);
    Cookies.remove(TOKEN_COOKIE_KEY);
    console.log('🧹 Cookies cleared');
  };

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
