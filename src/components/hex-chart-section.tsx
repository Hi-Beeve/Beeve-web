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

  // grade 값들을 안전하게 추출
  const hexDataArray = data.fitness.map((item, index) => {
    if (!item || typeof item.grade !== 'number') {
      console.warn(`⚠️ fitness[${index}]의 grade가 유효하지 않습니다:`, item);
      return 0; // 기본값
    }
    return item.grade;
  });

  console.log('🔍 hexDataArray:', hexDataArray);

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
