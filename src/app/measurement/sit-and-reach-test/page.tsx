'use client';
import { useRouter } from 'next/navigation';
import { BackHeader } from '@/components/common/BackHeader';
import { SitAndReachWall } from '@/components/sit-and-reach-wall';

export default function SitAndReachTestPage() {
  const router = useRouter();
  const onBack = () => {
    router.push('/measurement');
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
