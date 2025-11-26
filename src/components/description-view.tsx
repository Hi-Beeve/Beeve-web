'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EXERCISE_GUIDES, ExerciseGuide, Precaution } from '@/config/exercise-guides';

export default function DescriptionView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [guide, setGuide] = useState<ExerciseGuide | null>(null);
  const [exerciseKey, setExerciseKey] = useState<string | null>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    const subtype = searchParams.get('subtype');
    const key = subtype ? `${type}-${subtype}` : type;

    if (key && EXERCISE_GUIDES[key]) {
      setGuide(EXERCISE_GUIDES[key]);
      setExerciseKey(key);
    } else {
      // 유효하지 않은 타입일 경우 홈페이지로 리디렉션
      router.replace('/');
    }
  }, [searchParams, router]);

  const handleStart = () => {
    if (exerciseKey) {
      if (exerciseKey.startsWith('pushup')) {
        const subtype = exerciseKey.split('-')[1];
        router.push(`/measurement/pushup-counter?type=${subtype}`);
      } else if (exerciseKey === 'step') {
        router.push('/measurement/step-test');
      } else if (exerciseKey === 'standing-jump') {
        router.push('/measurement/standing-jump');
      } else if (exerciseKey === 'reaction-time') {
        router.push('/measurement/reaction-time');
      } else if (exerciseKey === 'sit-and-reach') {
        router.push('/measurement/sit-and-reach-test');
      } else {
        router.push(`/measurement/${exerciseKey}-counter`);
      }
    }
  };

  if (!guide) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-gray-900">
        <p>운동 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-gray-900 p-6 overflow-y-auto">
      <div className="w-full max-w-md mx-auto">
        {/* Header with icon and title */}
        <div className="flex flex-col items-center mb-8 mt-8">
          <div className="w-20 h-20 bg-purple-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 7.5V9M15 11.5V9.5L21 9V11L15 11.5M3 7V9L9 8.5V7M9 11V9L3 9V11L9 11M12 7.5C11.2 7.5 10.5 7.26 10 6.76L8.5 8.26C9.24 8.95 10.11 9.5 11.06 9.81L10.5 11.5C10.5 11.5 10.5 11.5 10.5 11.5L12 12L13.5 11.5C13.5 11.5 13.5 11.5 13.5 11.5L12.94 9.81C13.89 9.5 14.76 8.95 15.5 8.26L14 6.76C13.5 7.26 12.8 7.5 12 7.5Z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{guide.title}</h1>
          <p className="text-gray-500 text-sm">상대악력(kg)</p>
        </div>

        {/* Instructions section */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6 text-gray-900">측정방법</h2>
          <div className="space-y-4">
            {guide.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1 pt-1">
                  {instruction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Start button */}
        <div className="text-center">
          <button 
            onClick={handleStart}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
