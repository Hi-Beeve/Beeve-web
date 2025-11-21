'use client';

import { getFitnessStandardByAge } from "@/lib/fitness-utils";
import { FITNESS_TYPE } from '@/types/hex';

interface HexProgramBarProps {
    value: number;
    age: number;
    gender: 'male' | 'female';
    fitnessType: FITNESS_TYPE;
    grade: number;
}

export default function HexProgramBar({ value, age, gender, fitnessType, grade }: HexProgramBarProps) {
    // 각 등급별 기준값 가져오기
    const grade1Standard = getFitnessStandardByAge(1, gender, age);
    const grade2Standard = getFitnessStandardByAge(2, gender, age);
    const grade3Standard = getFitnessStandardByAge(3, gender, age);

    const getStandardValue = (standard: any, type: FITNESS_TYPE) => {
        if (!standard || !standard[type]) return 0;
        const val = standard[type];
        return typeof val === 'string' ? parseFloat(val) : val;
    };

    const grade1Value = getStandardValue(grade1Standard, fitnessType);
    const grade2Value = getStandardValue(grade2Standard, fitnessType);
    const grade3Value = getStandardValue(grade3Standard, fitnessType);

    // min, max 값 설정
    const minValue = 0;
    const maxValue = Math.max(grade1Value * 1.2, value * 1.1);

    // 4개 구간 정의 (각각 25%씩)
    const sections = [
        { label: '3등급', threshold: grade3Value,  }, // purple-300
        { label: '2등급', threshold: grade2Value,  }, // purple-200  
        { label: '1등급', threshold: grade1Value, }, // purple-100
        { label: '1등급 초과', threshold: maxValue,  }  // gray-100
    ];

    // 현재 값이 어느 구간에 속하는지 계산
    const getCurrentSection = (val: number) => {
        if (val <= grade3Value) return 0; // 3등급 구간
        if (val <= grade2Value) return 1; // 2등급 구간
        if (val <= grade1Value) return 2; // 1등급 구간
        return 3; // 1등급 초과 구간
    };

    const currentSection = getCurrentSection(value);

    // 각 구간 내에서의 진행률 계산
    const getProgressInSection = (val: number, sectionIndex: number) => {
        let sectionMin, sectionMax;
        
        switch (sectionIndex) {
            case 0: // 3등급 구간 (0 ~ 3등급값)
                sectionMin = minValue;
                sectionMax = grade3Value;
                break;
            case 1: // 2등급 구간 (3등급값 ~ 2등급값)
                sectionMin = grade3Value;
                sectionMax = grade2Value;
                break;
            case 2: // 1등급 구간 (2등급값 ~ 1등급값)
                sectionMin = grade2Value;
                sectionMax = grade1Value;
                break;
            case 3: // 1등급 초과 구간 (1등급값 ~ max값)
                sectionMin = grade1Value;
                sectionMax = maxValue;
                break;
            default:
                return 0;
        }

        if (sectionMax === sectionMin) return 0;
        return Math.min(Math.max((val - sectionMin) / (sectionMax - sectionMin), 0), 1);
    };

    const progressInCurrentSection = getProgressInSection(value, currentSection);

    // 전체 진행률 계산 (완료된 구간 + 현재 구간 내 진행률)
    const totalProgress = (currentSection * 25) + (progressInCurrentSection * 25);

    return (
        <div className="w-full pb-5">
            {/* 진행바 컨테이너 */}
            <div className="relative w-full h-5 bg-[#D9D9D9] rounded-[4px] overflow-hidden">
                {/* 배경 구간들 (4등분) */}
                <div className="absolute inset-0 flex">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="flex-1 border-r border-dotted border-[#767676] last:border-r-0"
                            // style={{ backgroundColor: section.color }}
                        />
                    ))}
                </div>

                {/* 현재 진행도 바 */}
                <div
                    className="absolute top-0 left-0 h-full bg-[#A38BEB80]  transition-all duration-300"
                    style={{ width: `${totalProgress}%` }}
                />
            </div>

            {/* 등급별 기준값을 등급 텍스트로 표시 */}
            <div className="relative w-full mt-2">
                {/* 3등급 위치 (25% 지점) */}
                <div 
                    className="absolute text-xs text-gray-600 transform -translate-x-1/2"
                    style={{ left: '25%' }}
                >
                    3등급
                </div>
                {/* 2등급 위치 (50% 지점) */}
                <div 
                    className="absolute text-xs text-gray-600 transform -translate-x-1/2"
                    style={{ left: '50%' }}
                >
                    2등급
                </div>
                {/* 1등급 위치 (75% 지점) */}
                <div 
                    className="absolute text-xs text-gray-600 transform -translate-x-1/2"
                    style={{ left: '75%' }}
                >
                    1등급
                </div>
            </div>
        </div>
    );
}
