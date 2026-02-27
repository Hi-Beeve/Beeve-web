'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSocialLogin } from '@/api/auth/useAuth';

function AppleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { socialLogin, isLoading } = useSocialLogin({
    onSuccess: (loginResult) => {
      const user = (window as any).tempAppleUserData;
      if (user) {
        handleLoginResult(loginResult, user);
        delete (window as any).tempAppleUserData;
      }
    },
    onError: (error) => {
      console.error('Apple login failed:', error);
      setStatus('error');
      setErrorMessage(error.message || '로그인 처리 중 오류가 발생했습니다.');
      setIsProcessing(false);
    },
  });
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLoginResult = (loginResult: { authData?: any; needsSignUp?: boolean }, user: any) => {
    if (loginResult?.needsSignUp) {
      const pendingData = {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        profileImage: user.profileImage,
        provider: 'apple' as const,
      };
      sessionStorage.setItem('pendingOAuthUser', JSON.stringify(pendingData));
      localStorage.setItem('pendingOAuthUser', JSON.stringify(pendingData));
      setStatus('success');
      setIsProcessing(false);
      router.push('/auth/additional-info');
    } else {
      const userData = {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        profileImage: user.profileImage,
        provider: 'apple',
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      login(user);
      setStatus('success');
      setIsProcessing(false);
      router.push('/hex');
    }
  };

  useEffect(() => {
    if (isProcessing) return;

    const sub = searchParams.get('sub');
    const email = searchParams.get('email') || undefined;
    const name = searchParams.get('name') || undefined;
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage('Apple 로그인이 취소되었거나 오류가 발생했습니다.');
      return;
    }

    if (!sub) {
      setStatus('error');
      setErrorMessage('Apple 로그인 정보를 받지 못했습니다.');
      return;
    }

    setIsProcessing(true);

    const user = {
      id: sub,
      nickname: name || email?.split('@')[0] || 'Apple 사용자',
      email,
      profileImage: undefined,
      provider: 'apple' as const,
    };

    (window as any).tempAppleUserData = user;

    socialLogin({
      id: sub,
      nickname: user.nickname,
      email,
      provider: 'apple',
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">로그인 처리 중...</h2>
            <p className="text-gray-400">Apple 계정 정보를 확인하고 있습니다.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">로그인 성공!</h2>
            <p className="text-gray-400 mb-4">Apple 계정으로 로그인되었습니다.</p>
            <p className="text-sm text-gray-500">잠시 후 메인 페이지로 이동합니다...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">로그인 실패</h2>
            <p className="text-gray-400 mb-4">{errorMessage}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              로그인 페이지로 돌아가기
            </button>
          </>
        )}
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
