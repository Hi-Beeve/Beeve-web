import React from "react";
import { FitnessUnitMap, HexData, HexWithDateResponse } from "@/types/hex";
import { FONT_COLORS, FONT_STYLES } from "@/styles/fontStyles";
import Image from "next/image";
import gradeIcon from "../../public/grade.svg"
import placeIcon from "../../public/place.svg"
import rankIcon from "../../public/rank.svg"
import ProfileCircle from "./profile-circle";
import place_home from "../../public/place_home.svg"
import place_gym from "../../public/place_gym.svg"
import place_outside from "../../public/place_outside.svg"
import { FitnessIconMap, FitnessNameMap, FitnessProgramMap } from "./common/Fitness";
import HexProgramBarGraph from "./hex/hex_program_bar_graph";
import HexProgramBar from "./hex/hex_program_bar";

interface HexCardListProps {
  data: HexWithDateResponse;
}

export default function HexCardList({ data }: HexCardListProps) {
  return (
    <section className="w-full py-5 flex flex-col gap-4" >

      <ProfileCard user={data}/>
      <TotalGradeCard grade={data.totalGrade}/>
      <RankCard rank={data.totalRank}/>
      <PlaceCard place={data.measurePlace}/>
      <h3 className={`${FONT_STYLES.heading3} py-3 px-1`}>체력항목</h3>
      <FitnessCardList fitness={data.fitness} age={data.age} gender={data.gender}/>
    </section>
  );
}

const ProfileCard = ({user}: {user: HexWithDateResponse}) => {
  return(
<CardBackground>
  <div className="flex gap-1 items-start">
        <ProfileCircle profile=""/>
    </div>
        <div>
          <div className="flex gap-1 items-end"><CardCaption caption="신체정보" /> <CardValue value={`${user.height}cm / ${user.weight}kg`} /></div>
          <div className="flex gap-1 items-end"><CardCaption caption="나이(만)" /> <CardValue value={`${user.age}세`} /></div>
        </div>
      </CardBackground>
  )
}


const TotalGradeCard = ({grade}: {grade: number}) => {
    return(
      <CardBackground >
        <CardTitleWithIcon className="bg-[#BDB2DD]" icon={<Image src={gradeIcon} alt="gradeIcon" width={10} height={20}/>} title="등급"/>
        <CardValue value={`${grade}등급`}/>
      </CardBackground>
    )
  }

const RankCard = ({rank}: {rank: number}) => {
    return(
        <CardBackground>
            <CardTitleWithIcon className="bg-[#F4D5DB]" icon={<Image src={rankIcon} alt="rankIcon" width={24} height={24}/>} title="순위"/>
            <div className={`flex items-end gap-1`}><span className={`${FONT_STYLES.body14} ${FONT_COLORS.grey}`}>동년배 100명 중 </span><CardValue value={`${rank}등`}/></div>
        </CardBackground>
    )
}

const PlaceCard = ({place}: {place: string}) => {

    return(
        <CardBackground>
            <CardTitleWithIcon className="bg-[#9AC5ED]" icon={<Image src={placeIcon} alt="placeIcon" width={24} height={24}/>} title="측정장소"/>
        <Image src={place === "GYM" ? place_gym : place === "HOME" ? place_home : place_outside} alt="placeIcon" width={24} height={24}/>
        </CardBackground>
    )
}

const FitnessCardList = ({fitness, age, gender}: {fitness: HexData[], age: number, gender: string}) => {
  const getSize = (fitnessType: any) => {
    return fitnessType === "STRENGTH" ? 20 : 24;
  }
    return(
        <div className="flex flex-col gap-4">
            {fitness.map((item) => {
              const size = getSize(item.fitnessType);
              return(
                <CardBackground key={item.fitnessType} className="flex-col items-start gap-4">
                    <CardTitleWithIcon className="bg-[#BDB2DD]" icon={<Image src={FitnessIconMap[item.fitnessType]} alt="gradeIcon" width={size} height={size}/>} title={FitnessNameMap[item.fitnessType]}/>
                    <ResultData program={item.program} value={item.rawValue || item.value} fitnessType={item.fitnessType}/>
                    {/* TODO : 성별 데이터 형식 useHex에서 수정 */}
                    <HexProgramBar value={item.value} age={age} fitnessType={item.fitnessType} gender={gender === "MALE" ? "male" : "female"} grade={item.grade}/>
                </CardBackground>
                )
              }
            )}
        </div>
    )
}

export const CardTitleWithIcon = ({icon, title, className}: {icon: React.ReactNode, title: string, className: string}) => {
    return (
        <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${className}`}>

      {icon}
      </div>
        <CardTitle title={title} />
        </div>
    )
}

  const CardTitle = ({title}: {title: string}) => {
      return (
              <div className={FONT_STYLES.heading4}>{title}</div>
      )
  }

  export const CardValue = ({value}: {value: string}) => {
    return (
      <div className={`${FONT_STYLES.heading3} ${FONT_COLORS.primaryDark} tracking-[-0.2px]`}>{value}</div>
    )
  }

  const CardCaption = ({caption}: {caption: string}) => {
    return (
      <div className={FONT_STYLES.body14 + " pb-1"}>{caption}</div>
    )
  }

  export const CardBackground = ({children, className}: {children: React.ReactNode, className?: string}) => {
    return(
      <div className={`flex items-center px-5 py-4 rounded-[20px] justify-between bg-white ${className}`}>
        {children}
      </div>
    ) 
  }

const ResultData = ({program, value, fitnessType}: {program: string, value: number, fitnessType: string}) => {
    return (
        <div className={`flex items-center gap-2 text-[#767676]`}>
          <div className="pr-5 border-r-[1px] border-[#D9D9D9]">
            <CardCaption caption="측정항목"/>
            <div className={FONT_STYLES.heading6}>{FitnessProgramMap[program as keyof typeof FitnessProgramMap]}</div>
            </div>
          <div>
            <CardCaption caption="기록"/>
            <div className={FONT_STYLES.heading6}>{value}{FitnessUnitMap[fitnessType as keyof typeof FitnessUnitMap]}</div>
          </div>
        </div>
    )
}