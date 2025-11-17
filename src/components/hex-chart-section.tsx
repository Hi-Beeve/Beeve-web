import React from "react";
import HexagonChart from "@/components/hexagon-chart";

export default function HexChartSection() {
  return (
    <section style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
      <h2 style={{ fontWeight: 700, fontSize: 36, marginBottom: 8 }}>6-Data</h2>
      <div style={{ margin: '0 auto' }}>
        <HexagonChart />
      </div>
      <div style={{ fontWeight: 500, fontSize: 20, color: '#222', marginTop: 24 }}>10.09. 2025 ▼</div>
    </section>
  );
}
