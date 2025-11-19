"use client"

import home from "../../public/home.svg"
import graph from "../../public/graph.svg"
import rank from "../../public/rank.svg"
import recommend from "../../public/recommend.svg"
import Image from "next/image"
import add from "../../public/add.svg"
import { FONT_COLORS, FONT_STYLES } from "@/styles/fontStyles"
import Link from 'next/link';
import { BottomSheetPlusHex } from "./bottom-sheet-plus-hex"
import { BottomSheet } from "./common/BottomSheet"
import { useState } from "react"

export const AppBar = () => {
    const [open, setOpen] = useState(false);
    const handleClickPlus = () => {
        setOpen(true);
    }
    return (
        <div className="w-full h-18 bg-white fixed bottom-0 left-0 flex ">
            <div className="flex px-3 w-[calc((100%-65px)/2)] justify-evenly gap-4">
                <MenuIcon icon={home} name="홈" path="/hex" />
                <MenuIcon icon={graph} name="변화" path="/hex/graph" />
            </div>
            <div className="relative w-[65px] h-[65px] rounded-full bg-[#BDB2DD] bottom-5 " onClick={handleClickPlus}>
                <div className="w-full h-full flex justify-center">
                    <Image src={add} alt="add" width={48} height={48} />
                </div>
            </div>
            <div className="flex px-3 w-[calc((100%-65px)/2)] justify-evenly gap-4">
                <MenuIcon icon={rank} name="순위" path="/hex/rank"/>
                <MenuIcon icon={recommend} name="추천" path="/hex/recommend"/>
            </div>
            <BottomSheet open={open} onClose={() => setOpen(false)} className="rounded-t-[50px]">

            <BottomSheetPlusHex />
            </BottomSheet>
        </div>
    )
}

const MenuIcon = ({ icon, name, path}: { icon: any; name: string; path:string }) => {
    return (
        <Link href={path}>

        <div className="flex flex-col items-center py-2 h-full justify-center items-center gap-1">
            <Image src={icon} alt={name} width={24} height={24}/>
            <p className={FONT_STYLES.body14 + " " + FONT_COLORS.grey}>{name}</p>
        </div>
        </Link>
    )
}
    