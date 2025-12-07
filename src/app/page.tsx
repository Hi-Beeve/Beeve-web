'use client';

import google_icon from '../../public/google-icon.svg';
import kakao_icon from '../../public/kakao_icon.svg';
import splash from '../../public/splash_logo.svg';
import Image from 'next/image';
import { useState } from 'react';
import { getKakaoLoginUrl } from '@/lib/kakao-auth';
import { getGoogleLoginUrl } from '@/lib/google-auth';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full py-5 pb-20">
      <Image src={splash} alt="splash" width={170} height={100} />
      <SignInGroup />
    </div>  );
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

  return (
    <div className="absolute bottom-10 w-full px-5 flex flex-col gap-3">
      <SignInTag 
        icon={google_icon} 
        text="구글" 
        className="bg-[#F5F5F5] border-1 border-[#767676]" 
        onClick={handleGoogleLogin}
        isLoading={isLoading === 'google'}
      />
      <SignInTag 
        icon={kakao_icon} 
        text="카카오" 
        className="bg-[#FEE500]" 
        onClick={handleKakaoLogin}
        isLoading={isLoading === 'kakao'}
      />
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
      className={`flex items-center justify-center gap-2 h-[56px] rounded-[20px] w-full ${className} text-[#404040] transition-opacity duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 active:opacity-60'}`}
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