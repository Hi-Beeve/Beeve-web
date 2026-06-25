"use client";

import { useState, useEffect } from "react";
import { CheckListCard } from "@/components/check-list-card";
import { getMeasurementCompletions } from "@/utils/measurement-storage";
import { FitnessIconType } from "@/components/fitness-icon";
import { usePostTestDataMutation } from "@/api/hex/queries";
import { TestDataRequest } from "@/types/hex";
import { useRouter } from "next/navigation";

interface MeasurementItem {
  id: string;
  title: string;
  subtitle: string;
  icon: FitnessIconType;
  href: string;
}

const MEASUREMENT_ITEMS: MeasurementItem[] = [
  {
    id: "muscle",
    title: "근력",
    subtitle: "(측정시간) 1분", // 측정 완료 시 이곳에 데이터 추가 
    icon: "STRENGTH",
    href: "/measurement/pushup-counter"
  },
  {
    id: "endurance",
    title: "근지구력",
    subtitle: "(측정시간) 1분", // 측정 완료 시 이곳에 데이터 추가 
    icon: "ENDURANCE",
    href: "/measurement/description?type=situp"
  },
  {
    id: "cardio",
    title: "심폐지구력",
    subtitle: "(측정시간) 4분",
    icon: "CARDIO",
    href: "/measurement/description?type=step"
  },
  {
    id: "flexibility",
    title: "유연성",
    subtitle: "(측정시간) 3분",
    icon: "FLEXIBILITY",
    href: "/measurement/description?type=sit-and-reach"
  },
  {
    id: "agility",
    title: "민첩성",
    subtitle: "(측정시간) 3분",
    icon: "AGILITY",
    href: "/measurement/description?type=reaction-time"
  },
  {
    id: "quickness",
    title: "순발력",
    subtitle: "(측정시간) 3분",
    icon: "QUICKNESS",
    href: "/measurement/description?type=standing-jump"
  }
];

export default function MeasurementPage() {
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rpe, setRpe] = useState<number | null>(null);
  const router = useRouter();
  const postTestDataMutation = usePostTestDataMutation();

  useEffect(() => {
    // 로컬 스토리지에서 완료된 측정 항목들을 불러옴
    const completions = getMeasurementCompletions();
    console.log('📊 측정 완료 상태 확인:', completions);
    console.log('📊 localStorage completedMeasurements:', localStorage.getItem('completedMeasurements'));
    console.log('📊 localStorage measurement_agility:', localStorage.getItem('measurement_agility'));
    setCompletedItems(completions);
  }, []);

  // 페이지가 포커스될 때마다 완료 상태 새로고침
  useEffect(() => {
    const handleFocus = () => {
      const completions = getMeasurementCompletions();
      console.log('📊 페이지 포커스 - 완료 상태 새로고침:', completions);
      setCompletedItems(completions);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleItemClick = (item: MeasurementItem) => {
    // 측정 페이지로 이동
    window.location.href = item.href;
  };

  const isCompleted = (itemId: string) => {
    return completedItems.includes(itemId);
  };

  const collectMeasurementData = (): TestDataRequest => {
    // 로컬 스토리지에서 측정 데이터 수집
    const preSurvey = JSON.parse(localStorage.getItem('preSurvey') || '{}');
    
    // 실제로 측정한 푸시업 종류만 확인
    const wallPushUpReps = localStorage.getItem('measurement_pushup_wall');
    const kneePushUpReps = localStorage.getItem('measurement_pushup_knee');
    const standardPushUpReps = localStorage.getItem('measurement_pushup_standard');
    
    // 기본 측정 데이터
    const testData: Partial<TestDataRequest> = {
      measurePlace: preSurvey.place || 'HOME',
      stepTestRecoveryBpm: parseInt(localStorage.getItem('measurement_cardio') || '0'),
      crossCrunchReps: parseInt(localStorage.getItem('measurement_endurance') || '0'),
      sitAndReach: parseFloat(localStorage.getItem('measurement_flexibility') || '0'),
      reactionTime: parseFloat(localStorage.getItem('measurement_agility') || '0'),
      flightTime: parseFloat(localStorage.getItem('measurement_quickness') || '0'),
      rpe: rpe || 5,
    };
    
    // 실제로 측정한 푸시업 종류만 추가
    if (wallPushUpReps) {
      testData.wallPushUpReps = parseInt(wallPushUpReps);
    }
    if (kneePushUpReps) {
      testData.kneePushUpReps = parseInt(kneePushUpReps);
    }
    if (standardPushUpReps) {
      testData.standardPushUpReps = parseInt(standardPushUpReps);
    }
    
    // 실제로 측정한 푸시업 종류 로깅
    const measuredPushupTypes = [];
    if (wallPushUpReps) measuredPushupTypes.push(`벽 푸시업: ${wallPushUpReps}개`);
    if (kneePushUpReps) measuredPushupTypes.push(`무릎 푸시업: ${kneePushUpReps}개`);
    if (standardPushUpReps) measuredPushupTypes.push(`표준 푸시업: ${standardPushUpReps}개`);
    
    console.log('📊 측정된 푸시업 종류:', measuredPushupTypes.length > 0 ? measuredPushupTypes : '없음');
    console.log('📊 수집된 측정 데이터:', testData);
    return testData as TestDataRequest;
  };

  // 🧪 개발용: 임의 측정 데이터 채우기
  const fillMockData = () => {
    // 각 측정 항목에 임의 데이터 설정
    localStorage.setItem('measurement_pushup_wall', '25');
    localStorage.setItem('measurement_endurance', '30');      // 크로스크런치 횟수
    localStorage.setItem('measurement_cardio', '85');          // 심박수 BPM
    localStorage.setItem('measurement_flexibility', '15.5');   // 앉아윗몸앞으로굽히기 cm
    localStorage.setItem('measurement_agility', '0.35');       // 반응시간 초
    localStorage.setItem('measurement_quickness', '0.45');     // 체공시간 초
    localStorage.setItem('preSurvey', JSON.stringify({ place: 'HOME' }));

    // 모든 측정 항목을 완료 처리
    const allIds = MEASUREMENT_ITEMS.map(item => item.id);
    localStorage.setItem('completedMeasurements', JSON.stringify(allIds));
    setCompletedItems(allIds);
    setRpe(7);

    console.log('🧪 임의 측정 데이터가 설정되었습니다.');
    alert('임의 측정 데이터가 채워졌습니다!');
  };

  const isAllCompleted = completedItems.length === MEASUREMENT_ITEMS.length && rpe !== null;

  const handleSubmitResults = async () => {
    if (!isAllCompleted) {
      alert('모든 측정과 운동 강도를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const testData = collectMeasurementData();
      await postTestDataMutation.mutateAsync(testData);
      router.push('/measurement/result');
    } catch (error) {
      console.error('측정 데이터 전송 실패:', error);
      if (confirm('데이터 전송에 실패했습니다. 다시 시도하시겠습니까?')) {
        handleSubmitResults(); // 재시도
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-[120px] overflow-auto">
      {/* 헤더 */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-black">Beeve</h1>
        <h2 className="text-lg font-medium text-black mt-2">체력 측정하기</h2>
      </div>

      {/* STEP 1. 근체력 */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-semibold text-black mb-4">STEP 1. 건강체력</h3>
        <div className="space-y-3">
          {MEASUREMENT_ITEMS.slice(0, 4).map((item) => (
            <CheckListCard
              key={item.id}
              text={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              isChecked={isCompleted(item.id)}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </div>

      {/* STEP 2. 운동체력 */}
      <div className="px-4 mb-8 pb-20">
        <h3 className="text-lg font-semibold text-black mb-4">STEP 2. 운동체력</h3>
        <div className="space-y-3">
          {MEASUREMENT_ITEMS.slice(4).map((item) => (
            <CheckListCard
              key={item.id}
              text={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              isChecked={isCompleted(item.id)}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </div>

      {/* STEP 3. 운동 강도 */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-semibold text-black mb-2">STEP 3. 운동 강도</h3>
        <p className="text-sm text-gray-500 mb-4">오늘 체력 측정의 힘든 정도를 선택해주세요 (RPE)</p>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
            <button
              key={value}
              className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                rpe === value
                  ? 'bg-[#BDB2DD] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setRpe(value)}
            >
              {value}
            </button>
          ))}
        </div>
        {rpe !== null && (
          <p className="mt-3 text-sm text-[#8B7BB5] font-medium">
            선택한 강도: {rpe} / 10
            {rpe <= 3 && ' (가벼움)'}
            {rpe >= 4 && rpe <= 6 && ' (보통)'}
            {rpe >= 7 && rpe <= 8 && ' (힘듦)'}
            {rpe >= 9 && ' (매우 힘듦)'}
          </p>
        )}
      </div>

      {/* 심사용: 임의 데이터 채우기 버튼 */}
      <div className="px-4 mb-4">
        <button
          className="w-full h-10 rounded-lg border-2 border-dashed border-orange-400 text-orange-500 text-sm font-medium"
          onClick={fillMockData}
        >
          Fill with test data (for review)
        </button>
      </div>

      {/* 결과 확인 버튼 */}
      <div className="fixed bottom-6 left-6 right-6">
        <button 
          className={`w-full h-14 rounded-[20px] font-medium ${
            isAllCompleted 
              ? 'bg-[#BDB2DD] text-white' 
              : 'bg-gray-300 text-gray-500'
          }`}
          onClick={handleSubmitResults}
          disabled={isSubmitting || !isAllCompleted}
        >
          {isSubmitting 
            ? '데이터 전송 중...' 
            : isAllCompleted 
              ? '6각형 체력 결과 확인하기'
              : '다음'
          }
        </button>
      </div>
    </div>
  );
}
