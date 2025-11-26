"use client";

import { useState, useEffect } from "react";
import { CheckListCard } from "@/components/check-list-card";
import { getMeasurementCompletions } from "@/utils/measurement-storage";
import { FitnessIconType } from "@/components/fitness-icon";

interface MeasurementItem {
  id: string;
  title: string;
  subtitle: string;
  icon: FitnessIconType;
  href: string;
}

const MEASUREMENT_ITEMS: MeasurementItem[] = [
  {
    id: "muscle",
    title: "근력",
    subtitle: "(측정시간) 1분", // 측정 완료 시 이곳에 데이터 추가 
    icon: "STRENGTH",
    href: "/measurement/pushup-counter"
  },
  {
    id: "endurance",
    title: "근지구력",
    subtitle: "(측정시간) 1분", // 측정 완료 시 이곳에 데이터 추가 
    icon: "ENDURANCE",
    href: "/measurement/description?type=situp"
  },
  {
    id: "cardio",
    title: "심폐지구력",
    subtitle: "(측정시간) 4분",
    icon: "CARDIO",
    href: "/measurement/description?type=step"
  },
  {
    id: "flexibility",
    title: "유연성",
    subtitle: "(측정시간) 3분",
    icon: "FLEXIBILITY",
    href: "/measurement/description?type=sit-and-reach"
  },
  {
    id: "agility",
    title: "민첩성",
    subtitle: "(측정시간) 3분",
    icon: "AGILITY",
    href: "/measurement/description?type=reaction-time"
  },
  {
    id: "quickness",
    title: "순발력",
    subtitle: "(측정시간) 3분",
    icon: "QUICKNESS",
    href: "/measurement/description?type=standing-jump"
  }
];

export default function MeasurementPage() {
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  useEffect(() => {
    // 로컬 스토리지에서 완료된 측정 항목들을 불러옴
    setCompletedItems(getMeasurementCompletions());
  }, []);

  const handleItemClick = (item: MeasurementItem) => {
    // 측정 페이지로 이동
    window.location.href = item.href;
  };

  const isCompleted = (itemId: string) => {
    return completedItems.includes(itemId);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-black">Beeve</h1>
        <h2 className="text-lg font-medium text-black mt-2">체력 측정하기</h2>
      </div>

      {/* STEP 1. 근체력 */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-semibold text-black mb-4">STEP 1. 건강체력</h3>
        <div className="space-y-3">
          {MEASUREMENT_ITEMS.slice(0, 4).map((item) => (
            <CheckListCard
              key={item.id}
              text={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              isChecked={isCompleted(item.id)}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </div>

      {/* STEP 2. 운동체력 */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-semibold text-black mb-4">STEP 2. 운동체력</h3>
        <div className="space-y-3">
          {MEASUREMENT_ITEMS.slice(4).map((item) => (
            <CheckListCard
              key={item.id}
              text={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              isChecked={isCompleted(item.id)}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </div>

      {/* 다음 버튼 */}
      <div className="fixed bottom-6 left-6 right-6">
        <button 
          className="w-full h-14 bg-[#BDB2DD] text-white rounded-[20px] font-medium"
          onClick={() => {
            // 모든 측정이 완료되었는지 확인하고 다음 단계로 이동
            if (completedItems.length === MEASUREMENT_ITEMS.length) {
              // 결과 페이지로 이동
              window.location.href = '/results';
            } else {
              alert('모든 측정을 완료해주세요.');
            }
          }}
        >
          다음
        </button>
      </div>
    </div>
  );
}
