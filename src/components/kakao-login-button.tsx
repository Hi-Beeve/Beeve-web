'use client';

import { useState } from 'react';
import { getKakaoLoginUrl } from '@/lib/kakao-auth';

interface KakaoLoginButtonProps {
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export function KakaoLoginButton({ 
  onError, 
  className = '',
  disabled = false 
}: KakaoLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);
      const loginUrl = getKakaoLoginUrl();
      window.location.href = loginUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '카카오 로그인 중 오류가 발생했습니다.';
      console.error('카카오 로그인 오류:', error);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleKakaoLogin}
      disabled={disabled || isLoading}
      className={`
        flex items-center justify-center gap-3 w-full px-4 py-3 
        bg-yellow-400 hover:bg-yellow-500 
        text-black font-medium rounded-lg 
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span>로그인 중...</span>
        </div>
      ) : (
        <>
          {/* 카카오 로고 */}
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="flex-shrink-0"
          >
            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
          </svg>
          <span>카카오로 시작하기</span>
        </>
      )}
    </button>
  );
}
