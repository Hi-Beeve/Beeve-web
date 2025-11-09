'use client';

import { useSearchParams } from 'next/navigation';
import { PushupType } from '@/types/pushup';
import { PushupDetector } from '@/components/pushup-counter';
import { PushupTypeSelector } from '@/components/pushup-type-selector';

export default function PushupCounterView() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  return (
    <div className="relative">
      {/* 헤더 */}
      <div className="bg-gray-900 text-white flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="w-6"></div>
        <h1 className="text-xl font-bold flex-1 text-center">근력 측정</h1>
        <div className="w-6"></div>
      </div>
      {type ? (
        <PushupDetector type={type as PushupType} />
      ) : (
        <PushupTypeSelector />
      )}
    </div>
  );
}
