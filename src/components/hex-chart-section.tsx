import React from "react";
import HexagonChart from "@/components/hexagon-chart";
import { FONT_COLORS, FONT_STYLES } from "@/styles/fontStyles";
import { HEX_COLORS } from "./hex-colors";
import { HexWithDateResponse } from "@/types/hex";

interface HexChartSectionProps {
  data: HexWithDateResponse;
  onDateClick?: () => void;
}

export default function HexChartSection({ data, onDateClick }: HexChartSectionProps) {
  const formattedDate = new Date(data.measureDay).toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  }) ;

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

  console.log('🔍 서버 데이터:', data.fitness.map(f => `${f.fitnessType}:${f.grade}`));
  console.log('🔍 육각형 순서:', hexDataArray);

  return (
    <section className="w-full flex flex-col items-center py-8" >
      <HexTitle />
      <div className="my-0">
        <HexagonChart hexDataArray={hexDataArray} />
      </div>
      <DateSection date={formattedDate} onClick={onDateClick}/>
    </section>
  );
}

const HexTitle = () => {
  return (
    <div className="w-full flex flex-col pl-5">
      <p className={FONT_STYLES.body13} style={{  color: HEX_COLORS.hexLabel }}>체력측정 6각형</p>
    <h2 className={FONT_STYLES.heading1} style={{ marginBottom: 8 }}>6-Data</h2>
    </div>
  )
}

const DateSection = ({date, onClick}: {date: string, onClick?: () => void}) => {
  const year = new Date(date).getFullYear();
  const month = new Date(date).getMonth() + 1;
  const day = new Date(date).getDate();

  return (
    <div className="w-full flex pl-5 items-end justify-center pt-5 cursor-pointer" onClick={onClick}>
      <div className={FONT_STYLES.heading2}>{month}.{day}.</div>
      <div className="flex items-end pb-1">
        <div className={FONT_STYLES.body6 + " " + FONT_COLORS.grey}> {year}</div>
        <img src="/mini-bottom-arrow.svg" alt="arrow-bottom" />
      </div>
    </div>
  )
}
