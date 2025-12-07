'use client';

import google_icon from '../../public/google-icon.svg';
import kakao_icon from '../../public/kakao_icon.svg';
import splash from '../../public/splash_logo.svg';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full py-5 px-4">
      <Image src={splash} alt="splash" width={200} height={100} />
      <SignInGroup />
    </div>  );
}

const SignInGroup = () => {
  return (
    <div className="absolute bottom-10 w-full px-5 flex flex-col gap-3">
      <SignInTag icon={google_icon} text="구글" className="bg-[#F5F5F5] border-1 border-[#767676]" />
      <SignInTag icon={kakao_icon} text="카카오" className="bg-[#FEE500]" />
    </div>
  );
};

const SignInTag = ({icon, text, className}: {icon: string, text: string, className?: string}) => {
  return (
    <div className={`flex items-center justify-center gap-2 h-[56px] rounded-[20px] w-full ${className} text-[#404040]`}>
      <Image src={icon} alt="icon" width={24} height={24} />
      <p>{text}로 시작하기</p>
    </div>
  );
}