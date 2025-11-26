import React from "react";
import Picker from "react-mobile-picker";

export default function BottomSheetDatePicker({
  dateList,
  selectedDate,
  onSelectDate,
}: {
  dateList?: string[];
  selectedDate?: string;
  onSelectDate: (date: string) => void;
}) {
  if (!dateList || dateList.length === 0) return null;
  return (
      <div className="flex flex-col items-center">
        <div className="w-full h-[280px]" >
          <Picker
            height={280}
            itemHeight={36}
            value={{ date: selectedDate || dateList[0] }}
            onChange={(val) => onSelectDate(val.date)}
          >
            <Picker.Column name="date">
              {dateList.map(option => (
                <Picker.Item key={option} value={option}>
                  {option}
                </Picker.Item>
              ))}
            </Picker.Column>
          </Picker>
        </div>
      </div>
  );
}  