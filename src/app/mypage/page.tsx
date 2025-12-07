"use client"

import { useMember } from '@/api/mypage/useMypage';
import { BackHeader } from '@/components/common/BackHeader';
import { AppInfoCard, MemberLogout, ProfileCard } from '@/components/mypage/ProfileCard';
import { FONT_STYLES } from '@/styles/fontStyles';
import Image from 'next/image'
import { useRouter } from 'next/navigation';

const Mypage = () => {
    const { data } = useMember();
    const router = useRouter()

    const handleClickBack = () => {
     router.push("/hex");   
    }
    return (
        <div className="flex flex-col items-center py-10 px-5 gap-6">
            <div className='w-full'>

            <BackHeader handleClickBack={handleClickBack}/>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className='rounded-full bg-[#A38BEB80] w-[100px] h-[100px]'>{data?.profileUrl&& (
                    <Image src={data?.profileUrl} alt="mypage" width={100} height={100} />
                )}</div>
                
                <h1 className={FONT_STYLES.heading32}>{data?.name}</h1>
            </div>
            {data && <ProfileCard data={data} />}
            <AppInfoCard />
            <MemberLogout />
        </div>
    )
}

    
export default Mypage;