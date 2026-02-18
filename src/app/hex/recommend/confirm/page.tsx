'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProgressBar } from '@/components/progress_bar';
import { FONT_STYLES } from '@/styles/fontStyles';
import { useMember } from '@/api/mypage/useMypage';
import { useGetExerciseInfo } from '@/api/exercise-info/useExerciseInfo';
import { createRecommendApi } from '@/api/recommend/recommend.api';

type Step = 1 | 2 | 3;

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get('date') ?? '';

  const [step, setStep] = useState<Step>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');

  const { data: member, isLoading: memberLoading } = useMember();
  const { data: exerciseInfo, isLoading: exerciseLoading } = useGetExerciseInfo();

  const name = member?.name ?? '';

  const calcAge = (birthDate: string) => {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const genderLabel = (g: string) => (g === 'M' ? '남성' : g === 'F' ? '여성' : g);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      await createRecommendApi(date);
      setIsComplete(true);
    } catch {
      setError('추천 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStep3Enter = () => {
    setStep(3);
    setTimeout(() => handleGenerate(), 0);
  };

  const healthStatus = () => {
    const parts: string[] = [];
    if (exerciseInfo?.disease) parts.push(exerciseInfo.disease);
    if (exerciseInfo?.injury) parts.push(exerciseInfo.injury);
    return parts.length > 0 ? parts.join(', ') : '없음';
  };

  if (memberLoading || exerciseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-72px)] px-5 pt-5">
      <ProgressBar stepInfo={{ step, total: 3 }} />

      {/* Step 1: 신체정보 확인 */}
      {step === 1 && (
        <div className="flex flex-col flex-1">
          <div className="flex flex-col items-start pt-10 pb-8">
            <h1 className={`mb-2 ${FONT_STYLES.heading28} whitespace-pre-line`}>
              {`${name}님의\n신체정보를 확인해주세요.`}
            </h1>
          </div>

          <div className="bg-[#F5F5F5] rounded-[20px] px-5 py-6 space-y-4">
            <InfoRow label="이름" value={name} />
            <InfoRow label="성별" value={genderLabel(member?.gender ?? '')} />
            <InfoRow label="나이" value={`${calcAge(member?.birthDate ?? '')}세`} />
            <InfoRow label="키" value={`${member?.height ?? '-'}cm`} />
            <InfoRow label="몸무게" value={`${member?.weight ?? '-'}kg`} />
          </div>

          <div className="flex-1" />

          <div className="flex gap-4 pb-5 h-[56px]">
            <button
              onClick={() => router.push('/mypage/edit?from=confirm&date=' + date)}
              className="flex-1 px-4 py-3 bg-[#F5F5F5] text-[#767676] font-medium rounded-[20px]"
            >
              수정하기
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 px-4 py-3 bg-[#BDB2DD] text-white font-medium rounded-[20px]"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 운동정보 확인 */}
      {step === 2 && (
        <div className="flex flex-col flex-1">
          <div className="flex flex-col items-start pt-10 pb-8">
            <h1 className={`mb-2 ${FONT_STYLES.heading28} whitespace-pre-line`}>
              {`${name}님의\n운동정보를 확인해주세요.`}
            </h1>
          </div>

          <div className="bg-[#F5F5F5] rounded-[20px] px-5 py-6 space-y-4">
            <InfoRow label="운동 목표" value={exerciseInfo?.goal ?? '-'} />
            <InfoRow label="운동 장소" value={exerciseInfo?.place ?? '-'} />
            <InfoRow label="운동 장비" value={exerciseInfo?.equipment?.join(', ') ?? '-'} />
            <InfoRow label="건강 상태" value={healthStatus()} />
          </div>

          <div className="flex-1" />

          <div className="flex gap-4 pb-5 h-[56px]">
            <button
              onClick={() => router.push('/mypage/fitness-edit?from=confirm&date=' + date)}
              className="flex-1 px-4 py-3 bg-[#F5F5F5] text-[#767676] font-medium rounded-[20px]"
            >
              수정하기
            </button>
            <button
              onClick={handleStep3Enter}
              className="flex-1 px-4 py-3 bg-[#BDB2DD] text-white font-medium rounded-[20px]"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step 3: AI 추천 생성 */}
      {step === 3 && (
        <div className="flex flex-col flex-1">
          <div className="flex flex-col items-center justify-center flex-1">
            {isGenerating && (
              <>
                <div className="w-12 h-12 border-4 border-[#BDB2DD] border-t-transparent rounded-full animate-spin mb-6" />
                <p className={`${FONT_STYLES.body2} text-gray-600 text-center`}>
                  당신의 데이터를 분석중입니다.
                </p>
              </>
            )}

            {isComplete && !error && (
              <h1 className={`${FONT_STYLES.heading28} text-center whitespace-pre-line`}>
                {`${name}님의 맞춤 운동 프로그램\n생성을 완료했습니다!`}
              </h1>
            )}

            {error && (
              <p className={`${FONT_STYLES.body2} text-red-500 text-center`}>
                {error}
              </p>
            )}
          </div>

          {/* 완료/에러 시 하단 버튼 */}
          {isComplete && !error && (
            <div className="pb-5 h-[56px]">
              <button
                onClick={() => router.push('/hex/recommend')}
                className="w-full px-4 py-3 bg-[#BDB2DD] text-white font-medium rounded-[20px]"
              >
                확인
              </button>
            </div>
          )}
          {error && (
            <div className="pb-5 h-[56px]">
              <button
                onClick={handleGenerate}
                className="w-full px-4 py-3 bg-[#BDB2DD] text-white font-medium rounded-[20px]"
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`${FONT_STYLES.body6} text-[#767676]`}>{label}</span>
      <span className={`${FONT_STYLES.body5}`}>{value}</span>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-400">로딩 중...</div>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
