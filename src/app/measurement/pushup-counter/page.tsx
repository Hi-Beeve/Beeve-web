import { Suspense } from 'react';
import PushupCounterView from '@/components/pushup-counter-view';

export default function PushupCounterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-white bg-gray-900">로딩 중...</div>}>
      <PushupCounterView />
    </Suspense>
  );
}

