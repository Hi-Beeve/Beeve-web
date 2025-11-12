import Link from 'next/link';
import { SitAndReachWall } from '@/components/sit-and-reach-wall';

export default function SitAndReachTestPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">윗몸앞으로굽히기 측정 테스트</h1>
          <p className="text-muted-foreground">
            벽을 기준으로 한 새로운 측정 방식 테스트
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-blue-500 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        <SitAndReachWall />

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">측정 방법</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>벽 기준 측정</strong> - 벽을 고정된 기준점으로 활용</li>
            <li><strong>자세 검증</strong> - 무릎이 펴져 있는지 실시간 확인</li>
            <li><strong>3초 유지</strong> - 올바른 자세로 3초간 유지 시 측정 완료</li>
            <li><strong>실시간 피드백</strong> - 거리와 자세 상태를 실시간 표시</li>
          </ul>
          
          <h3 className="font-semibold mb-2 mt-4">장점</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>별도의 측정 도구 없이 집에서 측정 가능</li>
            <li>벽이라는 명확한 기준점으로 정확도 향상</li>
            <li>2D 평면에서의 거리 측정으로 오차 감소</li>
            <li>MediaPipe의 자세 인식으로 올바른 측정 보장</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
