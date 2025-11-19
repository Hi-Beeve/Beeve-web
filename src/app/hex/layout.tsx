import { AppBar } from "@/components/hex-appbar";

export default function HexLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            <AppBar />
            {children}
        </div>
    );
}