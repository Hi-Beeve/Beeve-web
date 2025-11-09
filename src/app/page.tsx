import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex items-center justify-center min-h-screen p-8 bg-gray-900 text-white">
      <main className="flex flex-col gap-8 items-center max-w-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Beeve Web</h1>
          <p className="text-gray-300">
            AI 기반 운동 측정 플랫폼
          </p>
        </div>
        
        {/* 운동 측정 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
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
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>AI 포즈 인식을 통한 정확한 운동 측정</p>
        </div>
      </main>
    </div>
  );
}
