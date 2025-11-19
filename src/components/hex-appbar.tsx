import home from "../../public/home.svg"
import graph from "../../public/graph.svg"
import rank from "../../public/rank.svg"
import recommend from "../../public/recommend.svg"
import Image from "next/image"
import add from "../../public/add.svg"
import { FONT_COLORS, FONT_STYLES } from "@/styles/fontStyles"

export const AppBar = () => {
    return (
        <div className="w-full h-18 bg-white absolute bottom-0 left-0 flex ">
            <div className="flex px-3 w-[calc((100%-65px)/2)] justify-evenly gap-4">
                <MenuIcon icon={home} name="홈"/>
                <MenuIcon icon={graph} name="변화"/>
            </div>
            <div className="relative w-[65px] h-[65px] rounded-full bg-[#BDB2DD] bottom-5 ">
                <div className="w-full h-full flex justify-center">
                    <Image src={add} alt="add" width={48} height={48} />
                </div>
            </div>
            <div className="flex px-3 w-[calc((100%-65px)/2)] justify-evenly gap-4">
                <MenuIcon icon={rank} name="순위"/>
            <MenuIcon icon={recommend} name="추천"/>
            </div>
        </div>
    )
}

const MenuIcon = ({ icon, name }: { icon: any; name: string }) => {
    return (
        <div className="flex flex-col items-center py-2 h-full justify-center items-center gap-1">
            <Image src={icon} alt={name} width={24} height={24}/>
            <p className={FONT_STYLES.body14 + " " + FONT_COLORS.grey}>{name}</p>
        </div>
    )
}
    