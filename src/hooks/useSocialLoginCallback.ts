import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSocialAuthApi } from '@/api/auth/auth.api';

interface SocialUser {
  id: string;
  nickname: string;
  email?: string;
  profileImage?: string;
  provider: 'kakao' | 'google';
  accessToken: string;
}

export const useSocialLoginCallback = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const processSocialLogin = async (user: SocialUser, code: string, provider: 'kakao' | 'google') => {
    try {
      // 1. 서버에 로그인 API 요청
      const authResult = await useSocialAuthApi({
        provider: user.provider,
        providerUserId: user.id
      });
      
      // 2. 처리된 코드 저장 (1시간 후 자동 삭제)
      localStorage.setItem(`${provider}_processed_code`, code);
      localStorage.setItem(`${provider}_processed_time`, Date.now().toString());
      
      setStatus('success');
      
      // 3. URL에서 코드 제거 (중복 사용 방지)
      window.history.replaceState({}, '', `/auth/${provider}/callback`);
      
      // 4. 로그인 결과에 따른 분기 처리
      if (authResult.authData) {
        // 기존 회원 - 바로 로그인 완료
        login({
          ...user,
          accessToken: authResult.authData.accessToken
        });
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else if (authResult.needsSignUp) {
        // 신규 회원 - 추가 정보 입력 페이지로 이동
        const tempUserData = encodeURIComponent(JSON.stringify(user));
        setTimeout(() => {
          router.push(`/auth/additional-info?tempUser=${tempUserData}`);
        }, 2000);
      }

    } catch (error) {
      console.error(`${provider} 로그인 콜백 처리 실패:`, error);
      const message = error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.';
      setErrorMessage(message);
      setStatus('error');
      
      // 5초 후 적절한 페이지로 리다이렉트
      setTimeout(() => {
        if (provider === 'google') {
          router.push('/auth/login');
        } else {
          router.push('/');
        }
      }, 5000);
    }
  };

  return {
    processSocialLogin,
    status,
    errorMessage,
    setStatus,
    setErrorMessage
  };
};
