'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { PushupType } from '@/types/pushup';
import { PushupDetector } from '@/components/pushup-counter';
import { PushupTypeSelector } from '@/components/pushup-type-selector';
import { BackHeader } from './common/BackHeader';

export default function PushupCounterView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type');
  const handleClickBack = () => {
    router.push('/measurement');
  }
  return (
    <div className="relative">
      {/* 헤더 */}
      <div className="flex items-start justify-start px-4 py-3 ">
        <BackHeader handleClickBack={handleClickBack} />
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
