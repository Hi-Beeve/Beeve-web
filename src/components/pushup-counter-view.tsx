'use client';

import { useSearchParams } from 'next/navigation';
import { PushupType } from '@/types/pushup';
import { PushupDetector } from '@/components/pushup-counter';
import { PushupTypeSelector } from '@/components/pushup-type-selector';
import arrowLeft from '../../public/arrow_left.svg';
import Image from 'next/image';

export default function PushupCounterView() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const handleClickBack = () => {
    window.history.back();
  }
  return (
    <div className="relative">
      {/* 헤더 */}
      <div className="flex items-start justify-start px-4 py-3 ">
        <div className="w-6"></div>
        <div onClick={handleClickBack}>

        <Image src={arrowLeft} width={24} height={24} alt="arrow-left" />
        </div>
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
