'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSignUp } from '@/api/auth/useAuth';
import { ClientOAuthInfo, ClientAdditionalInfo } from '@/types/auth';

export default function AdditionalInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { signUp, isLoading, error: signUpError, data: signUpData, isSuccess } = useSignUp();
  
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
      router.push('/');
    }
  }, [isSuccess, signUpData, tempUser, router]); // login 제거

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'height' || name === 'weight' ? parseInt(value) || 0 : value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.birthDate) {
      setError('생년월일을 입력해주세요.');
      return false;
    }
    if (!formData.gender) {
      setError('성별을 선택해주세요.');
      return false;
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm() || !tempUser) {
      return;
    }

    // 회원가입 API 호출
    signUp(tempUser, formData);
  };

  if (!tempUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {tempUser.profileImage ? (
              <img 
                src={tempUser.profileImage} 
                alt="프로필" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-xl font-bold">
                {tempUser.nickname?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {tempUser.nickname}님,<br />추가 정보를 입력해주세요
          </h1>
          <p className="text-gray-400">
            맞춤형 운동 분석을 위해 필요한 정보입니다
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

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              생년월일
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              성별
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">선택해주세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>

          {/* 키와 체중 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                키 (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height || ''}
                onChange={handleInputChange}
                placeholder="160"
                min="100"
                max="250"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                체중 (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight || ''}
                onChange={handleInputChange}
                placeholder="52"
                min="30"
                max="200"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>회원가입 중...</span>
              </div>
            ) : (
              '가입 완료'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
