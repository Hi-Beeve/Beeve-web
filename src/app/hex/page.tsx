"use client";
import HexProfileHeader from "@/components/hex-profile-header";
import HexChartSection from "@/components/hex-chart-section";
import HexCardList from "@/components/hex-card-list";
import { useHex } from "@/api/hex/useHex";
import { useHexDateListQuery } from "@/api/hex/queries";
import BottomSheetDatePicker from "@/components/bottom-sheet-date-picker";
import { useState } from "react";
import { BottomSheet } from "@/components/common/BottomSheet";

export default function HexPage() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading, error } = useHex({ date: selectedDate });
  const { data: dateList } = useHexDateListQuery();

  if (isLoading) {
    return (
      <main className="flex flex-col items-center">
        <div>Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center">
        <div>Error loading data</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex flex-col items-center">
        <div>No data available</div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center pb-20 min-h-screen w-full max-w-screen bg-gradient-to-b from-[#F5F5F5] to-[#D9D4E8]">
      <HexProfileHeader user={data.user} />
      <div className="w-full px-4">

      <HexChartSection
        hexDataArray={data.hexDataArray}
        date={data.date}
        onDateClick={() => setSheetOpen(true)}
      />
      <HexCardList user={data.user} gradeInfo={data.gradeInfo} />
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <BottomSheetDatePicker 
        dateList={dateList}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setSheetOpen(false);
        }}
       
        />
      </BottomSheet>
    </div>
    </main>
  );
}
