import React from "react";
import { HexUserProfile } from "@/types/hex";
import ProfileCircle from "./profile-circle";
import { FONT_STYLES } from "@/styles/fontStyles";
import { useRouter } from "next/navigation";

interface HexProfileHeaderProps {
  user: HexUserProfile;
}

export default function HexProfileHeader({ user }: HexProfileHeaderProps) {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/mypage');
  };

  return (
    <header className="w-full z-100 bg-[#F5F5F5] fixed top-0 left-0 right-0 " >
      <div className="w-full flex items-center justify-between py-4 px-5">
       
      <div 
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
        onClick={handleProfileClick}
      >
        <ProfileCircle profile={user.profileImage} />
        <span className={FONT_STYLES.body1} style={{ color: '#9B8EC2' }}>Hello! <span className="text-black">{user.name}</span></span>
      </div>
      <div className="flex gap-12">
        {/* <img src="/share.svg" alt="share" /> */}
      </div>
       </div>
    </header>
  );
}
