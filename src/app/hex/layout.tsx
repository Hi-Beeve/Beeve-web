import { AppBar } from "@/components/hex-appbar";
import HexProfileHeader from "@/components/hex-profile-header";

export default function HexLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            <HexProfileHeader user={USER_DATA} />
            <AppBar />
            {children}
        </div>
    );
}

// TODO : 로그인 시 스토리지에 저장한 데이터를 불러오도록 수정
const USER_DATA = {
    name: 'YERIEL',
    profileImage: 'https://example.com/profile.jpg',
};
