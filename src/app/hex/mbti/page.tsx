"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FitnessMbtiResultView from "@/components/fitness-mbti-result-view";
import { useHex } from "@/api/hex/useHex";

function HexMbtiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? undefined;
  const { data, isLoading, isError } = useHex({ date });

  return (
    <FitnessMbtiResultView
      fitness={data?.fitness}
      isLoading={isLoading}
      isError={isError}
      onHome={() => router.push("/hex")}
      onBack={() => router.push("/hex")}
    />
  );
}

export default function HexMbtiPage() {
  return (
    <Suspense fallback={null}>
      <HexMbtiContent />
    </Suspense>
  );
}
