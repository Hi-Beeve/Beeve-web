"use client";

import { useRouter } from "next/navigation";
import FitnessMbtiCard from "@/components/fitness-mbti-card";
import { FONT_STYLES } from "@/styles/fontStyles";
import { useHex } from "@/api/hex/useHex";

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
    } catch {
      // 사용자가 공유를 취소한 경우 등은 무시
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(shareData.url);
    alert("링크가 복사되었습니다.");
  } catch {
    // 클립보드 접근 실패는 무시
  }
}

export default function MeasurementResultPage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  console.log('📊 Result page - today:', today);
  const { data, isLoading, isError, status, fetchStatus } = useHex({ date: today, noCache: true });
  console.log('📊 Result page - query status:', status, 'fetchStatus:', fetchStatus, 'data:', data);

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

  if (isError || !data) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-4"
        style={{ backgroundColor: PAGE_BG }}
      >
        <p className="text-gray-500">측정 결과를 불러올 수 없습니다.</p>
        <button
          className="h-12 px-6 rounded-[20px] font-medium bg-gray-200 text-gray-700"
          onClick={() => router.push("/hex")}
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
      <h1 className={`${FONT_STYLES.heading5} mb-6`}>체력 MBTI</h1>

      <FitnessMbtiCard fitness={data.fitness} />

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
          onClick={() => router.push("/hex")}
        >
          홈으로
        </button>
      </div>
    </div>
  );
}
