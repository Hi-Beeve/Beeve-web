interface InfoCardProps {
  label: string;
  value: string;
  className?: string;
}

export const InfoCard = ({ label, value, className = "" }: InfoCardProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[#5C5D67] text-[12px]">{label}</span>
      <span className="text-[#5C5D67] text-[20px] font-bold">{value}</span>
    </div>
  );
};
