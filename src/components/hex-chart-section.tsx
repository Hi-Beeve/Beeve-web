import React from "react";
import HexagonChart from "@/components/hexagon-chart";

interface HexChartSectionProps {
  hexDataArray: number[];
  date: string;
}

export default function HexChartSection({ hexDataArray, date }: HexChartSectionProps) {
  const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <section style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
      <h2 style={{ fontWeight: 700, fontSize: 36, marginBottom: 8 }}>6-Data</h2>
      <div style={{ margin: '0 auto' }}>
        <HexagonChart hexDataArray={hexDataArray} />
      </div>
      <div style={{ fontWeight: 500, fontSize: 20, color: '#222', marginTop: 24 }}>{formattedDate} ▼</div>
    </section>
  );
}
