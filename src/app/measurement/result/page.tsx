"use client";

import { useRouter } from "next/navigation";
import FitnessMbtiResultView from "@/components/fitness-mbti-result-view";
import { useHex } from "@/api/hex/useHex";

export default function MeasurementResultPage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  console.log('📊 Result page - today:', today);
  const { data, isLoading, isError, status, fetchStatus } = useHex({ date: today, noCache: true });
  console.log('📊 Result page - query status:', status, 'fetchStatus:', fetchStatus, 'data:', data);

  return (
    <FitnessMbtiResultView
      fitness={data?.fitness}
      isLoading={isLoading}
      isError={isError}
      onHome={() => router.push("/hex")}
    />
  );
}
