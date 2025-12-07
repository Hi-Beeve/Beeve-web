import { useLoginQuery, useSignUpQuery, useRefreshTokenQuery } from './queries';
import { AuthLoginRequest, AuthSignUpRequest, ClientAdditionalInfo, ClientOAuthInfo, AuthResponse } from '@/types/auth';

// 통합 소셜 로그인 커스텀 훅
export const useSocialLogin = (callbacks?: {
  onSuccess?: (data: { authData?: AuthResponse; needsSignUp?: boolean }) => void;
  onError?: (error: any) => void;
}) => {
  const mutation = useLoginQuery();

  const socialLogin = (clientUserInfo: ClientOAuthInfo) => {
    // 클라이언트 데이터를 서버 API 형식으로 정제
    const serverData: AuthLoginRequest = {
      provider: clientUserInfo.provider.toUpperCase(), // 서버에서 대문자를 기대하므로 변환
      providerUserId: clientUserInfo.id
    };

    return mutation.mutate(serverData, {
      onSuccess: (data) => {
        console.log('🔍 Social login success:', data);
        callbacks?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('❌ Social login error:', error);
        callbacks?.onError?.(error);
      }
    });
  };

  return {
    socialLogin,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError
  };
};

// 회원가입 커스텀 훅
export const useSignUp = () => {
  const mutation = useSignUpQuery();

  const signUp = (clientUserInfo: ClientOAuthInfo, additionalInfo: ClientAdditionalInfo) => {
    // Gender 값 변환 함수
    const convertGender = (gender: string): string => {
      switch (gender.toLowerCase()) {
        case 'female': return 'F';
        case 'male': return 'M';
        default: return gender;
      }
    };

    // 클라이언트 데이터를 서버 API 형식으로 정제
    const convertedGender = convertGender(additionalInfo.gender);
    console.log(`🔄 Gender conversion: ${additionalInfo.gender} → ${convertedGender}`);
    
    const serverData: AuthSignUpRequest = {
      provider: clientUserInfo.provider.toUpperCase(), // 서버에서 대문자를 기대하므로 변환
      providerUserId: clientUserInfo.id,
      name: clientUserInfo.nickname,
      email: clientUserInfo.email || '',
      profileUrl: clientUserInfo.profileImage || '',
      gender: convertedGender, // female → F, male → M 변환
      birthDate: additionalInfo.birthDate,
      height: additionalInfo.height,
      weight: additionalInfo.weight
    };

    return mutation.mutate(serverData);
  };

  return {
    signUp,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError
  };
};

// 토큰 갱신 커스텀 훅
export const useRefreshToken = () => {
  const mutation = useRefreshTokenQuery();
    // localStorage에 저장한 
  const refreshToken = (clientRefreshToken: string) => {
    // 클라이언트 데이터를 서버 API 형식으로 정제
    const serverData = {
      refreshToken: clientRefreshToken
    };

    return mutation.mutate(serverData);
  };

  return {
    refreshToken,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError
  };
};

// 로그아웃 함수
export const useLogout = () => {
  const logout = () => {
    // localStorage에서 토큰 제거
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // 기존 쿠키도 제거
    document.cookie = 'beeve_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'beeve_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    console.log('✅ Logout successful, tokens removed from localStorage and cookies cleared');
    
    // 로그인 페이지로 리다이렉트 (필요시)
    // window.location.href = '/auth/login';
  };

  return { logout };
};

// 기존 쿠키를 localStorage로 마이그레이션하는 함수
export const migrateCookiesToLocalStorage = () => {
  // 쿠키에서 토큰 읽기
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const beeveAuth = getCookie('beeve_auth');
  const beeveToken = getCookie('beeve_token');

  if (beeveAuth || beeveToken) {
    console.log('🔄 Migrating tokens from cookies to localStorage...');
    
    if (beeveAuth) {
      localStorage.setItem('authToken', beeveAuth);
      console.log('✅ Migrated beeve_auth to authToken');
    }
    
    if (beeveToken) {
      localStorage.setItem('refreshToken', beeveToken);
      console.log('✅ Migrated beeve_token to refreshToken');
    }
    
    // 쿠키 제거
    document.cookie = 'beeve_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'beeve_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('🧹 Old cookies cleared');
  }
};

// 사용 예시:
// const { socialLogin, isLoading, data, error } = useSocialLogin();
// const { signUp, isLoading, data, error } = useSignUp();
// const { refreshToken, isLoading, data, error } = useRefreshToken();
// const { logout } = useLogout();