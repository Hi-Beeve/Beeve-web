'use client'

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useGetExerciseInfo, usePostExerciseInfo } from '@/api/exercise-info/useExerciseInfo';
import { FONT_STYLES } from '@/styles/fontStyles';
import {
  ExerciseGoal,
  ExercisePlace,
  Equipment,
  HealthIssueType,
} from '@/types/exerciseInfo';
import arrowLeft from '../../../../public/arrow_left.svg';

const goalOptions = Object.values(ExerciseGoal);
const placeOptions = Object.values(ExercisePlace);
const equipmentOptions = Object.values(Equipment);

const healthIssueOptions = [
  { label: '없음', value: null },
  { label: '부상', value: HealthIssueType.INJURY },
  { label: '질병', value: HealthIssueType.DISEASE },
] as const;

const FitnessEditContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || 'mypage';
  const date = searchParams.get('date') || '';

  const handleBack = () => {
    if (from === 'confirm') {
      router.push('/hex/recommend/confirm?date=' + date);
    } else if (from === 'recommend') {
      router.push('/hex/recommend');
    } else {
      router.push('/mypage');
    }
  };

  const { data: existingData, isLoading } = useGetExerciseInfo();
  const { postExerciseInfo, isPending } = usePostExerciseInfo();

  const [goal, setGoal] = useState<ExerciseGoal | null>(null);
  const [place, setPlace] = useState<ExercisePlace | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [healthIssueType, setHealthIssueType] = useState<HealthIssueType | null>(null);
  const [healthIssueText, setHealthIssueText] = useState('');

  // 기존 데이터로 폼 초기화
  useEffect(() => {
    if (!existingData) return;

    const matchedGoal = goalOptions.find((g) => g === existingData.goal) || null;
    setGoal(matchedGoal);

    const matchedPlace = placeOptions.find((p) => p === existingData.place) || null;
    setPlace(matchedPlace);

    const matchedEquipment = existingData.equipment
      .map((e) => equipmentOptions.find((opt) => opt === e))
      .filter((e): e is Equipment => !!e);
    setEquipment(matchedEquipment);

    if (existingData.injury) {
      setHealthIssueType(HealthIssueType.INJURY);
      setHealthIssueText(existingData.injury);
    } else if (existingData.disease) {
      setHealthIssueType(HealthIssueType.DISEASE);
      setHealthIssueText(existingData.disease);
    } else {
      setHealthIssueType(null);
      setHealthIssueText('');
    }
  }, [existingData]);

  const isFormValid = goal && place && equipment.length > 0;

  const toggleEquipment = (option: Equipment) => {
    setEquipment((prev) =>
      prev.includes(option)
        ? prev.filter((e) => e !== option)
        : [...prev, option]
    );
  };

  const handleSave = () => {
    if (!goal || !place || equipment.length === 0) return;

    postExerciseInfo(
      {
        goal,
        place,
        equipment,
        ...(healthIssueType && { healthIssueType }),
        ...(healthIssueType && healthIssueText.trim() && { healthIssueText: healthIssueText.trim() }),
      },
      {
        onSuccess: () => {
          handleBack();
        },
        onError: (error) => {
          console.error('운동정보 저장 실패:', error);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 헤더 */}
      <div className="flex flex-col gap-4 items-start p-5 pb-0">
        <button onClick={handleBack}>
          <Image src={arrowLeft} alt="arrow left" width={24} height={24} />
        </button>
        <h1 className={FONT_STYLES.heading28}>운동정보 수정</h1>
      </div>

      {/* 폼 컨텐츠 */}
      <div className="px-5 py-6 space-y-8">
        {/* 운동 목표 */}
        <div>
          <label className="block text-[13px] font-medium text-[#767676] mb-3">
            운동 목표
          </label>
          <div className="flex flex-wrap gap-2">
            {goalOptions.map((option) => (
              <button
                key={option}
                onClick={() => setGoal(option)}
                className={`px-4 py-2.5 rounded-[20px] text-sm transition-colors ${
                  goal === option
                    ? 'bg-black text-white'
                    : 'bg-[#F5F5F5] text-[#767676]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* 운동 장소 */}
        <div>
          <label className="block text-[13px] font-medium text-[#767676] mb-3">
            운동 장소
          </label>
          <div className="flex flex-wrap gap-2">
            {placeOptions.map((option) => (
              <button
                key={option}
                onClick={() => setPlace(option)}
                className={`px-4 py-2.5 rounded-[20px] text-sm transition-colors ${
                  place === option
                    ? 'bg-black text-white'
                    : 'bg-[#F5F5F5] text-[#767676]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* 보유 장비 */}
        <div>
          <label className="block text-[13px] font-medium text-[#767676] mb-3">
            보유 장비
          </label>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map((option) => (
              <button
                key={option}
                onClick={() => toggleEquipment(option)}
                className={`px-4 py-2.5 rounded-[20px] text-sm transition-colors ${
                  equipment.includes(option)
                    ? 'bg-black text-white'
                    : 'bg-[#F5F5F5] text-[#767676]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* 건강 이슈 타입 */}
        <div>
          <label className="block text-[13px] font-medium text-[#767676] mb-3">
            건강 이슈
          </label>
          <div className="flex gap-2">
            {healthIssueOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => {
                  setHealthIssueType(option.value);
                  if (!option.value) setHealthIssueText('');
                }}
                className={`px-4 py-2.5 rounded-[20px] text-sm transition-colors ${
                  healthIssueType === option.value
                    ? 'bg-black text-white'
                    : 'bg-[#F5F5F5] text-[#767676]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 건강 이슈 상세 (타입 선택 시만 표시) */}
        {healthIssueType && (
          <div>
            <label className="block text-[13px] font-medium text-[#767676] mb-3">
              건강 이슈 상세
            </label>
            <input
              type="text"
              value={healthIssueText}
              onChange={(e) => {
                if (e.target.value.length <= 10) {
                  setHealthIssueText(e.target.value);
                }
              }}
              placeholder="상세 내용 입력 (10자 이내)"
              maxLength={10}
              className="w-full px-4 py-4 text-lg bg-[#F5F5F5] rounded-[20px] text-[#767676] placeholder-[#767676] focus:outline-none focus:ring-2 focus:ring-[#BDB2DD] focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-4 left-5 right-5">
        <button
          onClick={handleSave}
          disabled={!isFormValid || isPending}
          className={`w-full px-4 py-4 font-medium rounded-[20px] transition-colors duration-200 ${
            isFormValid && !isPending
              ? 'bg-[#BDB2DD] text-white'
              : 'bg-[#E0E0E0] text-[#999]'
          }`}
        >
          {isPending ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
};

const FitnessEditPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    }>
      <FitnessEditContent />
    </Suspense>
  );
};

export default FitnessEditPage;
