import { Suspense } from 'react';
import DescriptionView from '@/components/description-view';

export default function DescriptionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-900 text-white"><p>로딩 중...</p></div>}>
      <DescriptionView />
    </Suspense>
  );
}
