import { FONT_COLORS, FONT_STYLES } from "@/styles/fontStyles";
import { ProfileResponse } from "@/types/mypage";

export const ProfileCard = ({ data }: { data: ProfileResponse }) => {
    return (
        <GrayCard className="flex flex-col items-start gap-5 py-5 px-4 w-full rounded-[20px]">
            <div className="flex items-center gap-2">
                <ProfileInfo tag="신체정보" value={`${data.height}cm/${data.weight}kg`} />
            </div>
            <div className="h-[1px] w-full bg-[#D9D9D9]"> </div>
            <BMI bmi={data.bmi.toString()} />
        </GrayCard>
    );
};

export const GrayCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={`bg-[#F5F5F5] ${className}`}>
            {children}
        </div>
    );
}

export const ProfileInfo = ({tag, value}: {tag: string, value: string}) => {
    return (
        <div className="flex items-center gap-2">
            <p className={`${FONT_STYLES.body17} ${FONT_COLORS.grey}`}>{tag}</p>
            <p className={FONT_STYLES.heading3}>{value}</p>
        </div>
    );
}

export const BMI = ({bmi}: {bmi: string}) => {
    const bmiValue = parseFloat(bmi);
    
    // BMI 범위별 색상 및 라벨 (한국 기준)
    const getBMIInfo = (value: number) => {
        if (value < 18.5) return { label: '저체중', color: '#89BDED', range: '18.5 미만' };
        if (value < 23) return { label: '정상', color: '#7F8AD3', range: '18.5~22.9' };
        if (value < 25) return { label: '비만전단계', color: '#C198E2', range: '23~24.9' };
        if (value < 30) return { label: '비만 1단계', color: '#DD6BB5', range: '25~29.9' };
        return { label: '비만 2단계', color: '#F09862', range: '30 이상' };
    };

    // BMI 값을 바 그래프 위치로 변환 (18.5~35 범위를 0~100%로 매핑)
    const getPosition = (value: number) => {
        const minBMI = 15;
        const maxBMI = 35;
        const position = ((value - minBMI) / (maxBMI - minBMI)) * 100;
        return Math.max(0, Math.min(100, position));
    };

    const bmiInfo = getBMIInfo(bmiValue);
    const position = getPosition(bmiValue);

    return (
        <div className="flex flex-col gap-3 w-full">
            <ProfileInfo tag="BMI" value={bmi} />
            
            {/* BMI 바 그래프 */}
            <div className="w-full">
                {/* BMI 범위 바 */}
                <div className="relative w-full h-6 rounded-[4px] overflow-hidden mb-2">
                    {/* 배경 그라데이션 바 */}
                    <div className="absolute inset-0 flex">
                        <div className="flex-1 bg-[#89BDED]"></div> {/* 저체중 */}
                        <div className="flex-1 bg-[#7F8AD3]"></div> {/* 정상 */}
                        <div className="flex-1 bg-[#C198E2]"></div> {/* 비만전단계 */}
                        <div className="flex-1 bg-[#DD6BB5]"></div> {/* 비만1단계 */}
                        <div className="flex-1 bg-[#F09862]"></div> {/* 비만2단계 */}
                    </div>
                    
                    {/* BMI 값 표시 화살표 */}
                    <div 
                        className="absolute top-0 w-1 h-full bg-black transform -translate-x-1/2"
                        style={{ left: `${position}%` }}
                    >
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-black"></div>
                    </div>
                </div>

                {/* BMI 범위 라벨 */}
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>15</span>
                    <span>18.5</span>
                    <span>23</span>
                    <span>25</span>
                    <span>30</span>
                    <span>35</span>
                </div>

                {/* 현재 BMI 상태 */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                        <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: bmiInfo.color }}
                        ></div>
                        <span className={`${FONT_STYLES.body17} font-medium`}>
                            {bmiInfo.label} ({bmiInfo.range})
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}