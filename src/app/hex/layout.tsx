'use client';

import { AppBar } from "@/components/hex-appbar";
import HexProfileHeader from "@/components/hex-profile-header";
import { useAuth } from "@/contexts/auth-context";

export default function HexLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuth();

    // 로그인하지 않은 경우 기본값 사용
    const userData = isAuthenticated && user ? {
        name: user.nickname,
        profileImage: user.profileImage || '/default-profile.png' // 기본 프로필 이미지
    } : {
        name: 'GUEST',
        profileImage: '/default-profile.png'
    };

    return (
        <div className="min-h-screen">
            <HexProfileHeader user={userData} />
            <main className="flex flex-col items-center pt-10 pb-20 min-h-screen w-full max-w-screen bg-gradient-to-b from-[#F5F5F5] to-[#D9D4E8]">
            {children}
            </main>
            <AppBar />
        </div>
    );
}
