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
}

export const HexLineGraph = ({ title, data, maxValue = 4 }: HexLineGraphProps) => {
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
           clip: {
      left: 10,
      right: 10,
      top:10,     // 위로 10px 더 여유
      bottom: 10,  // 아래로 10px 더 여유
    },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        // top: 25,
        // bottom: 25,
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
        min: 1,
        max: maxValue,
        grid: {
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
          },
          stepSize: 1,
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
    <div className="w-full h-52 bg-white rounded-lg relative">
      <div className="w-full h-full p-4 pt-14">
      {title && (
        <div className="absolute flex top-5 left-4 z-20 gap-2 pl-2">
          <Image src={data.icon} alt="Icon" width={24} height={24} />
          <p className={`${FONT_STYLES.heading4}`}>{title}</p>
        </div>
      )}
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};