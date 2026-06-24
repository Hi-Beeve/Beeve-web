'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { emailLoginApi } from '@/api/auth/auth.api';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [error, setError] = useState<string>('');
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
      setError('This email is not registered.');
      return;
    }
    if (password.length < 1) {
      setError('Please enter your password.');
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
        setError('Incorrect email or password.');
      } else {
        setError('Login failed. Please try again.');
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
          <p className="text-white">Redirecting...</p>
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

        {/* 이메일 로그인 폼 */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="Email"
            autoComplete="email"
            className="w-full px-4 py-3 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Password"
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
                Signing in...
              </span>
            ) : 'Sign in'}
          </button>
        </form>

        {/* 뒤로가기 버튼 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
