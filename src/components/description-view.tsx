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
      const targetPage = exerciseKey.startsWith('pushup') ? '/pushup-counter' : `/${exerciseKey}-counter`;
      const query = exerciseKey.startsWith('pushup') ? `?type=${exerciseKey.split('-')[1]}` : '';
      router.push(`${targetPage}${query}`);
    }
  };

  if (!guide) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>운동 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-screen bg-gray-900 text-white p-8 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center text-yellow-400">{guide.title} 측정 안내</h1>
        
        <div className="w-full max-w-2xl mx-auto mb-8 rounded-lg overflow-hidden shadow-lg aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${guide.youtubeVideoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            style={{ aspectRatio: '16/9' }}
          ></iframe>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xs font-semibold mb-4 border-b-2 border-gray-700 pb-2">측정 방법</h2>
            <ul className="list-decimal list-inside space-y-3">
              {guide.instructions.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xs font-semibold mb-4 border-b-2 border-gray-700 pb-2 text-red-400">유의사항</h2>
            <ul className="list-disc list-inside space-y-3 text-red-300">
              {guide.precautions.map((item, index) => {
                if (typeof item === 'string') {
                  return <li key={index}>{item}</li>;
                }
                if (typeof item === 'object' && 'text' in item) {
                  const precaution = item as Precaution;
                  return <li key={index} className={precaution.indented ? 'ml-6' : ''}>{precaution.text}</li>;
                }
                return null;
              })}
            </ul>
          </div>
        </div>

        <div className="text-center mt-10">
          <button 
            onClick={handleStart}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-transform transform hover:scale-105 shadow-lg"
          >
            측정 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
