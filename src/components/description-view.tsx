'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EXERCISE_GUIDES, ExerciseGuide } from '@/config/exercise-guides';
import { FONT_STYLES } from '@/styles/fontStyles';
import Image from 'next/image';

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
      <div className="flex items-center justify-center h-screen">
        <p>운동 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-screen p-8 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto">
        <div className='w-full flex flex-col justify-center items-center py-12 px-7 gap-2'>

       <div className='bg-[#BDB2DD] w-[100px] h-[100px] rounded-full flex justify-center items-center'>
        {/* 운동별 아이콘 */}
        <Image src={guide.icon} alt="exercise-icon" width={50} height={50} />
       </div>
       <h1 className={FONT_STYLES.heading32}>{guide.title}</h1>
        
        </div>
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
          <div className="bg-[#F5F5F5] p-6 rounded-lg">
            <h2 className="text-xs mb-4 pb-2 text-[#767676]">측정 방법</h2>
            <ul className="list-decimal list-inside space-y-3">
              {guide.instructions.map((desc, index) => (
                <div key={index} className='flex gap-2 text-[14px] text-black'><div className="bg-[#BDB2DD] h-6 min-w-6 text-[12px] rounded-full flex justify-center items-center">{index + 1}</div>{desc}</div>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center mt-10 fixed bottom-6 left-6 right-6">
          <button 
            onClick={handleStart}
            className={`w-full bg-[#BDB2DD] text-white py-4 px-8 rounded-[20px] transition-transform transform ${FONT_STYLES.body5}`}
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
