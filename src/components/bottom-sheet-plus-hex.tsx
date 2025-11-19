import Image from "next/image";
import hex_line from "../../public/hex_line.svg"
import { FONT_COLORS, FONT_STYLES } from "@/styles/fontStyles"

export const BottomSheetPlusHex = () => {
    return (
        <div className="w-full flex flex-col items-center pt-8 px-10 gap-5">
            <div className="flex flex-col items-center gap-2">

            <Image src={hex_line} alt="hex_line" width={90} height={90}/>
            <div className={FONT_STYLES.body14 + " flex flex-col items-center " + FONT_COLORS.grey}>
                <span>당신의 6각 체력을 측정해보세요.</span>
                <span>또는 국민체력 100 측정 데이터 불러오기를 통해</span>
                <span>체력측정이 가능합니다.</span>
            </div>
            </div>
            <div className="flex flex-col items-center gap-2 w-full">

            {/* TODO : 체력 측정 페이지로 연결 */}
            <button className={FONT_STYLES.heading4 + " text-white bg-black flex items-center justify-center w-full h-[80px] rounded-[30px]"}>6각 체력 측정하기</button>
            {/* TODO : 기능 추가 예정 */}
            <button className={FONT_STYLES.heading4 + " text-white bg-[#A59AC7] flex items-center justify-center w-full h-[60px] rounded-[30px]"}>국민체력 100 측정 데이터 불러오기</button>
            </div>
        </div>
    )
}