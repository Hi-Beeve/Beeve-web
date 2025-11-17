"use client";
import HexProfileHeader from "@/components/hex-profile-header";
import HexChartSection from "@/components/hex-chart-section";
import HexCardList from "@/components/hex-card-list";
import { useHex } from "@/api/hex/useHex";
import { useHexDateListQuery } from "@/api/hex/queries";
import BottomSheetDatePicker from "@/components/bottom-sheet-date-picker";
import { useState } from "react";

export default function HexPage() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading, error } = useHex({ date: selectedDate });
  const { data: dateList } = useHexDateListQuery();

  if (isLoading) {
    return (
      <main style={{ minHeight: "100vh", background: "#faf9fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ minHeight: "100vh", background: "#faf9fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Error loading data</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ minHeight: "100vh", background: "#faf9fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>No data available</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#faf9fb", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <HexProfileHeader user={data.user} />
      <HexChartSection
        hexDataArray={data.hexDataArray}
        date={data.date}
        onDateClick={() => setSheetOpen(true)}
      />
      <HexCardList user={data.user} gradeInfo={data.gradeInfo} />
      <BottomSheetDatePicker
        open={sheetOpen}
        dateList={dateList}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setSheetOpen(false);
        }}
        onClose={() => setSheetOpen(false)}
      />
    </main>
  );
}
