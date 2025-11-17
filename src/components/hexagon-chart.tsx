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
  maintainAspectRatio: false,
  animation: false,
  layout: {
    padding: 0,
  },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    r: {
      angleLines: { display: false, color: 'transparent' },
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
    },
  },
};

import { useState, useEffect } from "react";

interface HexagonChartProps {
  hexDataArray: number[];
}

// 등급을 실제 값으로 변환: 1=80(가장 바깥), 2=63, 3=36, 4=0(중심)
const GRADE_TO_VALUE = [0, 4, 3, 1.8, 0]; // index 0은 사용하지 않음

export default function HexagonChart({ hexDataArray }: HexagonChartProps) {
  // 등급 배열을 실제 값 배열로 변환
  const VALUE_DATA = hexDataArray.map(grade => GRADE_TO_VALUE[grade] ?? 0);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(hexDataArray)]);

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
    <div style={{ position: 'relative', width: 300, height: 300, background: HEX_COLORS.chartBg, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/hex.svg" alt="hex-bg" style={{ position: 'absolute', width: '100%', height: '100%', left: '-10px', top: '2px', zIndex: 1 }} />
      <div style={{ position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, zIndex: 2, pointerEvents: 'none' }}>
        {/* @ts-ignore */}
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}
