import { CardBackground, CardTitleWithIcon, CardValue } from "@/components/hex-card-list"
import gradeIcon from "../../../../public/grade.svg"
import Image from "next/image"
import { FONT_COLORS, FONT_STYLES } from "@/styles/fontStyles"
import { HexLineGraph } from "@/components/hex/hex_line_graph"
import { FitnessIconMap, FitnessNameMap } from "@/components/common/Fitness"
import { HexData } from "@/types/hex"
import { getRankApi } from "@/api/rank/useRank";

export default function RankPage() {
  const rankData = getRankApi();
  
    return (
    <div className="w-full pt-10 px-5 pb-10 flex flex-col gap-3">
        <Title ageRange={MockData.ageRange}/>
        <RankCard rank={MockData.rank} />
        <HexLineGraph title="" data={MockData.data} minValue={1} maxValue={100} stepSize={25} />
        <DetailTitle />
        <FitnessCardList fitness={MockData.fitness}/>
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
            <div className={`${FONT_STYLES.body14} ${FONT_COLORS.primaryDark}`}>동년배 100명 중 나의 등수</div>
        </div>
    )
}
const RankCard = ({rank}: {rank: number}) => {
    return(
        <CardBackground>
            <CardTitleWithIcon className="bg-[#BDB2DD]" icon={<Image src={gradeIcon} alt="rankIcon" width={10} height={24}/>} title=""/>
            <div className={`flex items-end gap-1`}><span className={`${FONT_STYLES.body14} ${FONT_COLORS.primaryDark}`}>동년배 100명 중 </span><CardValue value={`${rank}등`}/></div>
            
        </CardBackground>
    )
}

const FitnessCardList = ({fitness}: {fitness: HexData[]}) => {
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
                    <CardValue value={`${item.grade}등`}/>
                </CardBackground>
                )
              }
            )}
        </div>
    )
}

const MockData:{rank:number, ageRange:string, data:{labels:string[], values:number[], icon:string}, fitness:HexData[]} = {
    rank: 1,
    ageRange: "25~29",
    data: {
        labels: ["2025-01-01", "2025-01-02", "2025-01-03", "2025-01-04", "2025-01-05", "2025-01-06", "2025-01-07", "2025-01-08", "2025-01-09", "2025-01-10"],
        values: [100, 90, 80, 70, 60, 55, 40, 32, 20, 14],
        icon: ""
    },
    fitness: [
    {
      fitnessType: "STRENGTH",
      program: "WALL_PUSH_UP",
      value: 22,
      rawValue: 30,
      grade: 1
    },
    {
      fitnessType: "CARDIO",
      program: "VO2MAX",
      value: 50,
      grade: 1
    },
    {
      fitnessType: "ENDURANCE",
      program: "CROSS_CRUNCH",
      value: 20,
      grade: 2
    },
    {
      fitnessType: "FLEXIBILITY",
      program: "SIT_AND_REACH",
      value: 17,
      grade: 3
    },
    {
      fitnessType: "AGILITY",
      program: "REACTION_TIME",
      value: 0.223,
      grade: 2
    },
    {
      fitnessType: "QUICKNESS",
      program: "FLIGHT_TIME",
      value: 0.941,
      grade: 2
    }
  ],
}

