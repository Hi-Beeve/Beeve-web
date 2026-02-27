'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoginQuery } from '@/api/auth/queries';

function AppleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: socialLogin } = useLoginQuery();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processAppleCallback = () => {
      if (isProcessing) return;

      const sub = searchParams.get('sub');
      const email = searchParams.get('email') || undefined;
      const name = searchParams.get('name') || undefined;
      const error = searchParams.get('error');

      if (error) {
        console.error('Apple OAuth error:', error);
        router.push('/auth/login?error=oauth_failed');
        return;
      }

      if (!sub) {
        console.error('No sub received from Apple');
        router.push('/auth/login?error=no_sub');
        return;
      }

      setIsProcessing(true);

      console.log('🔄 Attempting social login with Apple sub:', sub);
      socialLogin({
        provider: 'APPLE',
        providerUserId: sub,
      }, {
        onSuccess: (data) => {
          console.log('✅ Apple social login successful:', data);
          if (data.needsSignUp) {
            const nickname = name || email?.split('@')[0] || 'Apple 사용자';
            localStorage.setItem('pendingUserInfo', JSON.stringify({
              id: sub,
              provider: 'APPLE',
              providerUserId: sub,
              nickname,
              name: nickname,
              email: email || '',
              profileImage: '',
              profileUrl: '',
            }));
            router.push('/auth/additional-info');
          } else {
            const userData = {
              id: sub,
              nickname: name || email?.split('@')[0] || 'Apple 사용자',
              email,
              profileImage: undefined,
              provider: 'apple',
            };
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log('✅ User data saved to localStorage:', userData);
            router.push('/hex');
          }
        },
        onError: (error) => {
          console.error('❌ Apple social login error:', error);
          setIsProcessing(false);
          router.push('/auth/login?error=login_failed');
        },
      });
    };

    processAppleCallback();
  }, [searchParams, router, socialLogin, isProcessing]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">로그인 처리 중...</h2>
        <p className="text-gray-400">Apple 계정 정보를 확인하고 있습니다.</p>
      </div>
    </div>
  );
}

export default function AppleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">로딩 중...</h2>
          <p className="text-gray-400">페이지를 준비하고 있습니다.</p>
        </div>
      </div>
    }>
      <AppleCallbackContent />
    </Suspense>
  );
}
