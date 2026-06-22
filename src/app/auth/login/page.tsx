'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { KakaoLoginButton } from '@/components/kakao-login-button';
import { GoogleLoginButton } from '@/components/google-login-button';
import { AppleLoginButton } from '@/components/apple-login-button';
import { emailLoginApi } from '@/api/auth/auth.api';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [error, setError] = useState<string>('');

  // 이메일 폼 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/hex');
    }
  }, [isAuthenticated, router]);

  const TEST_EMAIL = 'beeve.test@gmail.com';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email !== TEST_EMAIL) {
      setError('등록된 이메일이 아닙니다.');
      return;
    }
    if (password.length < 1) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setEmailLoading(true);
    try {
      const data = await emailLoginApi({ email, password });

      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      login({
        id: email,
        nickname: data.name,
        email,
        profileImage: data.profileUrl || undefined,
        provider: 'email',
        accessToken: data.accessToken,
      });

      router.push('/hex');
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === 'AUTH301') {
        setError('이메일 또는 비밀번호를 확인해주세요.');
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setEmailLoading(false);
    }
  };

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

        {/* 소셜 로그인 버튼 */}
        <div className="space-y-4">
          <KakaoLoginButton />
          <GoogleLoginButton />
          <AppleLoginButton />
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-600" />
          <span className="text-gray-500 text-sm">또는</span>
          <div className="flex-1 h-px bg-gray-600" />
        </div>

        {/* 이메일 로그인 폼 */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="이메일"
            autoComplete="email"
            className="w-full px-4 py-3 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="비밀번호"
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <button
            type="submit"
            disabled={emailLoading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {emailLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                로그인 중...
              </span>
            ) : '로그인'}
          </button>
        </form>

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
