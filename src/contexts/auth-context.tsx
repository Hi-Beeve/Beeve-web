'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { KakaoUser } from '@/lib/kakao-auth';
import { GoogleUser } from '@/lib/google-auth';
import type { NativeLoginData } from '@/lib/app-bridge';

interface User {
  id: string;
  nickname: string;
  email?: string;
  profileImage?: string;
  provider: 'kakao' | 'google' | 'apple' | 'email';
  accessToken: string;
  // 프로필 정보 추가
  birthDate?: string;
  height?: number;
  weight?: number;
  gender?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_COOKIE_KEY = 'beeve_auth';
const TOKEN_COOKIE_KEY = 'beeve_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // localStorage에서 사용자 정보 복원
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('userData');
      const savedToken = localStorage.getItem('authToken');
      
      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        setUser({ ...parsedUser, accessToken: savedToken });
        console.log('✅ User restored from localStorage:', parsedUser.nickname);
      } else {
        console.log('ℹ️ No saved user data found in localStorage');
      }
    } catch (error) {
      console.error('사용자 정보 복원 실패:', error);
      // 손상된 데이터 제거
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userData: User) => {
    setUser(userData);
    console.log('🔍 AuthContext login called with:', userData);
    
    // 사용자 정보를 localStorage에 저장 (토큰 제외)
    const userDataToSave = {
      id: userData.id,
      nickname: userData.nickname,
      email: userData.email,
      profileImage: userData.profileImage,
      provider: userData.provider
    };
    localStorage.setItem('userData', JSON.stringify(userDataToSave));
    console.log('✅ User data saved to localStorage:', userDataToSave);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    
    // localStorage에서 모든 사용자 관련 데이터 제거
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    console.log('🗑️ User data and tokens removed from localStorage');
    
    // 기존 쿠키도 정리 (혹시 남아있을 수 있으므로)
    Cookies.remove(AUTH_COOKIE_KEY);
    Cookies.remove(TOKEN_COOKIE_KEY);
    console.log('🧹 Cookies cleared');
  }, []);

  // Flutter WebView AppBridge 등록
  useEffect(() => {
    window.AppBridge = {
      onLoginSuccess: (data: NativeLoginData) => {
        try {
          if (!data.accessToken || !data.refreshToken || !data.providerUserId || !data.name || !data.provider) {
            console.error('[AppBridge] onLoginSuccess: 필수 필드 누락', data);
            return;
          }

          // http(s)://로 시작하지 않으면 프로필 이미지 무시
          const profileImage = data.profileUrl?.startsWith('http') ? data.profileUrl : undefined;

          // authToken/refreshToken은 login()이 저장하지 않으므로 별도 저장
          localStorage.setItem('authToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          // React 상태 업데이트 (login()이 userData를 localStorage에 저장)
          login({
            id: data.providerUserId,
            nickname: data.name,
            email: data.email,
            profileImage,
            provider: data.provider,
            accessToken: data.accessToken,
          });

          window.location.href = '/hex';
        } catch (error) {
          console.error('[AppBridge] onLoginSuccess 처리 중 오류:', error);
        }
      },
      onLogout: () => {
        try {
          logout();
          window.location.href = '/';
        } catch (error) {
          console.error('[AppBridge] onLogout 처리 중 오류:', error);
        }
      },
    };

    return () => {
      delete window.AppBridge;
    };
  }, [login, logout]);

  const updateProfile = useCallback((profileData: Partial<User>) => {
    setUser(currentUser => {
      if (!currentUser) return currentUser;
      
      const updatedUser = { ...currentUser, ...profileData };
      
      // localStorage에 업데이트된 사용자 정보 저장 (토큰 제외)
      const userDataToSave = {
        id: updatedUser.id,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        provider: updatedUser.provider,
        birthDate: updatedUser.birthDate,
        height: updatedUser.height,
        weight: updatedUser.weight,
        gender: updatedUser.gender
      };
      localStorage.setItem('userData', JSON.stringify(userDataToSave));
      console.log('✅ Profile updated in localStorage:', userDataToSave);
      
      return updatedUser;
    });
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateProfile,
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
