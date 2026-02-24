'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useSignUp } from '@/api/auth/useAuth';
import { ClientOAuthInfo, ClientAdditionalInfo } from '@/types/auth';
import { FONT_STYLES } from '@/styles/fontStyles';
import { GenderSelect, BirthDateSelect, PhysicalInfoInput, PhoneVerificationInput } from '@/components/common/FormComponents';
import { ProgressBar } from '@/components/progress_bar';

type FunnelStep = 'gender' | 'birthDate' | 'physicalInfo' | 'phoneVerification';

function AdditionalInfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { signUp, isLoading, error: signUpError, data: signUpData, isSuccess } = useSignUp();
  
  const [currentStep, setCurrentStep] = useState<FunnelStep>('gender');
  const [error, setError] = useState<string>('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [formData, setFormData] = useState<ClientAdditionalInfo>({
    birthDate: '',
    gender: '',
    height: 0,
    weight: 0,
    phoneNumber: '',
    verificationToken: ''
  });



  // 소셜 로그인 후 리다이렉트된 경우 임시 사용자 정보 가져오기
  const [tempUser, setTempUser] = useState<ClientOAuthInfo | null>(null);
  const initializeRef = useRef(false);
  const loginProcessedRef = useRef(false);

  useEffect(() => {
    // React Strict Mode 중복 실행 방지
    if (initializeRef.current) {
      console.log('🔄 useEffect already executed, skipping...');
      return;
    }
    initializeRef.current = true;
    console.log('🔍 Additional info page mounted, checking storage...');
    
    // sessionStorage에서 먼저 시도 (pendingUserInfo 키 사용)
    let pendingOAuthUser = sessionStorage.getItem('pendingUserInfo');
    console.log('📦 SessionStorage pendingUserInfo:', pendingOAuthUser);
    
    // sessionStorage에 없으면 localStorage에서 시도
    if (!pendingOAuthUser) {
      pendingOAuthUser = localStorage.getItem('pendingUserInfo');
      console.log('📦 LocalStorage pendingUserInfo:', pendingOAuthUser);
    }
    
    // 이전 키명도 확인 (하위 호환성)
    if (!pendingOAuthUser) {
      pendingOAuthUser = sessionStorage.getItem('pendingOAuthUser') || localStorage.getItem('pendingOAuthUser');
      console.log('📦 Fallback pendingOAuthUser:', pendingOAuthUser);
    }
    
    if (pendingOAuthUser) {
      try {
        const parsed = JSON.parse(pendingOAuthUser);
        console.log('✅ Successfully parsed pending OAuth user:', parsed);
        setTempUser(parsed);
        
        // 데이터 제거는 나중에 (회원가입 완료 시에만)
        console.log('📝 TempUser set, keeping data in storage for now');
      } catch (error) {
        console.error('❌ 임시 사용자 데이터 파싱 실패:', error);
        // 파싱 실패 시에만 제거
        sessionStorage.removeItem('pendingUserInfo');
        localStorage.removeItem('pendingUserInfo');
        sessionStorage.removeItem('pendingOAuthUser');
        localStorage.removeItem('pendingOAuthUser');
        router.push('/');
      }
    } else {
      console.log('⚠️ No pending OAuth user found in any storage');
      console.log('🔍 SessionStorage keys:', Object.keys(sessionStorage));
      console.log('🔍 LocalStorage keys:', Object.keys(localStorage));
      console.log('❌ Redirecting to login page');
      // 임시 사용자 데이터가 없으면 로그인 페이지로
      router.push('/'); 
    }
  }, [router]);

  // 회원가입 성공 시 로그인 처리
  useEffect(() => {

    if (isSuccess && signUpData && tempUser && !loginProcessedRef.current) {
      console.log('🎉 회원가입 완료!', signUpData);
      loginProcessedRef.current = true; // 중복 실행 방지
      
      // localStorage에 토큰이 저장되었는지 확인
      const authToken = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('🔍 localStorage check after signup:');
      console.log('  - authToken:', authToken ? 'EXISTS (' + authToken.substring(0, 20) + '...)' : 'NOT FOUND');
      console.log('  - refreshToken:', refreshToken ? 'EXISTS (' + refreshToken.substring(0, 20) + '...)' : 'NOT FOUND');
      
      // 임시 데이터 정리 (회원가입 완료 시에만)
      sessionStorage.removeItem('pendingUserInfo');
      localStorage.removeItem('pendingUserInfo');
      sessionStorage.removeItem('pendingOAuthUser');
      localStorage.removeItem('pendingOAuthUser');
      console.log('🗑️ Cleaned up pending OAuth data after successful signup');

      // 사용자 추가 정보를 localStorage에 저장 (나이 계산용)
      const userAdditionalInfo = {
        birthDate: formData.birthDate,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight
      };
      localStorage.setItem('userAdditionalInfo', JSON.stringify(userAdditionalInfo));
      console.log('💾 User additional info saved to localStorage:', userAdditionalInfo);
      
      // 회원가입 성공 시 토큰이 이미 localStorage에 저장되었으므로
      // 클라이언트 상태만 업데이트
      login({
        id: tempUser.id,
        nickname: tempUser.nickname,
        email: tempUser.email,
        profileImage: tempUser.profileImage,
        provider: tempUser.provider,
        accessToken: signUpData.accessToken
      });
      
      // 메인 페이지로 이동
      router.push('/hex');
    }
  }, [isSuccess, signUpData, tempUser, router]);


  // 단계별 검증 함수들
  const validateGender = (): boolean => {
    if (!formData.gender) {
      setError('성별을 선택해주세요.');
      return false;
    }
    return true;
  };

  const validateBirthDate = (): boolean => {
    if (!formData.birthDate) {
      setError('생년월일을 입력해주세요.');
      return false;
    }
    return true;
  };

  const validatePhysicalInfo = (): boolean => {
    if (!formData.height || formData.height < 100 || formData.height > 250) {
      setError('키를 올바르게 입력해주세요. (100-250cm)');
      return false;
    }
    if (!formData.weight || formData.weight < 30 || formData.weight > 200) {
      setError('체중을 올바르게 입력해주세요. (30-200kg)');
      return false;
    }
    return true;
  };

  // 네비게이션 함수들
  const handleNext = () => {
    setError('');
    
    if (currentStep === 'gender') {
      if (!privacyAgreed) {
        setError('개인정보 수집·이용에 동의해주세요.');
        return;
      }
      if (validateGender()) {
        setCurrentStep('birthDate');
      }
    } else if (currentStep === 'birthDate') {
      if (validateBirthDate()) {
        setCurrentStep('physicalInfo');
      }
    } else if (currentStep === 'physicalInfo') {
      if (validatePhysicalInfo()) {
        setCurrentStep('phoneVerification');
      }
    } else if (currentStep === 'phoneVerification') {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    setError('');
    
    if (currentStep === 'birthDate') {
      setCurrentStep('gender');
    } else if (currentStep === 'physicalInfo') {
      setCurrentStep('birthDate');
    } else if (currentStep === 'phoneVerification') {
      setCurrentStep('physicalInfo');
    }
  };

  const getStepInfo = () => {
    switch (currentStep) {
      case 'gender':
        return { step: 1, total: 4, title: '성별을\n선택해주세요' };
      case 'birthDate':
        return { step: 2, total: 4, title: '생년월일을\n입력해주세요' };
      case 'physicalInfo':
        return { step: 3, total: 4, title: '키와 체중을\n입력해주세요' };
      case 'phoneVerification':
        return { step: 4, total: 4, title: '휴대폰 번호를\n인증해주세요' };
    }
  };

  const handleFinalSubmit = async () => {
    setError('');
    if (!tempUser) {
      setError('사용자 정보를 찾을 수 없습니다.');
      return;
    }
    
    signUp(tempUser, formData);
  };

  if (!tempUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  const stepInfo = getStepInfo();

  return (
    <div className="min-h-screen flex items-start justify-center p-5">
      <div className="rounded-lg max-w-md w-full">
        {/* 진행 상황 표시 */}
        <ProgressBar stepInfo={stepInfo} />

        {/* 헤더 */}
        <div className="flex flex-col items-start pt-15 pb-10">
          <h1 className={`mb-2 ${FONT_STYLES.heading32} whitespace-pre-line`}>
            {stepInfo.title}
          </h1>
          <p className="text-gray-400">
            {tempUser.nickname}님의 맞춤형 운동 분석을 위해 필요해요
          </p>
        </div>

        {/* 에러 메시지 */}
        {(error || signUpError) && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error || signUpError?.message || '오류가 발생했습니다.'}
          </div>
        )}

        {/* 단계별 컨텐츠 */}
        <div className="space-y-6">
          {/* 1단계: 성별 선택 */}
          {currentStep === 'gender' && (
            <>
              <GenderSelect
                value={formData.gender}
                onChange={(gender) => {
                  setFormData(prev => ({ ...prev, gender }));
                  setError('');
                }}
                error={error}
              />
              <label className="flex items-start gap-3 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => {
                    setPrivacyAgreed(e.target.checked);
                    setError('');
                  }}
                  className="mt-0.5 w-4 h-4 accent-[#BDB2DD] shrink-0"
                />
                <span className="text-sm text-[#444] leading-relaxed">
                  (필수){' '}
                  <Link href="/privacy" target="_blank" className="underline text-[#BDB2DD]">
                    개인정보 수집·이용
                  </Link>
                  에 동의합니다.
                </span>
              </label>
            </>
          )}

          {/* 2단계: 생년월일 입력 */}
          {currentStep === 'birthDate' && (
            <BirthDateSelect
              value={formData.birthDate}
              onChange={(birthDate) => {
                setFormData(prev => ({ ...prev, birthDate }));
                setError('');
              }}
              error={error}
            />
          )}

          {/* 3단계: 키와 체중 입력 */}
          {currentStep === 'physicalInfo' && (
            <PhysicalInfoInput
              height={formData.height}
              weight={formData.weight}
              onHeightChange={(height) => {
                setFormData(prev => ({ ...prev, height }));
                setError('');
              }}
              onWeightChange={(weight) => {
                setFormData(prev => ({ ...prev, weight }));
                setError('');
              }}
            />
          )}

          {/* 4단계: 휴대폰 인증 */}
          {currentStep === 'phoneVerification' && (
            <PhoneVerificationInput
              phoneNumber={formData.phoneNumber}
              onPhoneNumberChange={(phoneNumber) => {
                setFormData(prev => ({ ...prev, phoneNumber }));
                setError('');
              }}
              onVerified={(verified, token) => {
                setPhoneVerified(verified);
                if (token) {
                  setFormData(prev => ({ ...prev, verificationToken: token }));
                }
              }}
            />
          )}
        </div>
        
        {/* 네비게이션 버튼들 */}
        <div className="flex gap-4 fixed bottom-4 left-5 right-5 h-[56px]">
          {currentStep !== 'gender' && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 px-4 py-3 bg-[#F5F5F5] text-[#767676] font-medium rounded-[20px] transition-colors duration-200"
            >
              이전
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading || (currentStep === 'phoneVerification' && !phoneVerified)}
            className="flex-1 px-4 py-3 bg-[#BDB2DD] text-white font-medium rounded-[20px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>처리 중...</span>
              </div>
            ) : currentStep === 'phoneVerification' ? (
              '가입 완료'
            ) : (
              '다음'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function AdditionalInfoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    }>
      <AdditionalInfoContent />
    </Suspense>
  );
}