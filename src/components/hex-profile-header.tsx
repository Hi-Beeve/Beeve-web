import React from "react";
import { HexUserProfile } from "@/types/hex";
import ProfileCircle from "./profile-circle";
import { FONT_STYLES } from "@/styles/fontStyles";

interface HexProfileHeaderProps {
  user: HexUserProfile;
}

export default function HexProfileHeader({ user }: HexProfileHeaderProps) {
  return (
    <header className="w-100 flex items-center justify-between py-4 px-5" >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ProfileCircle profile={user.profileImage} />
        <span className={FONT_STYLES.body1} style={{ color: '#9B8EC2' }}>Hello! <span className="text-black">{user.name}</span></span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <img src="/share.svg" alt="share" />
      </div>
    </header>
  );
}
