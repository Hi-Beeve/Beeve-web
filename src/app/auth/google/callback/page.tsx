'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoginQuery } from '@/api/auth/queries';
import { getGoogleAccessToken, getGoogleUserInfo } from '@/lib/google-auth';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: socialLogin } = useLoginQuery();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processGoogleCallback = async () => {
      if (isProcessing) return; // 중복 실행 방지
      
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('Google OAuth error:', error);
        router.push('/auth/login?error=oauth_failed');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        router.push('/auth/login?error=no_code');
        return;
      }

      setIsProcessing(true);

      try {
        // 1. Google OAuth 코드로 액세스 토큰 요청
        console.log('🔄 Getting Google access token...');
        const tokenResponse = await getGoogleAccessToken(code);
        
        // 2. 액세스 토큰으로 사용자 정보 요청
        console.log('🔄 Getting Google user info...');
        const userInfo = await getGoogleUserInfo(tokenResponse.access_token);
        
        // 3. 서버에 소셜 로그인 요청
        console.log('🔄 Attempting social login with user ID:', userInfo.id);
        socialLogin({
          provider: 'GOOGLE',
          providerUserId: userInfo.id,
        }, {
          onSuccess: (data) => {
            console.log('✅ Social login successful:', data);
            if (data.needsSignUp) {
              // 신규 회원인 경우 사용자 정보를 저장하고 추가 정보 입력 페이지로 이동
              localStorage.setItem('pendingUserInfo', JSON.stringify({
                provider: 'GOOGLE',
                providerUserId: userInfo.id,
                name: userInfo.name,
                email: userInfo.email,
                profileUrl: userInfo.picture,
              }));
              router.push('/auth/additional-info');
            } else {
              // 기존 회원인 경우 사용자 정보를 localStorage에 저장 (AuthContext 형식에 맞춤)
              const userData = {
                id: userInfo.id,
                nickname: userInfo.name || userInfo.given_name || '사용자',
                email: userInfo.email,
                profileImage: userInfo.picture,
                provider: 'google',
              };
              localStorage.setItem('userData', JSON.stringify(userData));
              console.log('✅ User data saved to localStorage:', userData);
              
              // 메인 페이지로 이동
              router.push('/hex');
            }
          },
          onError: (error) => {
            console.error('❌ Social login error:', error);
            setIsProcessing(false);
            router.push('/auth/login?error=login_failed');
          },
        });
      } catch (error) {
        console.error('❌ Google callback processing error:', error);
        setIsProcessing(false);
        router.push('/auth/login?error=callback_failed');
      }
    };

    processGoogleCallback();
  }, [searchParams, router, socialLogin, isProcessing]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-xl font-medium text-gray-900">
            구글 로그인 처리 중...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            잠시만 기다려주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-xl font-medium text-gray-900">
              로딩 중...
            </h2>
          </div>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
