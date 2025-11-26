export default function FloatingButton({ children, className, onClick }: { children: React.ReactNode; className?: string, onClick?: () => void }) {
    return (
        <button className={`fixed bottom-8 right-8 left-8 z-50 bg-[#BDB2DD] text-white rounded-[20px] ${className}`} onClick={onClick}>
            {children}
        </button>
    );
}