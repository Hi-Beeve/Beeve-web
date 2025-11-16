"use client";
import React from "react";
import { Radar } from "react-chartjs-2";
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const LABELS = [
  "근력",
  "심폐지구력",
  "유연성",
  "순발력",
  "민첩성",
  "근지구력"
];

const BASE_DATA = [3, 3, 3, 3, 3, 3];

const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    r: {
      angleLines: { display: false },
      suggestedMin: 0,
      suggestedMax: 3,
      ticks: {
        stepSize: 1,
        display: false,
      },
      pointLabels: {
        font: { size: 18, weight: "bold" },
        color: "#888",
      },
      grid: {
        color: [
          "#f5f3fa", // outer
          "#ede9f7", // mid
          "#e4e0f2", // inner
        ],
        circular: true,
      },
    },
  },
};

const data = {
  labels: LABELS,
  datasets: [
    {
      label: "base",
      data: BASE_DATA,
      backgroundColor: "rgba(150, 120, 200, 0.18)",
      borderWidth: 0,
      pointRadius: 0,
      fill: true,
    },
    // 실제 데이터는 여기에 추가하세요
    // {
    //   label: "user",
    //   data: [1,2,2,1,2,1],
    //   backgroundColor: "rgba(120, 80, 180, 0.25)",
    //   borderWidth: 0,
    //   pointRadius: 0,
    //   fill: true,
    // },
  ],
};

export default function HexagonChart() {
  return (
    <div style={{ width: 350, height: 350, background: "#faf9fb", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* @ts-ignore */}
      <Radar data={data} options={options} />
    </div>
  );
}
