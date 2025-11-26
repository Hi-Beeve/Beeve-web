"use client";
import React from "react";
import { Radar } from "react-chartjs-2";
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import { FONT_STYLES } from "@/styles/fontStyles";

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const LABELS = [
  "",
  "",
  "",
  "",
  "",
  ""
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
        font: FONT_STYLES.body1,
        color: HEX_COLORS.label,
        // padding:8/0,
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
const GRADE_TO_VALUE = [0, 2.6, 2, 1.2, 0]; // index 0은 사용하지 않음

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
    <div className="relative w-[300px] h-[300px] rounded-6 flex items-center justify-center">
      <img src="/hex.svg" alt="hex-bg" className="absolute w-full h-full" style={{ left: '4px', top: '2px', zIndex: 1 }} />
      <div className="absolute w-[80%] h-[80%]" style={{ left: '10%', top: '10%', zIndex: 2, pointerEvents: 'none' }}>
        {/* @ts-expect-error Chart.js Radar 타입 호환 문제 무시 */}
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}
