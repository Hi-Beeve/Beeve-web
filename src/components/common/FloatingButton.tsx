import { FONT_STYLES } from "@/styles/fontStyles";

export default function FloatingButton({ children, className, onClick }: { children: React.ReactNode; className?: string, onClick?: () => void }) {
    return (
        <button className={`fixed bottom-8 right-8 left-8 z-50 bg-[#BDB2DD] text-white rounded-[20px] ${FONT_STYLES.body5} ${className}`} onClick={onClick}>
            {children}
        </button>
    );
}