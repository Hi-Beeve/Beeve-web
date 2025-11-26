'use client';

import { BackHeader } from '@/components/common/BackHeader';
import { SitupDetector } from '@/components/situp-counter';

export default function SitupCounterPage() {
  const handleClickBack = () => {
    window.history.back();
  }
  return (
    <div className="relative">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3">
        <BackHeader handleClickBack={handleClickBack} />
        <div className="w-6"></div>
      </div>
      
      <SitupDetector />
    </div>
  );
}
