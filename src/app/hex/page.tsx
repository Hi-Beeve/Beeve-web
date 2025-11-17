"use client";
import HexProfileHeader from "@/components/hex-profile-header";
import HexChartSection from "@/components/hex-chart-section";
import HexCardList from "@/components/hex-card-list";
import { useHex } from "@/api/hex/useHex";

export default function HexPage() {
  const { data, isLoading, error } = useHex();

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
      <HexChartSection hexDataArray={data.hexDataArray} date={data.date} />
      <HexCardList user={data.user} gradeInfo={data.gradeInfo} />
    </main>
  );
}
