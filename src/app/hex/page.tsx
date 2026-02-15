"use client";
import HexProfileHeader from "@/components/hex-profile-header";
import HexChartSection from "@/components/hex-chart-section";
import HexCardList from "@/components/hex-card-list";
import { useHex } from "@/api/hex/useHex";
import { useHexDateListQuery } from "@/api/hex/queries";
import BottomSheetDatePicker from "@/components/bottom-sheet-date-picker";
import { BottomSheetPlusHex } from "@/components/bottom-sheet-plus-hex";
import { useState, useEffect, Suspense } from "react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { useSearchParams } from "next/navigation";

function HexPageContent() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchParams = useSearchParams();


  useEffect(() => {
    // URL 파라미터에서 date를 확인하여 기본값으로 설정
    const dateParam = searchParams.get('date');
    if(dateParam){
      setSelectedDate(dateParam);
    }
  }, [searchParams]);

  const { data: dateList } = useHexDateListQuery();
  const { data, isLoading, error } = useHex({ date: selectedDate });

  // dateList 로드 후 첫 번째 날짜를 기본값으로 설정
  useEffect(() => {
    if (!selectedDate && dateList && dateList.length > 0) {
      setSelectedDate(dateList[0]);
    }
  }, [dateList, selectedDate]);

  if (isLoading) {
    console.log("Loading...")
  }

  if (error) {
    console.error("Error loading data:", error);
  }

  if (!data) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4">
        <BottomSheetPlusHex />
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

export default function HexPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HexPageContent />
    </Suspense>
  );
}
