'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSignUp } from '@/api/auth/useAuth';
import { ClientOAuthInfo, ClientAdditionalInfo } from '@/types/auth';
import { FONT_STYLES } from '@/styles/fontStyles';
import { GenderSelect, BirthDateSelect, PhysicalInfoInput } from '@/components/common/FormComponents';
import { ProgressBar } from '@/components/progress_bar';

type FunnelStep = 'gender' | 'birthDate' | 'physicalInfo';

function AdditionalInfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { signUp, isLoading, error: signUpError, data: signUpData, isSuccess } = useSignUp();
  
  const [currentStep, setCurrentStep] = useState<FunnelStep>('gender');
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<ClientAdditionalInfo>({
    birthDate: '',
    gender: '',
    height: 0,
    weight: 0
  });



  // 소셜 로그인 후 리다이렉트된 경우 임시 사용자 정보 가져오기
  const tempUserData = searchParams.get('tempUser');
  const [tempUser, setTempUser] = useState<ClientOAuthInfo | null>(null);

  useEffect(() => {
    if (tempUserData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(tempUserData));
        setTempUser(parsed);
      } catch (error) {
        console.error('임시 사용자 데이터 파싱 실패:', error);
        router.push('/auth/login');
      }
    } else {
      // 임시 사용자 데이터가 없으면 로그인 페이지로
      router.push('/auth/login'); 
      
      // 개발용 임시 사용자 데이터 설정
    //   setTempUser({
    //     id: 'dev_user_123',
    //     nickname: '개발자',
    //     email: 'dev@example.com',
    //     profileImage: '',
    //     provider: 'kakao'
    //   });
    }
  }, [tempUserData, router]);

  // 회원가입 성공 시 로그인 처리
  useEffect(() => {
    if (isSuccess && signUpData && tempUser) {
      login({
        id: tempUser.id,
        nickname: signUpData.data.name,
        email: tempUser.email,
        profileImage: signUpData.data.profileUrl,
        provider: tempUser.provider,
        accessToken: signUpData.data.accessToken
      });
      router.push('/hex');
      
      // 개발용 - 콘솔에만 로그 출력
    //   console.log('🎉 회원가입 완료!', {
    //     user: tempUser,
    //     signUpData: signUpData
    //   });
    }
  }, [isSuccess, signUpData, tempUser, router, login]);


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
      if (validateGender()) {
        setCurrentStep('birthDate');
      }
    } else if (currentStep === 'birthDate') {
      if (validateBirthDate()) {
        setCurrentStep('physicalInfo');
      }
    } else if (currentStep === 'physicalInfo') {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    setError('');
    
    if (currentStep === 'birthDate') {
      setCurrentStep('gender');
    } else if (currentStep === 'physicalInfo') {
      setCurrentStep('birthDate');
    }
  };

  const getStepInfo = () => {
    switch (currentStep) {
      case 'gender':
        return { step: 1, total: 3, title: '성별을\n선택해주세요' };
      case 'birthDate':
        return { step: 2, total: 3, title: '생년월일을\n입력해주세요' };
      case 'physicalInfo':
        return { step: 3, total: 3, title: '키와 체중을\n입력해주세요' };
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
            <GenderSelect
              value={formData.gender}
              onChange={(gender) => {
                setFormData(prev => ({ ...prev, gender }));
                setError('');
              }}
              error={error}
            />
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
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-[#BDB2DD] text-white font-medium rounded-[20px] transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>처리 중...</span>
              </div>
            ) : currentStep === 'physicalInfo' ? (
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