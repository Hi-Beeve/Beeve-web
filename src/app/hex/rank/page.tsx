'use client';

import { CardBackground, CardTitleWithIcon, CardValue } from "@/components/hex-card-list"
import gradeIcon from "../../../../public/grade.svg"
import Image from "next/image"
import { FONT_COLORS, FONT_STYLES } from "@/styles/fontStyles"
import { HexLineGraph } from "@/components/hex/hex_line_graph"
import { FitnessIconMap, FitnessNameMap } from "@/components/common/Fitness"
import { HexData } from "@/types/hex"
import { useRank } from "@/api/rank/useRank"
import { calculateAge, getAgeRange } from "@/utils/ageRange"

export default function RankPage() {
  const { data: rankData } = useRank();
  
  // 사용자의 생년월일을 기반으로 연령대 계산
  const getUserAgeRange = (): string => {
    // localStorage에서 사용자 추가 정보 확인 (회원가입 시 저장된 정보)
    if (typeof window !== 'undefined') {
      const storedUserInfo = localStorage.getItem('userAdditionalInfo');
      if (storedUserInfo) {
        try {
          const userInfo = JSON.parse(storedUserInfo);
          if (userInfo.birthDate) {
            const age = calculateAge(userInfo.birthDate);
            return getAgeRange(age);
          }
        } catch (error) {
          console.log('Failed to parse user additional info:', error);
        }
      }
    }
    
    return "20~24"; // 기본값
  };
  
  const ageRange = getUserAgeRange();
  
  return (
    <div className="w-full pt-10 px-5 pb-10 flex flex-col gap-3">
        <Title ageRange={ageRange}/>
        <RankCard rank={rankData?.currentRank?.percentile || 0} />
        <HexLineGraph title="" data={rankData?.chartData || {labels: [], values: [], icon: ""}} minValue={1} maxValue={100} stepSize={25} />
        <DetailTitle />
        <RankFitnessCardList fitness={rankData?.fitnessData || []}/>
    </div>
    )
}

const Title = ({ageRange}: {ageRange: string}) => {
    return(
        <div className="flex flex-col items-start gap-2">
            <p className={`${FONT_STYLES.body13}`}>{ageRange}세 중</p>
            <p className={`${FONT_STYLES.heading28}`}>나의 체력</p>
        </div>
    )
}

const DetailTitle = () =>{
    return(
        <div className="flex flex-col justify-between pt-10">
            <p className={`${FONT_STYLES.heading3}`}>항목별</p>
            <div className={`${FONT_STYLES.body14} ${FONT_COLORS.primaryDark}`}>동년배 중 나의 상위 백분위</div>
        </div>
    )
}
const RankCard = ({rank}: {rank: number}) => {
    return(
        <CardBackground>
            <CardTitleWithIcon className="bg-[#BDB2DD]" icon={<Image src={gradeIcon} alt="rankIcon" width={10} height={24}/>} title=""/>
            <div className={`flex items-end gap-1`}><span className={`${FONT_STYLES.body14} ${FONT_COLORS.primaryDark}`}>동년배 상위 </span><CardValue value={`${rank}%`}/></div>
            
        </CardBackground>
    )
}

const RankFitnessCardList = ({fitness}: {fitness: HexData[]}) => {
  const getSize = (fitnessType: any) => {
    return fitnessType === "STRENGTH" ? 20 : 24;
  }
    return(
        <div className="flex flex-col gap-4">
            {fitness.map((item) => {
              const size = getSize(item.fitnessType);
              return(
                <CardBackground key={item.fitnessType} className="flex justify-between gap-2">
                    <CardTitleWithIcon icon={<Image src={FitnessIconMap[item.fitnessType]} alt="gradeIcon" width={size} height={size}/>} title={FitnessNameMap[item.fitnessType]}/>
                    <CardValue value={`상위 ${item.grade}%`}/>
                </CardBackground>
                )
              }
            )}
        </div>
    )
}

