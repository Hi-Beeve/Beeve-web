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

const VALUE_DATA = [1, 3, 0, 0, 0, 0]; // 예시값

export default function HexagonChart() {
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
  }, []);

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
