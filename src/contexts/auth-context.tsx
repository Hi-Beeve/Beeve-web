'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { KakaoUser } from '@/lib/kakao-auth';
import { GoogleUser } from '@/lib/google-auth';
import type { NativeLoginData } from '@/lib/app-bridge';
import { registerBridgeHandlers, unregisterBridgeHandlers, notifyNativeLogout } from '@/lib/app-bridge';

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

    // Flutter 앱에 웹 로그아웃 이벤트 전달 (앱이 네이티브 토큰 삭제)
    notifyNativeLogout();
  }, []);

  // Flutter WebView AppBridge 등록
  // window.AppBridge는 app-bridge.ts 모듈 로드 시점(React 마운트 전)에 이미 초기화됨.
  // 여기서는 실제 핸들러를 붙이고, 모듈이 큐에 보관한 이벤트를 소진시킴.
  useEffect(() => {
    const handleLogin = (data: NativeLoginData) => {
      try {
        // accessToken, refreshToken만 필수 (세션 복구 시 name 등은 null)
        if (!data.accessToken || !data.refreshToken) {
          console.error('[AppBridge] onLoginSuccess: 토큰 누락', data);
          return;
        }

        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        const isSessionRecovery = !data.name || !data.providerUserId;

        if (isSessionRecovery) {
          // 세션 복구: 프로필 정보 없음 → 기존 저장된 userData로 상태 복원
          const savedUser = localStorage.getItem('userData');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            login({ ...parsedUser, accessToken: data.accessToken });
            console.log('[AppBridge] 세션 복구 완료 (기존 userData 사용)');
          } else {
            // 저장된 사용자 정보도 없음 → 토큰만 갱신, 각 페이지에서 API 호출로 처리
            console.warn('[AppBridge] 세션 복구: 저장된 사용자 정보 없음, 토큰만 갱신');
          }
        } else {
          // 최초 로그인: 모든 필드 있음
          const profileImage = data.profileUrl?.startsWith('http') ? data.profileUrl : undefined;
          login({
            id: data.providerUserId!,
            nickname: data.name!,
            email: data.email ?? undefined,
            profileImage,
            provider: data.provider,
            accessToken: data.accessToken,
          });
        }

        // 루트(/)에 있을 때만 /hex로 이동.
        // 콜드 재시작 자동 로그인 시 / → /hex 이동,
        // 이미 다른 페이지에 있는 경우(토큰 재주입)에는 이동하지 않음.
        if (window.location.pathname === '/') {
          window.location.href = '/hex';
        }
      } catch (error) {
        console.error('[AppBridge] onLoginSuccess 처리 중 오류:', error);
      }
    };

    const handleLogout = () => {
      try {
        logout();
        window.location.href = '/';
      } catch (error) {
        console.error('[AppBridge] onLogout 처리 중 오류:', error);
      }
    };

    registerBridgeHandlers(handleLogin, handleLogout);

    return () => {
      unregisterBridgeHandlers();
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
