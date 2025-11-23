import { AppBar } from "@/components/hex-appbar";
import HexProfileHeader from "@/components/hex-profile-header";

export default function HexLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            <HexProfileHeader user={USER_DATA} />
            <main className="flex flex-col items-center pt-10 pb-20 min-h-screen w-full max-w-screen bg-gradient-to-b from-[#F5F5F5] to-[#D9D4E8]">
            {children}
            </main>
            <AppBar />
        </div>
    );
}

// TODO : 로그인 시 스토리지에 저장한 데이터를 불러오도록 수정
const USER_DATA = {
    name: 'YERIEL',
    profileImage: 'https://example.com/profile.jpg',
};
