import React from "react";
import HexagonChart from "@/components/hexagon-chart";
import { FONT_COLORS, FONT_STYLES } from "@/styles/fontStyles";
import { HexWithDateResponse } from "@/types/hex";

interface RecommendHexSectionProps {
  data: HexWithDateResponse;
}

export default function RecommendHexSection({ data }: RecommendHexSectionProps) {
  const formattedDate = new Date(data.measureDay).toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  });

  // 육각형 순서 정의 (시계방향, 12시부터): 근력 -> 심폐 -> 유연성 -> 순발력 -> 민첩성 -> 근지구력
  const HEXAGON_ORDER = ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'QUICKNESS', 'AGILITY', 'ENDURANCE'];

  // grade 값들을 정해진 육각형 순서에 맞춰 추출
  const hexDataArray = HEXAGON_ORDER.map(fitnessType => {
    const item = data.fitness.find(f => f.fitnessType === fitnessType);
    if (!item || typeof item.grade !== 'number') {
      console.warn(`⚠️ ${fitnessType}의 grade가 유효하지 않습니다:`, item);
      return 0; // 기본값
    }
    return item.grade;
  });

  return (
    <section className="w-full bg-white rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* 좌측 날짜 섹션 */}
        <div className="flex-shrink-0">
          <DateSection date={formattedDate} />
        </div>
        
        {/* 우측 육각형 차트 */}
        <div className="flex-1 flex justify-end">
          <HexagonChart hexDataArray={hexDataArray} width={140} height={140} innerFull={true}/>
        </div>
      </div>
    </section>
  );
}

const DateSection = ({ date }: { date: string }) => {
  const year = new Date().getFullYear();
  const [month, day] = date.split('.');

  return (
    <div className="flex flex-col items-start">
      <div className={`${FONT_STYLES.body5} text-[#767676] leading-tight`}>
        {year}
      </div>
      <div className="flex items-center gap-1 mt-1">
        <div className={`${FONT_STYLES.heading2} text-gray-900`}>
          {month}.{day}.
        </div>
      </div>
    </div>
  );
};
