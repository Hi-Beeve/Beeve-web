'use client';
import Image from "next/image"
import arrowLeft from "../../../public/arrow_left.svg"

export const BackHeader = ({handleClickBack}: {handleClickBack: () => void}) => {
    return(
        <div onClick={handleClickBack}>

        <Image src={arrowLeft} width={24} height={24} alt="arrow-left" />
        </div>
    )
}