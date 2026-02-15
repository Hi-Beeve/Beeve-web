"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HexagonChart from "@/components/hexagon-chart";
import { HexWithDateResponse } from "@/types/hex";

const HEXAGON_ORDER = ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'QUICKNESS', 'AGILITY', 'ENDURANCE'];

export default function MeasurementResultPage() {
  const router = useRouter();
  const [data, setData] = useState<HexWithDateResponse | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("measurementResult");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        router.replace("/hex");
      }
    } else {
      router.replace("/hex");
    }
  }, [router]);

  if (!data) {
    return null;
  }

  const hexDataArray = HEXAGON_ORDER.map(fitnessType => {
    const item = data.fitness.find(f => f.fitnessType === fitnessType);
    return item?.grade ?? 0;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 py-8">
      {/* 헤더 */}
      <h1 className="text-2xl font-bold text-black mb-2">측정 완료!</h1>
      <p className="text-sm text-gray-500 mb-8">
        {new Date(data.measureDay).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })} 측정 결과
      </p>

      {/* 레이다 그래프 */}
      <div className="mb-8">
        <HexagonChart hexDataArray={hexDataArray} width={280} height={280} />
      </div>

      {/* 체력 유형 텍스트 */}
      <p className="text-lg font-semibold text-black mb-12">
        당신의 체력 유형은 ___입니다.
      </p>

      {/* 버튼 영역 */}
      <div className="w-full max-w-sm space-y-3 mt-auto pb-8">
        <button
          className="w-full h-14 rounded-[20px] font-medium bg-[#BDB2DD] text-white"
          onClick={() => {
            localStorage.removeItem("measurementResult");
            router.push("/hex/recommend");
          }}
        >
          내 체력 맞춤 운동 추천받기
        </button>
        <button
          className="w-full h-14 rounded-[20px] font-medium bg-gray-200 text-gray-700"
          onClick={() => {
            localStorage.removeItem("measurementResult");
            router.push("/hex");
          }}
        >
          홈으로
        </button>
      </div>
    </div>
  );
}
