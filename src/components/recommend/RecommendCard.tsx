'use client';

import React from 'react';
import { FONT_STYLES } from '@/styles/fontStyles';
import Image from 'next/image';
import session_upper from "../../../public/session_upper.svg";
import session_lower from "../../../public/session_lower.svg";
import session_balance from "../../../public/session_balance.svg";
import { WorkoutDay } from '@/types/recommned';

export type WorkoutType = 'upper' | 'lower' | 'balance';

const getCardStyles = (type: WorkoutType) => {
  switch (type) {
    case 'upper':
      return {
        backgroundColor: '#BDB5D766',
        iconColor: '#BDB2DD',
      };
    case 'lower':
      return {
        backgroundColor: '#F4D5DB99',
        iconColor: '#F7BBB6',
      };
    case 'balance':
      return {
        backgroundColor: '#9AC5ED4D',
        iconColor: '#9AC5ED',
      };
    default:
      return {
        backgroundColor: '#BDB5D766',
        iconColor: '#BDB2DD',
      };
  }
};

const getTypeIcon = (type: WorkoutType) => {
  switch (type) {
    case 'upper':
      return <Image src={session_upper} width={16} height={16} alt="상체" />;
    case 'lower':
      return <Image src={session_lower} width={16} height={16} alt="하체" />;
    case 'balance':
      return <Image src={session_balance} width={16} height={16} alt="밸런스" />;
    default:
      return <Image src={session_balance} width={16} height={16} alt="밸런스" />;
  }
};

interface RecommendCardProps {
  type: WorkoutType;
  day: WorkoutDay;
  dayIndex: number;
}

export const RecommendCard: React.FC<RecommendCardProps> = ({ type, day, dayIndex }) => {
  const styles = getCardStyles(type);
  const icon = getTypeIcon(type);

  return (
    <div
      className="rounded-2xl p-4 mb-4"
      style={{ backgroundColor: styles.backgroundColor }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: styles.iconColor }}
        >
          {icon}
        </div>
        <div className="flex flex-col">
          <span className={`${FONT_STYLES.body7}`}>
            Day {dayIndex + 1} · {day.focus}
          </span>
          <span className="text-xs text-gray-500">{day.date}</span>
        </div>
      </div>

      {/* 준비 운동 */}
      <div className="bg-white/60 rounded-xl px-3 py-2 mb-2">
        <p className="text-xs font-semibold text-yellow-700 mb-1">준비 운동</p>
        <p className="text-sm text-gray-700">{day.warm_up}</p>
      </div>

      {/* 운동 리스트 */}
      <div className="space-y-2 mb-2">
        {day.exercises.map((exercise, index) => (
          <div
            key={index}
            className="bg-white rounded-xl px-4 py-3"
          >
            <div className="flex justify-between items-center">
              <span className={`${FONT_STYLES.heading14} text-gray-800`}>
                {exercise.name}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-white bg-purple-500 rounded-full px-2 py-0.5">
                  RPE {exercise.rpe}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-1 text-sm text-gray-500">
              <span>{exercise.sets}세트 × {exercise.reps}회</span>
              {exercise.duration && <span>{exercise.duration}분</span>}
              <span>휴식 {exercise.rest_seconds}초</span>
            </div>
            {exercise.description && (
              <p className="text-xs text-gray-400 mt-1">{exercise.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* 정리 운동 */}
      <div className="bg-white/60 rounded-xl px-3 py-2">
        <p className="text-xs font-semibold text-blue-700 mb-1">정리 운동</p>
        <p className="text-sm text-gray-700">{day.cool_down}</p>
      </div>
    </div>
  );
};
