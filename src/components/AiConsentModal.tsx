'use client';

import { useState } from 'react';
import { useUpdateAiConsent } from '@/api/mypage/useMypage';

interface AiConsentModalProps {
  onConsent: () => void;
  onCancel: () => void;
}

export function AiConsentModal({ onConsent, onCancel }: AiConsentModalProps) {
  const { updateAiConsent, isPending } = useUpdateAiConsent();

  const handleConsent = () => {
    updateAiConsent(true, {
      onSuccess: () => onConsent(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
      <div className="bg-white rounded-[20px] w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">AI 서비스 이용 동의</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          맞춤 운동 프로그램 생성을 위해 회원님의{' '}
          <strong>신체 정보(이름, 성별, 나이, 키, 몸무게), 운동 목표, 부상·질병 정보</strong>를{' '}
          <strong>Google Gemini AI</strong>로 전송합니다.{'\n'}
          제공된 데이터는 운동 추천 생성 목적으로만 사용됩니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-[14px] bg-gray-100 text-gray-600 text-sm font-medium"
          >
            취소
          </button>
          <button
            onClick={handleConsent}
            disabled={isPending}
            className="flex-1 h-12 rounded-[14px] bg-[#BDB2DD] text-white text-sm font-medium disabled:opacity-50"
          >
            {isPending ? '처리 중...' : '동의하고 시작하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
