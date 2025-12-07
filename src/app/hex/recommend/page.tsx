"use client";

import RecommendHexSection from "@/components/recommend/RecommendHexSection";
import { useHex } from "@/api/hex/useHex";
import { RecommendCard, WorkoutType } from '@/components/recommend/RecommendCard';
import { FONT_STYLES } from '@/styles/fontStyles';
import { useMember } from "@/api/mypage/useMypage";
import { useRecommend } from "@/api/recommend/useRecommend";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image"
import calendar_icon from "../../../../public/calendar.svg"

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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { getRecommendation, isLoading: isRecommendLoading, data: recommendData, error: recommendError } = useRecommend();
  const [hasRequestedRecommendation, setHasRequestedRecommendation] = useState(false);

  // 사용자 정보가 로드된 후 추천 데이터 가져오기 (한 번만)
  useEffect(() => {
    // 인증 로딩 중이거나 사용자 정보가 없거나 이미 요청했으면 실행하지 않음
    if (authLoading || !isAuthenticated || !user || hasRequestedRecommendation) {
      return;
    }

    const fetchRecommendation = async () => {
      try {
        setHasRequestedRecommendation(true);
        await getRecommendation({
          contraindications: "",
          measurePlace: ""
        });
      } catch (error) {
        console.error('추천 데이터 가져오기 실패:', error);
        setHasRequestedRecommendation(false); // 실패 시 다시 시도할 수 있도록
      }
    };

    fetchRecommendation();
  }, [authLoading, isAuthenticated, user, hasRequestedRecommendation]);

  // 오늘 날짜를 기본값으로 설정
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const { data, isLoading, error } = useHex({ date: getTodayDate() });

  if (isLoading || authLoading) {
    return (
      <div className="w-full pt-10 px-5 pb-10 flex justify-center items-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full pt-10 px-5 pb-10 flex justify-center items-center">
        <div>데이터를 불러오는데 실패했습니다.</div>
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
        <div className="mt-6 bg-white rounded-[20px] px-4 py-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded flex items-center justify-center">
              <Image src={calendar_icon} width={20} height={18} alt="calendar_icon" />
            </div>
            <h2 className={`${FONT_STYLES.heading4} text-gray-900`}>
              AI 맞춤 운동 스케줄
            </h2>
          </div>

          {/* 운동 카드 리스트 */}
          <div className="space-y-4">
            {isRecommendLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">AI 운동 추천을 생성 중입니다...</div>
              </div>
            ) : recommendData?.workout_plan ? (
              // 실제 추천 데이터 표시
              recommendData.workout_plan.map((plan, index) => {
                const workoutType: WorkoutType = plan.focus.includes('상체') ? 'upper' : 
                                               plan.focus.includes('하체') ? 'lower' : 'balance';
                return (
                  <RecommendCard
                    key={index}
                    type={workoutType}
                    title={`${plan.focus} • ${plan.day}`}
                    exercises={plan.exercises.map(ex => ({
                      name: ex.name,
                      count: `${ex.sets}세트 ${ex.reps}회`
                    }))}
                  />
                );
              })
            ) : (
              // 목 데이터 표시
              mockRecommendData.map((item, index) => (
                <RecommendCard
                  key={index}
                  type={item.type}
                  title={item.title}
                  exercises={item.exercises}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}