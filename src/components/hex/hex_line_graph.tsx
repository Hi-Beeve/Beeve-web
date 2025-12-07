'use client';

import React from 'react';
import Image from 'next/image';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FONT_STYLES } from '@/styles/fontStyles';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HexLineGraphProps {
  title: string;
  data: {
    labels: string[];
    values: number[];
    icon: string;
  };
  maxValue?: number;
  minValue?: number;
  stepSize?: number;
}

export const HexLineGraph = ({ title, data, maxValue = 4, minValue = 1, stepSize = 1 }: HexLineGraphProps) => {
  const formatDateLabels = (labels: string[]) => {
    return labels.map(label => {
      const date = new Date(label);
      if (!isNaN(date.getTime())) {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
      return label;
    });
  };

  const chartData = {
    labels: formatDateLabels(data.labels),
    datasets: [
      {
        label: title,
        data: data.values,
        borderColor: '#BDB2DD',
        backgroundColor: 'rgba(168, 162, 255, 0.1)',
        borderWidth: 5,
        pointBackgroundColor: 'white',
        pointBorderColor: '#BDB2DD',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 15,
        bottom: 15,
        left: 10,
        right: 15, // 우측 여백 줄임
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'transparent',
          drawBorder: false,
          offset: true,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
          },
          maxTicksLimit: 7,
        },
        border: {
          color: 'transparent',
        }
      },
      y: {
        position: 'right' as const,
        beginAtZero: false,
        reverse: true,
        min: minValue - 0.2, // 최소값에서 0.2 여백 추가
        max: maxValue + 0.2, // 최대값에서 0.2 여백 추가
        grid: {
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
          },
          stepSize: stepSize,
        },
        // afterBuildTicks를 사용하여 tick을 직접 제어
        afterBuildTicks: function(scale: any) {
          // 고정된 tick 값들만 생성
          const fixedTicks = [];
          if (minValue === 1 && maxValue === 100 && stepSize === 25) {
            // 순위 차트의 경우: 1, 25, 50, 75, 100
            [1, 25, 50, 75, 100].forEach(value => {
              fixedTicks.push({ value });
            });
          } else {
            // 일반적인 경우 - stepSize를 정확히 사용
            console.log('🔍 tick 생성:', { minValue, maxValue, stepSize });
            for (let i = minValue; i <= maxValue; i += stepSize) {
              fixedTicks.push({ value: i });
              console.log('🔍 tick 추가:', i);
            }
          }
          console.log('🔍 최종 ticks:', fixedTicks);
          scale.ticks = fixedTicks;
        },
        border: {
          color: 'transparent',
          dash: [3,3],
        }      
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: 'white',
        hoverBorderColor: '#BDB2DD',
        hoverBorderWidth: 3,
      },
    },
  };

  return (
    <div className="w-full h-52 bg-white rounded-lg relative overflow-visible">
      <div className="w-full h-full p-4 pt-14 overflow-visible">
      {title && (
        <div className="absolute flex top-5 left-4 z-20 gap-2 pl-2">
          {data.icon && (

            <Image src={data.icon} alt="Icon" width={24} height={24} />
          )}
          <p className={`${FONT_STYLES.heading4}`}>{title}</p>
        </div>
      )}
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};