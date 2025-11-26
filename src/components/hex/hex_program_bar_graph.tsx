'use client';

import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { getFitnessStandardByAge } from "@/lib/fitness-utils";
import { FITNESS_TYPE } from '@/types/hex';

// Chart.js 등록
Chart.register(...registerables);

interface HexProgramBarGraphProps {
    value: number;
    age: number;
    gender: 'male' | 'female';
    fitnessType: FITNESS_TYPE;
    grade: number;
}

export default function HexProgramBarGraph({ value, age, gender, fitnessType, grade }: HexProgramBarGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // 기존 차트 제거
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // 각 등급별 기준값 가져오기
        const grade1Standard = getFitnessStandardByAge(1, gender, age);
        const grade2Standard = getFitnessStandardByAge(2, gender, age);
        const grade3Standard = getFitnessStandardByAge(3, gender, age);

        // 기준값 추출
        const getStandardValue = (standard: any, type: string) => {
            if (!standard || !standard[type]) return 0;
            const val = standard[type];
            return val;
        };

        const grade1Value = getStandardValue(grade1Standard, fitnessType);
        const grade2Value = getStandardValue(grade2Standard, fitnessType);
        const grade3Value = getStandardValue(grade3Standard, fitnessType);

        // 최대값 설정: 1등급 기준값 또는 측정값 중 큰 값 + 10
        const maxValue = Math.max(grade1Value, value) + 10;

        // Chart.js 설정
        const config: ChartConfiguration = {
            type: 'bar',
            data: {
                labels: [''],
                datasets: [
                    {
                        label: '현재 값',
                        data: [value],
                        backgroundColor: '#9333EA', // purple-600
                        borderWidth: 0,
                        barThickness: 30,
                    }
                ]
            },
            options: {
                indexAxis: 'y', // 수평 바 차트
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: () => '',
                            label: (context) => {
                                return `현재 값: ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: maxValue,
                        grid: {
                            display: true,
                            color: '#E5E7EB'
                        },
                        ticks: {
                            display: true,
                            color: '#6B7280',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            display: false
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                }
            }
        };

        // 차트 생성
        chartRef.current = new Chart(canvasRef.current, config);

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [value, age, gender, fitnessType]);

    // 등급별 기준값 계산 (표시용)
    const grade1Standard = getFitnessStandardByAge(1, gender, age);
    const grade2Standard = getFitnessStandardByAge(2, gender, age);
    const grade3Standard = getFitnessStandardByAge(3, gender, age);

    const getStandardValue = (standard: any, type: string) => {
        if (!standard || !standard[type]) return 0;
        const val = standard[type];
        return val;
    };

    const grade1Value = getStandardValue(grade1Standard, fitnessType);
    const grade2Value = getStandardValue(grade2Standard, fitnessType);
    const grade3Value = getStandardValue(grade3Standard, fitnessType);
    const maxValue = Math.max(grade1Value, value) + 10;

    // 각 등급의 위치 계산 (퍼센트)
    const grade3Position = (grade3Value / maxValue) * 100;
    const grade2Position = (grade2Value / maxValue) * 100;
    const grade1Position = (grade1Value / maxValue) * 100;

    return (
        <div className="w-full">
            {/* Chart.js 캔버스 */}
            <div className="relative w-full h-16">
                <canvas ref={canvasRef} />
                
                {/* 등급 구분선 오버레이 */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* 3등급 구분선 */}
                    <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                        style={{ left: `${grade3Position}%` }}
                    />
                    {/* 2등급 구분선 */}
                    <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                        style={{ left: `${grade2Position}%` }}
                    />
                    {/* 1등급 구분선 */}
                    <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                        style={{ left: `${grade1Position}%` }}
                    />
                </div>
            </div>

            {/* 등급별 기준값 표시 */}
            <div className="relative w-full mt-1">
                {/* 3등급 기준값 */}
                <div 
                    className="absolute text-xs text-gray-600 transform -translate-x-1/2"
                    style={{ left: `${grade3Position}%` }}
                >
                    {grade3Value}
                </div>
                {/* 2등급 기준값 */}
                <div 
                    className="absolute text-xs text-gray-600 transform -translate-x-1/2"
                    style={{ left: `${grade2Position}%` }}
                >
                    {grade2Value}
                </div>
                {/* 1등급 기준값 */}
                <div 
                    className="absolute text-xs text-gray-600 transform -translate-x-1/2"
                    style={{ left: `${grade1Position}%` }}
                >
                    {grade1Value}
                </div>
            </div>

            {/* 등급 라벨 */}
            <div className="relative w-full mt-4">
                {/* 3등급 라벨 */}
                <div 
                    className="absolute text-sm text-gray-600 transform -translate-x-1/2"
                    style={{ left: `${grade3Position}%` }}
                >
                    3등급
                </div>
                {/* 2등급 라벨 */}
                <div 
                    className="absolute text-sm text-gray-600 transform -translate-x-1/2"
                    style={{ left: `${grade2Position}%` }}
                >
                    2등급
                </div>
                {/* 1등급 라벨 */}
                <div 
                    className="absolute text-sm text-gray-600 transform -translate-x-1/2"
                    style={{ left: `${grade1Position}%` }}
                >
                    1등급
                </div>
            </div>

            {/* 현재 등급 표시 */}
            <div className="mt-8 text-center">
                <span className={`text-sm font-semibold ${
                    grade === 1 ? 'text-purple-600' : 
                    grade === 2 ? 'text-purple-500' : 
                    grade === 3 ? 'text-purple-400' : 'text-gray-500'
                }`}>
                    {grade <= 3 ? `${grade}등급` : '등급 미달'}
                </span>
            </div>
        </div>
    );
}