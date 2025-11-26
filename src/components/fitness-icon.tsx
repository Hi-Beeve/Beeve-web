import React from 'react';
import StrengthIcon from './Icon/StrengthIcon';
import EnduranceIcon from "./Icon/EnduranceIcon";
import CardioIcon from "./Icon/CardioIcon";
import FlexibilityIcon from "./Icon/FlexibilityIcon";
import AgilityIcon from "./Icon/AgilityIcon";
import QuicknessIcon from "./Icon/QuicknessIcon";

export type FitnessIconType = 'STRENGTH' | 'CARDIO' | 'ENDURANCE' | 'FLEXIBILITY' | 'AGILITY' | 'QUICKNESS';

interface FitnessIconProps {
  type: FitnessIconType;
  isActive?: boolean;
  size?: number;
  className?: string;
}

export const FitnessIcon: React.FC<FitnessIconProps> = ({ 
  type, 
  isActive = false, 
  size = 24, 
  className = "" 
}) => {
  const color = isActive ? '#FFFFFF' : '#767676';
  
  const iconComponents = {
    STRENGTH: (
     <StrengthIcon color={color}/>
    ),
    CARDIO: (
      <CardioIcon color={color}/>
    ),
    ENDURANCE: (
      <EnduranceIcon color={color}/>
    ),
    FLEXIBILITY: (
      <FlexibilityIcon color={color} />
    ),
    AGILITY: (
      <AgilityIcon color={color} />
    ),
    QUICKNESS: (
      <QuicknessIcon color={color}/>
    )
  };

  return iconComponents[type] || null;
};