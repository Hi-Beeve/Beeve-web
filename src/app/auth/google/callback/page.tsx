'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, convertGoogleUserToUser } from '@/contexts/auth-context';
import { getGoogleAccessToken, getGoogleUserInfo } from '@/lib/google-auth';
import { useSocialLogin } from '@/api/auth/useAuth';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 로그인 결과 처리 함수
  const handleLoginResult = (loginResult: { authData?: any; needsSignUp?: boolean }, user: any) => {
    if (loginResult?.needsSignUp) {
      console.log('🆕 New user - redirecting to additional info page');
      const serverLoginData = {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        profileImage: user.profileImage,
        provider: 'google' as const
      };
      // sessionStorage와 localStorage 둘 다 저장 (보험용)
      sessionStorage.setItem('pendingOAuthUser', JSON.stringify(serverLoginData));
      localStorage.setItem('pendingOAuthUser', JSON.stringify(serverLoginData));
      console.log('💾 Stored in both storages:', serverLoginData);
      
      setStatus('success');
      setIsProcessing(false);
      
      // 즉시 리다이렉트
      router.push('/auth/additional-info');
    } else {
      console.log('✅ Existing user - login successful');
      login(user);
      setStatus('success');
      setIsProcessing(false);
      setTimeout(() => {
        router.push('/hex');
      }, 2000);
    }
  };

  const { socialLogin, isLoading: isServerLoginLoading, data, isSuccess } = useSocialLogin({
    onSuccess: (loginResult) => {
      console.log('🔍 Login result received:', loginResult);
      const user = (window as any).tempUserData || currentUser;
      console.log('🔍 User data:', user);
      if (user) {
        console.log('✅ Calling handleLoginResult...');
        handleLoginResult(loginResult, user);
        // 임시 데이터 정리
        delete (window as any).tempUserData;
      } else {
        console.log('❌ No user data available, cannot proceed');
      }
    },
    onError: (error) => {
      console.error('❌ Login failed:', error);
      setErrorMessage(error.message || '로그인 처리 중 오류가 발생했습니다.');
      setStatus('error');
      setIsProcessing(false);
    }
  });
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false); // 중복 실행 방지를 state로 관리

  useEffect(() => {

    const handleGoogleCallback = async () => {
      if (isProcessing) {
        console.log('⚠️ Already processing, skipping...');
        return; // 이미 처리 중이면 리턴
      }
      console.log('🚀 Starting Google callback processing...');
      setIsProcessing(true);
      
      try {
        // URL에서 인증 코드 또는 에러 확인
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || '구글 로그인이 취소되었습니다.');
        }

        if (!code) {
          // 코드가 없으면 이미 로그인 처리가 완료된 상태일 수 있음
          console.log('인증 코드가 없습니다. 이미 처리되었을 수 있습니다.');
          setTimeout(() => {
            router.push('/hex');
          }, 1000);
          return;
        }

        // 이미 처리된 코드인지 확인 (1시간 이내)
        const processedCode = localStorage.getItem('google_processed_code');
        const processedTime = localStorage.getItem('google_processed_time');
        
        if (processedCode === code && processedTime) {
          const timeDiff = Date.now() - parseInt(processedTime);
          const oneHour = 60 * 60 * 1000; // 1시간
          
          if (timeDiff < oneHour) {
            console.log('이미 처리된 인증 코드입니다.');
            setStatus('success');
            setTimeout(() => {
              router.push('/hex');
            }, 1000);
            return;
          } else {
            // 1시간이 지났으면 정리
            localStorage.removeItem('google_processed_code');
            localStorage.removeItem('google_processed_time');
          }
        }

        setStatus('loading');

        // 1. 인증 코드로 액세스 토큰 요청
        const tokenResponse = await getGoogleAccessToken(code);
        
        // 2. 액세스 토큰으로 사용자 정보 요청
        const googleUser = await getGoogleUserInfo(tokenResponse.access_token);
        
        // 3. 사용자 정보를 내부 형식으로 변환
        const user = convertGoogleUserToUser(googleUser, tokenResponse.access_token);
        setCurrentUser(user); // 사용자 정보 저장
        
        // 4. 우리 서버로 로그인 요청 보내기
        console.log('🔄 Sending login request to our server...');
        const serverLoginData = {
          id: user.id,
          nickname: user.nickname,
          email: user.email,
          profileImage: user.profileImage,
          provider: 'google' as const
        };
        
        // 사용자 정보를 콜백에서 사용할 수 있도록 저장
        (window as any).tempUserData = user;
        
        socialLogin(serverLoginData);
        
        // 5. 처리된 코드 저장 (1시간 후 자동 삭제)
        localStorage.setItem('google_processed_code', code);
        localStorage.setItem('google_processed_time', Date.now().toString());
        
        // 6. URL에서 코드 제거 (중복 사용 방지)
        window.history.replaceState({}, '', '/auth/google/callback');
        
        // 결과는 onSuccess/onError 콜백에서 처리됨

      } catch (error) {
        console.error('구글 로그인 콜백 처리 실패:', error);
        const message = error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.';
        setErrorMessage(message);
        setStatus('error');
        setIsProcessing(false); // 에러 발생 시 처리 상태 해제
        
        // 5초 후 메인 페이지로 리다이렉트
        setTimeout(() => {
          router.push('/hex');
        }, 5000);
      }
    };

    // 이미 처리 중이거나 완료된 경우 실행하지 않음
    if (!isProcessing && status === 'loading') {
      handleGoogleCallback();
    }
  }, [searchParams, login, router, isProcessing, status]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">로그인 처리 중...</h2>
            <p className="text-gray-400">구글 계정 정보를 확인하고 있습니다.</p>
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
            <p className="text-gray-400">메인 페이지로 이동합니다...</p>
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
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              메인 페이지로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">로딩 중...</h2>
          <p className="text-gray-400">페이지를 준비하고 있습니다.</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
