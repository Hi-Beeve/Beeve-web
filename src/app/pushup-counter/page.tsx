'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PushupType } from '@/types/pushup';
import { PushupDetector } from '@/components/pushup-counter';
import { PushupTypeSelector } from '@/components/pushup-type-selector';

export default function PushupCounterPage() {
  const [selectedType, setSelectedType] = useState<PushupType | null>(null);

  const handleTypeSelect = (type: PushupType) => {
    setSelectedType(type);
  };

  const handleBack = () => {
    setSelectedType(null);
  };


  return (
    <div className="relative">
        {/* 헤더 */}
        <div className=" bg-gray-900 text-white flex items-center justify-between px-4 py-3 border-b border-gray-200">
        {
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        }
        <h1 className="text-xl font-bold flex-1 text-center">근력 측정</h1>
        <div className="w-6"></div>
      </div>
      
      {selectedType ? (
        <PushupDetector type={selectedType} onBack={handleBack} />
      ) : (
        <PushupTypeSelector onSelect={handleTypeSelect} />
      )}
    </div>
  );
}
