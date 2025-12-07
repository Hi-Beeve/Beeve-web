"use client";

import RecommendHexSection from "@/components/recommend/RecommendHexSection";
import { useHex } from "@/api/hex/useHex";
import { RecommendCard, WorkoutType } from '@/components/recommend/RecommendCard';
import { FONT_STYLES } from '@/styles/fontStyles';

// 목 데이터
const mockRecommendData = [
  {
    type: 'upper' as WorkoutType,
    title: '상체 • 세션',
    exercises: [
      { name: '윗몸 일으키기', count: '30개 / 3세트' },
      { name: '물 다운', count: '15개 / 3세트' },
      { name: '물 업', count: '30개 / 3세트' }
    ]
  },
  {
    type: 'lower' as WorkoutType,
    title: '하체 • 세션',
    exercises: [
      { name: '런지', count: '20개 / 5세트' },
      { name: '스쿼트', count: '20개 / 5세트' },
      { name: '벽 몸 다운', count: '20개 / 5세트' }
    ]
  },
  {
    type: 'balance' as WorkoutType,
    title: '밸런스 • 세션',
    exercises: [
      { name: '플랭크', count: '1분 / 4세트' },
      { name: '버피테스트', count: '15개 / 3세트' },
      { name: '등받기', count: '50개 / 3세트' }
    ]
  }
];

export default function RecommendPage() {
  // 오늘 날짜를 기본값으로 설정
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const { data, isLoading, error } = useHex({ date: getTodayDate() });

  if (isLoading) {
    return (
      <div className="w-full pt-10 px-5 pb-10 flex justify-center items-center">
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full pt-10 px-5 pb-10 flex justify-center items-center">
      </div>
    );
  }

  return (
    <main className="w-full pb-10">
      <div className="w-full">
        {/* 제목 */}
        <div className="pt-2 pb-4">
          <h1 className={`${FONT_STYLES.heading2} text-gray-900`}>운동추천</h1>
        </div>

        {/* 육각형 차트 섹션 */}
        <RecommendHexSection data={data} />

        {/* AI 맞춤 운동 스케줄 섹션 */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
              <span className="text-white text-xs">📅</span>
            </div>
            <h2 className={`${FONT_STYLES.heading4} text-gray-900`}>
              AI 맞춤 운동 스케줄
            </h2>
          </div>

          {/* 운동 카드 리스트 */}
          <div className="space-y-4">
            {mockRecommendData.map((item, index) => (
              <RecommendCard
                key={index}
                type={item.type}
                title={item.title}
                exercises={item.exercises}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}