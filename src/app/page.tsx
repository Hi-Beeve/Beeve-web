import Link from "next/link";
import { UserProfile } from "@/components/user-profile";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <header className="flex justify-between items-center p-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold">Beeve Web</h1>
          <p className="text-gray-400 text-sm">AI 기반 운동 측정 플랫폼</p>
        </div>
        <UserProfile />
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex flex-col gap-8 items-center max-w-6xl mx-auto p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">운동 측정을 시작해보세요</h2>
          <p className="text-gray-300">
            MediaPipe AI를 활용한 정확한 운동 자세 분석
          </p>
        </div>
        
        {/* 운동 측정 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          <Link
            href="/pushup-counter"
            className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg text-center transition-colors border border-gray-700"
          >
            <div className="text-4xl mb-3">💪</div>
            <h3 className="text-xl font-bold mb-2">푸시업 측정</h3>
            <p className="text-gray-400 text-sm">
              벽 푸시업, 무릎 푸시업, 일반 푸시업
            </p>
          </Link>

          <Link
            href="/description?type=situp"
            className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg text-center transition-colors border border-gray-700"
          >
            <div className="text-4xl mb-3">🏃</div>
            <h3 className="text-xl font-bold mb-2">싯업 측정!!</h3>
            <p className="text-gray-400 text-sm">
              1분 내 최대 싯업 개수 측정
            </p>
          </Link>

          <Link
            href="/description?type=step"
            className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg text-center transition-colors border border-gray-700"
          >
            <div className="text-4xl mb-3">🏃‍♂️</div>
            <h3 className="text-xl font-bold mb-2">스텝검사</h3>
            <p className="text-gray-400 text-sm">
              3분 스텝박스 심폐지구력 측정
            </p>
          </Link>

          <Link
            href="/description?type=standing-jump"
            className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg text-center transition-colors border border-gray-700"
          >
            <div className="text-4xl mb-3">🦘</div>
            <h3 className="text-xl font-bold mb-2">제자리 높이뛰기</h3>
            <p className="text-gray-400 text-sm">
              체공시간 측정 (최대 3회)
            </p>
          </Link>

          <Link
            href="/description?type=reaction-time"
            className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg text-center transition-colors border border-gray-700"
          >
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold mb-2">반응 시간 검사</h3>
            <p className="text-gray-400 text-sm">
              민첩성 측정 (0.001초 단위)
            </p>
          </Link>

          <Link
            href="/sit-and-reach-test"
            className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg text-center transition-colors border border-gray-700"
          >
            <div className="text-4xl mb-3">🧘‍♀️</div>
            <h3 className="text-xl font-bold mb-2">유연성 검사</h3>
            <p className="text-gray-400 text-sm">
              앉아 윗몸 숙이기 (키 기반 정확 측정)
            </p>
          </Link>
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>AI 포즈 인식을 통한 정확한 운동 측정</p>
        </div>
      </main>
    </div>
  );
}
