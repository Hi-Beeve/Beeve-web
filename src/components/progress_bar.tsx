export const ProgressBar = ({stepInfo}: {stepInfo: {step: number, total: number}}) => {
    return (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">
              {stepInfo.step} / {stepInfo.total}
            </span>
          </div>
          <div className="w-full bg-[#F5F5F5] rounded-full h-1">
            <div 
              className="bg-[#BDB2DD] h-1 rounded-[5px] transition-all duration-300"
              style={{ width: `${(stepInfo.step / stepInfo.total) * 100}%` }}
            />
          </div>
        </div>
    );
};