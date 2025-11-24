'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { KakaoLoginButton } from '@/components/kakao-login-button';
import { GoogleLoginButton } from '@/components/google-login-button';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string>('');

  // 이미 로그인된 경우 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // 로그인된 상태에서는 리다이렉트 중임을 표시
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">메인 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Beeve</h1>
          <p className="text-gray-400">운동 측정 앱에 오신 것을 환영합니다</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* 로그인 버튼 */}
        <div className="space-y-4">
          <KakaoLoginButton />
          <GoogleLoginButton />
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            로그인하면 개인 운동 기록을 저장하고<br />
            맞춤형 운동 분석을 받을 수 있습니다.
          </p>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← 뒤로가기
          </button>
        </div>
      </div>
    </div>
  );
}
