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

import { HEX_COLORS } from "@/components/hex-colors";

const options = {
  responsive: true,
  animation: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    r: {
      angleLines: { display: false },
      min: 0,
      max: 2.2,
      ticks: {
        stepSize: 1,
        display: false,
      },
      pointLabels: {
        font: { size: 18, weight: "bold" },
        color: HEX_COLORS.label,
      },
      chartArea: {
        width: '90%',
        height: '90%'
      },
      grid: {
        color: [
          'transparent',
          'transparent',
          'transparent',
        ],
        borderColor: 'transparent',
        circular: false,
        drawOnChartArea: true,
      },
      angleLines: {
        color: 'transparent',
      },
    },
  },
};

import { useState, useEffect } from "react";

// 각 단계별 실제 값 범위 (예: 1단계=0~30, 2단계=30~60, 3단계=60~100)
const STEP_RANGES = [0, 30, 60, 100]; // [min, 1단계끝, 2단계끝, max]

// 실제 값을 1~3단계로 정규화 (0~1, 1~2, 2~3 사이에 매핑)
function normalizeValue(val: number) {
  if (val <= STEP_RANGES[1]) return (val - STEP_RANGES[0]) / (STEP_RANGES[1] - STEP_RANGES[0]) * 1;
  if (val <= STEP_RANGES[2]) return 1 + (val - STEP_RANGES[1]) / (STEP_RANGES[2] - STEP_RANGES[1]);
  if (val <= STEP_RANGES[3]) return 2 + (val - STEP_RANGES[2]) / (STEP_RANGES[3] - STEP_RANGES[2]);
  return 3;
}

interface HexagonChartProps {
  hexDataArray: number[];
}

export default function HexagonChart({ hexDataArray }: HexagonChartProps) {
  const VALUE_DATA = hexDataArray.map(normalizeValue);
  const [animatedValue, setAnimatedValue] = useState(Array(6).fill(0));

  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;
    const start = Array(6).fill(0);
    const end = VALUE_DATA;
    function animate() {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const next = start.map((v, i) => v + (end[i] - v) * progress);
      setAnimatedValue(next);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    animate();
  }, [VALUE_DATA]);

  const data = {
    labels: LABELS,
    datasets: [
      {
        label: "value",
        data: animatedValue,
        backgroundColor: HEX_COLORS.valueFill,
        borderColor: 'transparent',
        borderWidth: 2,
        borderJoinStyle: 'round',
        borderCapStyle: 'round',
        pointRadius: 0,
        fill: true,
      },
    ],
  };

  return (
    <div style={{ position: 'relative', width: 500, height: 500, background: HEX_COLORS.chartBg, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/hex.svg" alt="hex-bg" style={{ position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, zIndex: 1 }} />
      <div style={{ position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, zIndex: 2, pointerEvents: 'none' }}>
        {/* @ts-ignore */}
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}
