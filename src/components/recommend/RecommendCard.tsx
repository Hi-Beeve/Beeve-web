'use client';

import React from 'react';
import { FONT_STYLES } from '@/styles/fontStyles';
import Image from 'next/image';
import session_upper from "../../../public/session_upper.svg";
import session_lower from "../../../public/session_lower.svg";
import session_balance from "../../../public/session_balance.svg";
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
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: styles.iconColor }}
        >
          {icon}
        </div>
        <span className={`${FONT_STYLES.body7}`}>
          {title}
        </span>
      </div>

      {/* 운동 리스트 */}
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div 
            key={index}
            className={`bg-white rounded-[30px] px-4 py-3 flex justify-between items-center border border-[${getCardStyles(type).iconColor}]`}
          >
            <span className={`${FONT_STYLES.heading14} text-gray-800`}>
              {exercise.name}
            </span>
            <span className={`${FONT_STYLES.body14} text-gray-600`}>
              {exercise.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
