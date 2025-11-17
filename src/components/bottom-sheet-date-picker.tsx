import React from "react";

export default function BottomSheetDatePicker({
  open,
  dateList,
  selectedDate,
  onSelectDate,
  onClose,
}: {
  open: boolean;
  dateList?: string[];
  selectedDate?: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-2xl p-4 shadow-lg">
      <div className="flex flex-col items-center">
        {/* <div className="font-bold mb-2">날짜 선택</div> */}
        <div className="overflow-y-auto max-h-60 w-full">
          {dateList?.map((date) => (
            <div
              key={date}
              className={`py-2 px-4 text-center cursor-pointer ${selectedDate === date ? "bg-violet-200 font-bold" : ""}`}
              onClick={() => onSelectDate(date)}
            >
              {date}
            </div>
          ))}
        </div>
        <button className="mt-2 text-gray-500" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
