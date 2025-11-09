'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// 운동별 설명 내용을 위한 타입 정의
interface DescriptionContent {
  title: string;
  descriptions: string[];
  imageUrl: string;
}

// 운동 종류별 설명 데이터
const contents: { [key: string]: DescriptionContent } = {
  situp: {
    title: '윗몸일으키기 측정 안내',
    descriptions: [
      '바닥에 누워 무릎을 구부리고 발바닥을 바닥에 고정하세요.',
      '양손은 귀에 대거나 가슴에 교차시킵니다.',
      '상체를 일으켜 팔꿈치가 무릎에 닿게 한 후, 다시 시작 자세로 돌아갑니다.',
      '정확한 자세로 1분간 최대한 많이 반복하세요.',
    ],
    imageUrl: '/images/situp-guide.png', // 예시 이미지 경로
  },
  pushup: {
    title: '팔굽혀펴기 측정 안내',
    descriptions: [
      '어깨너비보다 약간 넓게 손을 바닥에 짚습니다.',
      '몸은 머리부터 발끝까지 일직선을 유지해야 합니다.',
      '가슴이 바닥에 닿기 직전까지 몸을 내렸다가, 팔을 완전히 펴서 시작 자세로 돌아옵니다.',
      '정확한 자세로 1분간 최대한 많이 반복하세요.',
    ],
    imageUrl: '/images/pushup-guide.png', // 예시 이미지 경로
  },
};

export default function DescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [content, setContent] = useState<DescriptionContent | null>(null);
  const [exerciseType, setExerciseType] = useState<string | null>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type && contents[type]) {
      setContent(contents[type]);
      setExerciseType(type);
    } else {
      // 유효하지 않은 타입일 경우 홈페이지로 리디렉션
      router.replace('/');
    }
  }, [searchParams, router]);

  const handleStart = () => {
    if (exerciseType) {
      router.push(`/${exerciseType}-counter`);
    }
  };

  if (!content) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>운동 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-yellow-400">{content.title}</h1>
      
      {/* 가이드 이미지 (예시) - 실제 이미지 파일이 public/images/ 에 있어야 합니다. */}
      {/* <img src={content.imageUrl} alt={`${exerciseType} guide`} className="w-64 h-64 mb-8 rounded-lg object-cover" /> */}

      <div className="text-left max-w-md bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">운동 방법</h2>
        <ul className="list-disc list-inside space-y-2">
          {content.descriptions.map((desc, index) => (
            <li key={index}>{desc}</li>
          ))}
        </ul>
      </div>

      <button 
        onClick={handleStart}
        className="mt-12 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-transform transform hover:scale-105"
      >
        측정 시작하기
      </button>
    </div>
  );
}
