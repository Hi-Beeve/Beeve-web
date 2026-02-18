"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RecommendHexSection from "@/components/recommend/RecommendHexSection";
import { useHex } from "@/api/hex/useHex";
import { RecommendCard, WorkoutType } from '@/components/recommend/RecommendCard';
import { FONT_STYLES } from '@/styles/fontStyles';
import { useRecommend } from "@/api/recommend/useRecommend";
import { useGetExerciseInfo } from "@/api/exercise-info/useExerciseInfo";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image"
import calendar_icon from "../../../../public/calendar.svg"
import WeekDateSelector from "@/components/recommend/WeekDateSelector";

const FITNESS_TYPE_NAMES: Record<string, string> = {
  CARDIO: '심폐지구력',
  ENDURANCE: '근지구력',
  FLEXIBILITY: '유연성',
  STRENGTH: '근력',
  QUICKNESS: '순발력',
  AGILITY: '민첩성',
};

function getWorkoutType(focus: string): WorkoutType {
  if (focus.includes('상체') || focus.includes('근력')) return 'upper';
  if (focus.includes('하체')) return 'lower';
  return 'balance';
}

export default function RecommendPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const { isLoading: isRecommendLoading, data: recommendData, errorMessage, refetch } = useRecommend(selectedDate);
  const { data, isLoading, error } = useHex({ date: selectedDate });
  const { data: exerciseInfo, isLoading: isExerciseInfoLoading, isError: isExerciseInfoError } = useGetExerciseInfo();

  const hasExerciseInfo = !!exerciseInfo && !isExerciseInfoError;

  if (isLoading || authLoading || (isExerciseInfoLoading && !isExerciseInfoError)) {
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

        {/* 주간 날짜 선택 */}
        <WeekDateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

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

          {/* 추천 요약 정보 */}
          {recommendData && (
            <div className="bg-purple-50 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm text-purple-700 font-medium">
                집중 개선: {FITNESS_TYPE_NAMES[recommendData.targetFitnessType] || recommendData.targetFitnessType}
                {' · '}총 {recommendData.totalDuration}분{' · '}강도 {recommendData.rpe}/10
              </p>
            </div>
          )}

          {/* AI 코멘트 */}
          {recommendData?.notes && (
            <div className="bg-blue-50 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm text-gray-700">{recommendData.notes}</p>
            </div>
          )}

          {/* 운동 카드 리스트 */}
          <div className="space-y-4">
            {isRecommendLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
                <div className="text-gray-500 mt-3">AI가 맞춤 운동을 추천하고 있습니다...</div>
              </div>
            ) : recommendData?.workout_plan ? (
              recommendData.workout_plan.map((plan, index) => (
                <RecommendCard
                  key={index}
                  type={getWorkoutType(plan.focus)}
                  day={plan}
                  dayIndex={index}
                />
              ))
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-gray-500">
                  {!hasExerciseInfo
                    ? '운동 정보를 먼저 입력해주세요.'
                    : '아직 추천받은 운동이 없습니다.'}
                </p>

                {/* 운동 정보 입력하기 버튼 (운동정보 미입력 시) */}
                {!hasExerciseInfo && (
                  <button
                    onClick={() => router.push('/mypage/fitness-edit?from=recommend')}
                    className="w-full px-4 py-3 bg-[#BDB2DD] text-white font-medium rounded-[20px] transition-colors duration-200"
                  >
                    운동 정보 입력하기
                  </button>
                )}

                {/* 맞춤 운동 추천 받기 버튼 */}
                <button
                  onClick={() => router.push('/hex/recommend/confirm?date=' + selectedDate)}
                  disabled={!hasExerciseInfo}
                  className={`w-full px-4 py-3 font-medium rounded-[20px] transition-colors duration-200 ${
                    hasExerciseInfo
                      ? 'bg-black text-white'
                      : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed'
                  }`}
                >
                  맞춤 운동 추천 받기
                </button>
              </div>
            )}
          </div>

          {/* 새로고침 버튼 */}
          {recommendData && (
            <div className="mt-4 text-center">
              <button
                onClick={() => refetch()}
                className="px-5 py-2.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
              >
                새로운 추천 받기
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
