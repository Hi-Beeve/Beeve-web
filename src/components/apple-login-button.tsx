'use client';

import { useState } from 'react';
import { getAppleLoginUrl } from '@/lib/apple-auth';

interface AppleLoginButtonProps {
  className?: string;
}

export function AppleLoginButton({ className = '' }: AppleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleAppleLogin = () => {
    try {
      setIsLoading(true);
      setError('');
      const loginUrl = getAppleLoginUrl();
      window.location.href = loginUrl;
    } catch (err) {
      console.error('Apple 로그인 오류:', err);
      setError(err instanceof Error ? err.message : 'Apple 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleAppleLogin}
        disabled={isLoading}
        className={`
          w-full flex items-center justify-center gap-3 px-4 py-3
          bg-black hover:bg-gray-900 text-white font-medium
          border border-gray-700 rounded-lg transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
            <span>로그인 중...</span>
          </>
        ) : (
          <>
            {/* Apple 로고 SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span>Apple로 계속하기</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
