"use client";
import HexProfileHeader from "@/components/hex-profile-header";
import HexChartSection from "@/components/hex-chart-section";
import HexCardList from "@/components/hex-card-list";
import { useHex } from "@/api/hex/useHex";
import { useHexDateListQuery } from "@/api/hex/queries";
import BottomSheetDatePicker from "@/components/bottom-sheet-date-picker";
import { useState, useEffect } from "react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { useSearchParams } from "next/navigation";

export default function HexPage() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchParams = useSearchParams();

  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오는 함수
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    // URL 파라미터에서 date를 확인하거나 오늘 날짜를 기본값으로 설정
    const dateParam = searchParams.get('date');
    const defaultDate = dateParam || getTodayDate();
    setSelectedDate(defaultDate);
  }, [searchParams]);

  const { data, isLoading, error } = useHex({ date: selectedDate });
  const { data: dateList } = useHexDateListQuery();

  if (isLoading) {
    console.log("Loading...")
    return (
      <main className="flex flex-col items-center">
      </main>
    );
  }

  if (error) {
    console.error("Error loading data:", error);
    return (
      <main className="flex flex-col items-center">
      </main>
    );
  }

  if (!data) {
    console.error("No data available");
    return (
      <main className="flex flex-col items-center">
      </main>
    );
  }

  return (
    <main className="w-full pb-10">
      <div className="w-full px-4">

      <HexChartSection
        data={data}
        onDateClick={() => setSheetOpen(true)}
      />
      <HexCardList data={data} />
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
