import { AppBar } from "@/components/hex-appbar";

export default function HexLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AppBar />
            {children}
        </>
    );
}