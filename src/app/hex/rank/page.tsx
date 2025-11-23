import { CardBackground, CardTitleWithIcon, CardValue } from "@/components/hex-card-list"
import gradeIcon from "../../../../public/grade.svg"
import Image from "next/image"
import { FONT_COLORS, FONT_STYLES } from "@/styles/fontStyles"

export default function RankPage() {
    return (
    <div className="w-full pt-10 px-5 pb-10 flex flex-col gap3">
        <RankCard rank={MockData.rank} />
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
const MockData = {
    rank: 1,
}

