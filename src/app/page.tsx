'use client';

import google_icon from '../../public/google-icon.svg';
import kakao_icon from '../../public/kakao_icon.svg';
import apple_icon from '../../public/apple_icon.svg';
import splash from '../../public/splash_logo.svg';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getKakaoLoginUrl } from '@/lib/kakao-auth';
import { getGoogleLoginUrl } from '@/lib/google-auth';
import { getAppleLoginUrl } from '@/lib/apple-auth';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // 카메라 설정 이동 전 저장한 경로가 있으면 복원 (5분 TTL)
      const returnRaw = localStorage.getItem('returnAfterSettings');
      if (returnRaw) {
        try {
          const { path, ts } = JSON.parse(returnRaw);
          localStorage.removeItem('returnAfterSettings');
          if (Date.now() - ts < 5 * 60 * 1000) {
            router.replace(path);
            return;
          }
        } catch {
          localStorage.removeItem('returnAfterSettings');
        }
      }
      router.replace('/hex');
    }
  }, [isLoading, isAuthenticated, router]);

  // 인증 확인 중 또는 이미 인증됨 → 로그인 버튼 노출 안 함 (깜빡임 방지)
  if (isLoading || isAuthenticated) {
    return (
      <div className="flex flex-col items-center h-screen w-full py-5 pb-10">
        <div className="flex-1 flex items-center justify-center">
          <Image src={splash} alt="splash" width={170} height={100} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-screen w-full py-5 pb-10">
      <div className="flex-1 flex items-center justify-center">
        <Image src={splash} alt="splash" width={170} height={100} />
      </div>
      <SignInGroup />
    </div>
  );
}

const SignInGroup = () => {
  const [isLoading, setIsLoading] = useState<string>('');

  const handleGoogleLogin = async () => {
    try {
      setIsLoading('google');
      const loginUrl = getGoogleLoginUrl();
      window.location.href = loginUrl;
    } catch (error) {
      console.error('구글 로그인 오류:', error);
      setIsLoading('');
    }
  };

  const handleKakaoLogin = async () => {
    try {
      setIsLoading('kakao');
      const loginUrl = getKakaoLoginUrl();
      window.location.href = loginUrl;
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
      setIsLoading('');
    }
  };

  const handleAppleLogin = () => {
    try {
      setIsLoading('apple');
      const loginUrl = getAppleLoginUrl();
      window.location.href = loginUrl;
    } catch (error) {
      console.error('애플 로그인 오류:', error);
      setIsLoading('');
    }
  };

  return (
    <div className="w-full px-5 flex flex-col gap-3">
      <SignInTag
        icon={apple_icon}
        text="애플"
        className="bg-black text-white"
        onClick={handleAppleLogin}
        isLoading={isLoading === 'apple'}
      />
      <SignInTag
        icon={google_icon}
        text="구글"
        className="bg-[#F5F5F5] border-1 border-[#767676] text-[#404040]"
        onClick={handleGoogleLogin}
        isLoading={isLoading === 'google'}
      />
      <SignInTag
        icon={kakao_icon}
        text="카카오"
        className="bg-[#FEE500] text-[#404040]"
        onClick={handleKakaoLogin}
        isLoading={isLoading === 'kakao'}
      />
      <Link
        href="/auth/login"
        className="text-center text-sm text-gray-400 hover:text-gray-200 transition-colors py-2"
      >
        Sign in with Email
      </Link>
    </div>
  );
};

const SignInTag = ({
  icon, 
  text, 
  className, 
  onClick, 
  isLoading
}: {
  icon: string, 
  text: string, 
  className?: string,
  onClick?: () => void,
  isLoading?: boolean
}) => {
  return (
    <button 
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 h-[56px] rounded-[20px] w-full ${className} transition-opacity duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 active:opacity-60'}`}
    >
      {isLoading ? (
        <>
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <p>로그인 중...</p>
        </>
      ) : (
        <>
          <Image src={icon} alt="icon" width={24} height={24} />
          <p>{text}로 시작하기</p>
        </>
      )}
    </button>
  );
}