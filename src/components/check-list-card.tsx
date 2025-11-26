import Image from "next/image";
import checkWhite from '../../public/check_white.svg';
import { FitnessIcon, FitnessIconType } from './fitness-icon';

interface CheckListCardProps {
    text: string;
    isChecked: boolean;
    onClick: () => void;
    icon?: React.ReactNode | string | FitnessIconType | any; // FitnessIconType 추가
    subtitle?: string;
}

export const CheckListCard = ({ text, isChecked, onClick, icon, subtitle }: CheckListCardProps) => {
    return (
        <div 
            onClick={onClick} 
            className={`${
                isChecked 
                    ? 'bg-[#656565] text-white' 
                    : 'bg-[#F5F5F5] text-[#767676]'
            } rounded-[20px] flex h-22 items-center py-2 px-5 justify-between whitespace-pre-line cursor-pointer transition-colors`}
        >
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="w-6 h-6 flex items-center justify-center">
                        {typeof icon === 'string' && ['STRENGTH', 'CARDIO', 'ENDURANCE', 'FLEXIBILITY', 'AGILITY', 'QUICKNESS'].includes(icon) ? (
                            <FitnessIcon type={icon as FitnessIconType} isActive={isChecked} size={24} />
                        ) : typeof icon === 'string' ? (
                            <span className="text-2xl">{icon}</span>
                        ) : icon.src ? (
                            <Image src={icon} alt="" width={24} height={24} />
                        ) : (
                            icon
                        )}
                    </div>
                )}
                <div>
                    <div className="font-medium">{text}</div>
                    {subtitle && (
                        <div className={`text-sm ${isChecked ? 'text-gray-300' : 'text-gray-500'}`}>
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>
            {isChecked && <Image src={checkWhite} alt="" width={24} height={24} />}
        </div>
    );
};
