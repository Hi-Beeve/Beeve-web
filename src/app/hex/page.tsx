import HexProfileHeader from "@/components/hex-profile-header";
import HexChartSection from "@/components/hex-chart-section";
import HexCardList from "@/components/hex-card-list";

export default function HexPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#faf9fb", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <HexProfileHeader />
      <HexChartSection />
      <HexCardList />
    </main>
  );
}
