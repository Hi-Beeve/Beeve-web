'use client';

import { SitupDetector } from '@/components/situp-counter';
import Link from 'next/link';

export default function SitupCounterPage() {
  return (
    <div className="relative">
      {/* 헤더 */}
      <div className="bg-gray-900 text-white flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <Link
          href="/"
          className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold flex-1 text-center">싯업 측정</h1>
        <div className="w-6"></div>
      </div>
      
      <SitupDetector />
    </div>
  );
}
