"use client";

import FitnessMbtiCard from "@/components/fitness-mbti-card";
import { FONT_STYLES } from "@/styles/fontStyles";
import { HexData } from "@/types/hex";

const PAGE_BG = "#F8F7FB";

async function shareResult() {
  const shareData = {
    title: "체력 MBTI",
    text: "내 체력 MBTI 결과를 확인해보세요!",
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return; // 사용자가 공유를 취소함
      // navigator.share 실패 시 클립보드 복사로 폴백
    }
  }

  try {
    await navigator.clipboard.writeText(shareData.url);
    alert("링크가 복사되었습니다.");
  } catch {
    // 클립보드 접근도 막혀있는 환경(WebView 등)의 최종 폴백: 링크를 직접 노출
    alert(shareData.url);
  }
}

interface FitnessMbtiResultViewProps {
  fitness?: HexData[];
  isLoading: boolean;
  isError: boolean;
  onHome: () => void;
  /** 지정하면 제목 왼쪽에 뒤로가기 화살표를 표시한다. */
  onBack?: () => void;
}

// "체력 MBTI" 결과 화면(제목 + 카드 + 공유/홈 버튼)을 그리는 공용 뷰.
// measurement/result(측정 직후)와 hex/mbti(홈에서 조회) 양쪽에서 재사용한다.
export default function FitnessMbtiResultView({
  fitness,
  isLoading,
  isError,
  onHome,
  onBack,
}: FitnessMbtiResultViewProps) {
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: PAGE_BG }}
      >
        <p className="text-gray-500">결과를 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !fitness) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-4"
        style={{ backgroundColor: PAGE_BG }}
      >
        <p className="text-gray-500">측정 결과를 불러올 수 없습니다.</p>
        <button
          className="h-12 px-6 rounded-[20px] font-medium bg-gray-200 text-gray-700"
          onClick={onHome}
        >
          홈으로
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-8"
      style={{ backgroundColor: PAGE_BG }}
    >
      <div className="w-full flex items-center gap-2 mb-6">
        {onBack && (
          <button onClick={onBack} aria-label="뒤로가기">
            <img src="/arrow_left.svg" alt="" className="w-6 h-6" />
          </button>
        )}
        <h1 className={FONT_STYLES.heading5}>체력 MBTI</h1>
      </div>

      <FitnessMbtiCard fitness={fitness} />

      {/* 버튼 영역 */}
      <div className="w-full flex gap-[15px] mt-auto pt-8">
        <button
          className="flex-1 h-14 rounded-[18px] font-medium text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: "#BDB2DD" }}
          onClick={shareResult}
        >
          <img src="/share_mbti.svg" alt="" className="w-[13px] h-[15px]" />
          친구와 공유하기
        </button>
        <button
          className="flex-1 h-14 rounded-[18px] font-medium text-white"
          style={{ backgroundColor: "rgba(101, 101, 101, 0.8)" }}
          onClick={onHome}
        >
          홈으로
        </button>
      </div>
    </div>
  );
}
