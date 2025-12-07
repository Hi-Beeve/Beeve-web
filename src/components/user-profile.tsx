'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { kakaoLogout } from '@/lib/kakao-auth';
import { googleLogout } from '@/lib/google-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className = '' }: UserProfileProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(user?.profileImage);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  useEffect(()=>{
    setProfile(user?.profileImage)
  },[user])

  if (!isAuthenticated || !user) {
    return (
      <a
        href="/auth/login"
        className={`
          flex items-center gap-2 px-4 py-2 
          bg-yellow-400 hover:bg-yellow-500 
          text-black font-medium rounded-lg 
          transition-colors duration-200
          ${className}
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        로그인
      </a>
    );
  }

  const handleMyPageClick = () => {
    setIsMenuOpen(false);
    router.push('/mypage');
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsMenuOpen(false);
      
      // 소셜 로그아웃 API 호출 (선택사항)
      if (user?.accessToken) {
        try {
          if (user.provider === 'kakao') {
            await kakaoLogout(user.accessToken);
          } else if (user.provider === 'google') {
            await googleLogout(user.accessToken);
          }
        } catch (error) {
          console.error(`${user.provider} 로그아웃 실패:`, error);
          // 소셜 로그아웃 실패해도 로컬 로그아웃은 진행
        }
      }
      
      // 로컬 로그아웃
      logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 프로필 버튼 */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        {/* 프로필 이미지 */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
          {profile ? (
            <Image
              src={profile}
              alt={user.nickname}
              className="w-full h-full object-cover"
              onLoadingComplete={(img) => {
        if (img.naturalWidth === 0) {
          console.log("이미지 로딩 실패")
          setProfile('/fallback.svg'); // 실패 → 대체 이미지로 변경
        }
      }}
              width={32}
              height={32}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* 사용자 정보 */}
        <div className="flex-1 text-left">
          <div className="text-white font-medium text-sm">{user.nickname}</div>
          {user.email && (
            <div className="text-gray-400 text-xs">{user.email}</div>
          )}
        </div>
        
        {/* 드롭다운 아이콘 */}
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 드롭다운 메뉴 */}
      {isMenuOpen && (
        <>
          {/* 오버레이 */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* 메뉴 */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20">
            <div className="p-2">
              {/* 사용자 정보 */}
              <div className="px-3 py-2 border-b border-gray-700">
                <div className="text-white font-medium">{user.nickname}</div>
                {user.email && (
                  <div className="text-gray-400 text-sm">{user.email}</div>
                )}
                <div className="text-gray-500 text-xs mt-1">
                  {user.provider === 'kakao' ? '카카오 계정' : user.provider}
                </div>
              </div>
              
              {/* 메뉴 아이템들 */}
              <div className="py-2">
                <button
                  onClick={handleMyPageClick}
                  className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    마이페이지
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full px-3 py-2 text-left text-red-400 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      로그아웃 중...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      로그아웃
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
