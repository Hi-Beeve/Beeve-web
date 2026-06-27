'use client';

import { useState } from 'react';
import { AppBar } from "@/components/hex-appbar";
import HexProfileHeader from "@/components/hex-profile-header";
import { useAuth } from "@/contexts/auth-context";
import { useMember } from "@/api/mypage/useMypage";
import { AiConsentModal } from "@/components/AiConsentModal";
import { useRouter } from 'next/navigation';

export default function HexLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const { data: member, isSuccess } = useMember();
    const [consentDismissed, setConsentDismissed] = useState(false);
    const router = useRouter();

    const userData = isAuthenticated && user ? {
        name: user.nickname,
        profileImage: user.profileImage || '/default-profile.png'
    } : {
        name: 'GUEST',
        profileImage: '/default-profile.png'
    };

    const showConsentModal = isAuthenticated && isSuccess && member?.aiConsent === false && !consentDismissed;

    return (
        <div className="min-h-screen">
            <HexProfileHeader user={userData} />
            <main className="flex flex-col items-center pt-10 pb-20 min-h-screen w-full max-w-screen bg-gradient-to-b from-[#F5F5F5] to-[#D9D4E8]">
                {children}
            </main>
            <AppBar />
            {showConsentModal && (
                <AiConsentModal
                    onConsent={() => setConsentDismissed(true)}
                    onCancel={() => router.push('/')}
                />
            )}
        </div>
    );
}
