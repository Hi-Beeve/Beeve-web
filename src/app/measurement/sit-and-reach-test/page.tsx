'use client';
import { BackHeader } from '@/components/common/BackHeader';
import { SitAndReachWall } from '@/components/sit-and-reach-wall';

export default function SitAndReachTestPage() {
  const onBack = () => {
    window.history.back();
  }
  return (
    <div className="min-h-screen">
      <BackHeader handleClickBack={onBack}  />
        <SitAndReachWall />
    </div>
  );
}
