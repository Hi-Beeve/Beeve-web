'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSignUp } from '@/api/auth/useAuth';
import { ClientOAuthInfo, ClientAdditionalInfo } from '@/types/auth';
import { FONT_STYLES } from '@/styles/fontStyles';
import Picker from "react-mobile-picker";
import BottomSheet from '@/components/bottom-sheet';

type FunnelStep = 'gender' | 'birthDate' | 'physicalInfo';

export default function AdditionalInfoPage() {
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

  // 날짜 선택을 위한 상태 (년, 월, 일 분리)
  const [datePickerValue, setDatePickerValue] = useState({
    year: '',
    month: '',
    day: ''
  });

  // Bottom Sheet 상태
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // 날짜 범위 계산 (19세~100세)
  const getDateRanges = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // 19세부터 100세까지
    const minYear = currentYear - 100;
    const maxYear = currentYear - 19;
    
    const years = [];
    for (let year = maxYear; year >= minYear; year--) {
      years.push(year.toString());
    }
    
    const months = [];
    for (let month = 1; month <= 12; month++) {
      months.push(month.toString().padStart(2, '0'));
    }
    
    const getDaysInMonth = (year: number, month: number) => {
      return new Date(year, month, 0).getDate();
    };
    
    const selectedYear = parseInt(datePickerValue.year) || maxYear;
    const selectedMonth = parseInt(datePickerValue.month) || 1;
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day.toString().padStart(2, '0'));
    }
    
    return { years, months, days };
  };

  // 초기 날짜 설정
  useEffect(() => {
    if (!datePickerValue.year) {
      const currentDate = new Date();
      const defaultYear = (currentDate.getFullYear() - 25).toString(); // 기본 25세
      const defaultMonth = '01';
      const defaultDay = '01';
      
      setDatePickerValue({
        year: defaultYear,
        month: defaultMonth,
        day: defaultDay
      });
      
      setFormData(prev => ({
        ...prev,
        birthDate: `${defaultYear}-${defaultMonth}-${defaultDay}`
      }));
    }
  }, [datePickerValue.year]);

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
  }, [isSuccess, signUpData, tempUser, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'height' || name === 'weight' ? parseInt(value) || 0 : value
    }));
  };

  // 날짜 선택 핸들러
  const handleDateChange = (newValue: { year: string; month: string; day: string }) => {
    setDatePickerValue(newValue);
  };

  // 날짜 선택 완료 핸들러
  const handleDateConfirm = () => {
    const birthDate = `${datePickerValue.year}-${datePickerValue.month}-${datePickerValue.day}`;
    setFormData(prev => ({
      ...prev,
      birthDate
    }));
    setIsDatePickerOpen(false);
  };

  // 날짜 포맷팅 함수
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${year}.${month}.${day}`;
  };

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

  // 단계 진행 함수들
  const handleNext = () => {
    setError('');
    
    switch (currentStep) {
      case 'gender':
        if (validateGender()) {
          setCurrentStep('birthDate');
        }
        break;
      case 'birthDate':
        if (validateBirthDate()) {
          setCurrentStep('physicalInfo');
        }
        break;
      case 'physicalInfo':
        if (validatePhysicalInfo()) {
          handleFinalSubmit();
        }
        break;
    }
  };

  const handleBack = () => {
    setError('');
    
    switch (currentStep) {
      case 'birthDate':
        setCurrentStep('gender');
        break;
      case 'physicalInfo':
        setCurrentStep('birthDate');
        break;
    }
  };

  // 단계 정보
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

    // 회원가입 API 호출
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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400">
              {stepInfo.step} / {stepInfo.total}
            </span>
          </div>
          <div className="w-full bg-[#F5F5F5] rounded-full h-1">
            <div 
              className="bg-[#BDB2DD] h-1 rounded-[5px] transition-all duration-300"
              style={{ width: `${(stepInfo.step / stepInfo.total) * 100}%` }}
            />
          </div>
        </div>

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
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-sm">
                {error || (signUpError instanceof Error ? signUpError.message : '회원가입 중 오류가 발생했습니다.')}
              </p>
            </div>
          </div>
        )}

        {/* 단계별 컨텐츠 */}
        <div className="space-y-6">
          {/* 1단계: 성별 선택 */}
          {currentStep === 'gender' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {
                    ['male', 'female'].map((gender) => (
                        <button
                            type="button"
                            onClick={() => {
                                setFormData(prev => ({ ...prev, gender }));
                                setError('');
                            }}
                            className={`px-3 h-14 rounded-[20px] transition-all duration-200 ${
                                formData.gender === gender
                                    ? 'bg-black text-white'
                                    : 'bg-[#F5F5F5] text-[#767676] hover:border-gray-500'
                            }`}
                        >
                            <div className="text-center">
                                <div className="font-medium">{gender === 'male' ? '남성' : '여성'}</div>
                            </div>
                        </button>
                    ))
                }
              </div>
            </div>
          )}

          {/* 2단계: 생년월일 입력 */}
          {currentStep === 'birthDate' && (
            <div className="space-y-6">
              <div
                onClick={() => setIsDatePickerOpen(true)}
                className="w-full px-4 py-4 text-lg bg-[#F5F5F5] rounded-[20px] text-[#767676] cursor-pointer flex items-center justify-between"
              >
                <span>
                  {formData.birthDate ? formatDisplayDate(formData.birthDate) : '연.월.일'}
                </span>
                <svg className="w-5 h-5 text-[#767676]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}

          {/* 3단계: 키와 체중 입력 */}
          {currentStep === 'physicalInfo' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-[13px] font-medium text-[#767676] mb-2">
                    키 (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height || ''}
                    onChange={handleInputChange}
                    placeholder=""
                    min="100"
                    max="250"
                    className="w-full px-4 py-4 text-lg bg-[#F5F5F5] rounded-[20px] text-[#767676] placeholder-[#767676] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#767676] mb-2">
                    체중 (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight || ''}
                    onChange={handleInputChange}
                    placeholder=""
                    min="30"
                    max="200"
                    className="w-full px-4 py-4 text-lg bg-[#F5F5F5] rounded-[20px] text-[#767676] placeholder-[#767676] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
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
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* 날짜 선택 Bottom Sheet */}
      <BottomSheet
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        title="생년월일 선택"
      >
        <div className="pb-4">
          <div className="h-[280px] mb-6">
            <Picker
              height={280}
              itemHeight={40}
              value={datePickerValue}
              onChange={handleDateChange}
            >
              <Picker.Column name="year">
                {getDateRanges().years.map(year => (
                  <Picker.Item key={year} value={year}>
                    <div className="text-center font-medium text-gray-700">
                      {year}년
                    </div>
                  </Picker.Item>
                ))}
              </Picker.Column>
              <Picker.Column name="month">
                {getDateRanges().months.map(month => (
                  <Picker.Item key={month} value={month}>
                    <div className="text-center font-medium text-gray-700">
                      {month}월
                    </div>
                  </Picker.Item>
                ))}
              </Picker.Column>
              <Picker.Column name="day">
                {getDateRanges().days.map(day => (
                  <Picker.Item key={day} value={day}>
                    <div className="text-center font-medium text-gray-700">
                      {day}일
                    </div>
                  </Picker.Item>
                ))}
              </Picker.Column>
            </Picker>
          </div>
          
          {/* 확인 버튼 */}
          <button
            onClick={handleDateConfirm}
            className="w-full px-4 py-3 bg-[#BDB2DD] text-white font-medium rounded-[20px] transition-colors duration-200"
          >
            확인
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
