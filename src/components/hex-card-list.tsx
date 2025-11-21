import React from "react";
import { HexWithDateResponse } from "@/types/hex";
import { FONT_COLORS, FONT_STYLES } from "@/styles/fontStyles";
import Image from "next/image";
import gradeIcon from "../../public/grade.svg"
import placeIcon from "../../public/place.svg"
import rankIcon from "../../public/rank.svg"
import ProfileCircle from "./profile-circle";
interface HexCardListProps {
  data: HexWithDateResponse;
}

export default function HexCardList({ data }: HexCardListProps) {
  return (
    <section className="w-full py-5 rounded-6 mt-4 flex flex-col gap-2" >

      <ProfileCard user={data}/>
      <TotalGradeCard grade={data.totalGrade}/>
      <RankCard rank={data.totalRank}/>
      <PlaceCard place={data.measurePlace}/>
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
            <div className="flex items-end gap-1">동년배 100명 중 <CardValue value={`${rank}등`}/></div>
        </CardBackground>
    )
}

const PlaceCard = ({place}: {place: string}) => {
    return(
        <CardBackground>
            <CardTitleWithIcon className="bg-[#9AC5ED]" icon={<Image src={placeIcon} alt="placeIcon" width={24} height={24}/>} title="지역"/>
            <CardValue value={`${place}`}/>
        </CardBackground>
    )
}

const CardTitleWithIcon = ({icon, title, className}: {icon: React.ReactNode, title: string, className: string}) => {
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

  const CardValue = ({value}: {value: string}) => {
    return (
      <div className={FONT_STYLES.heading3 + ` ${FONT_COLORS.primaryDark}`}>{value}</div>
    )
  }

  const CardCaption = ({caption}: {caption: string}) => {
    return (
      <div className={FONT_STYLES.body14 + " pb-1"}>{caption}</div>
    )
  }

  const CardBackground = ({children}: {children: React.ReactNode}) => {
    return(
      <div className={"flex items-center px-5 py-4 rounded-[20px] justify-between bg-white"}>
        {children}
      </div>
    ) 
  }