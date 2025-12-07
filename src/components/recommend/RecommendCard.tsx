'use client';

import React from 'react';
import { FONT_STYLES } from '@/styles/fontStyles';

export type WorkoutType = 'upper' | 'lower' | 'balance';

interface Exercise {
  name: string;
  count: string;
}

interface RecommendCardProps {
  type: WorkoutType;
  title: string;
  exercises: Exercise[];
}

const getCardStyles = (type: WorkoutType) => {
  switch (type) {
    case 'upper':
      return {
        backgroundColor: '#BDB5D766',
        iconColor: '#8B7ED8',
      };
    case 'lower':
      return {
        backgroundColor: '#F4D5DB99',
        iconColor: '#E57B8A',
      };
    case 'balance':
      return {
        backgroundColor: '#9AC5ED4D',
        iconColor: '#5BA3D4',
      };
    default:
      return {
        backgroundColor: '#BDB5D766',
        iconColor: '#8B7ED8',
      };
  }
};

const getTypeIcon = (type: WorkoutType) => {
  switch (type) {
    case 'upper':
      return '💪'; // 상체
    case 'lower':
      return '🦵'; // 하체  
    case 'balance':
      return '⚖️'; // 밸런스
    default:
      return '💪';
  }
};

export const RecommendCard: React.FC<RecommendCardProps> = ({ type, title, exercises }) => {
  const styles = getCardStyles(type);
  const icon = getTypeIcon(type);

  return (
    <div 
      className="rounded-2xl p-4 mb-4"
      style={{ backgroundColor: styles.backgroundColor }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: styles.iconColor }}
        >
          {icon}
        </div>
        <span className={`${FONT_STYLES.heading4} text-gray-800`}>
          {title}
        </span>
      </div>

      {/* 운동 리스트 */}
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl px-4 py-3 flex justify-between items-center"
          >
            <span className={`${FONT_STYLES.body1} text-gray-800`}>
              {exercise.name}
            </span>
            <span className={`${FONT_STYLES.body2} text-gray-600`}>
              {exercise.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
