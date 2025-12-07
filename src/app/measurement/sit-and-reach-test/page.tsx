'use client';
import { BackHeader } from '@/components/common/BackHeader';
import { SitAndReachWall } from '@/components/sit-and-reach-wall';

export default function SitAndReachTestPage() {
  const onBack = () => {
    window.history.back();
  }
  return (
    <div className="min-h-screen ">
      <div className="pt-4 px-4">

      <BackHeader handleClickBack={onBack}  />
      </div>
        <SitAndReachWall />
    </div>
  );
}
