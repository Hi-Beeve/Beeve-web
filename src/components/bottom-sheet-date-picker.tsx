import React from "react";
import Picker from "react-mobile-picker";

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
  if (!dateList || dateList.length === 0) return null;
  const pickerData = { date: dateList };
  const pickerValue = { date: selectedDate || dateList[0] };
  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 bg-white p-4 shadow-lg">
      <div className="flex flex-col items-center">
        <div className="w-full flex justify-center mb-2 font-semibold">날짜 선택</div>
        <div style={{ width: 240, height: 180 }}>
          <Picker
            height={180}
            itemHeight={36}
            value={selectedDate || (dateList && dateList[0])}
            onChange={onSelectDate}
          >
            <Picker.Column name="date">
              {dateList?.map((option) => (
                <Picker.Item key={option} value={option}>
                  {option}
                </Picker.Item>
              ))}
            </Picker.Column>
          </Picker>
        </div>
        <button className="mt-2 text-gray-500" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
