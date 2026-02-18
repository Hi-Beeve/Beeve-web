"use client";

import { useState, useMemo } from "react";

interface WeekDateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function WeekDateSelector({
  selectedDate,
  onDateChange,
}: WeekDateSelectorProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    // 오늘 기준으로 weekOffset * 7일 만큼 이동한 주의 7일
    // weekOffset 0 → 오늘이 마지막 날인 최근 7일
    const endDay = new Date(today);
    endDay.setDate(endDay.getDate() + weekOffset * 7);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(endDay);
      d.setDate(endDay.getDate() - i);
      dates.push(d);
    }
    return dates;
  }, [today, weekOffset]);

  const monthLabel = useMemo(() => {
    const first = weekDates[0];
    const last = weekDates[6];
    if (first.getMonth() === last.getMonth()) {
      return `${first.getFullYear()}년 ${first.getMonth() + 1}월`;
    }
    return `${first.getMonth() + 1}월 - ${last.getMonth() + 1}월`;
  }, [weekDates]);

  const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setWeekOffset((prev) => prev - 1)}
          className="w-8 h-8 flex items-center justify-center text-gray-500"
          aria-label="이전 주"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-sm font-medium text-gray-700">{monthLabel}</span>
        <button
          onClick={() => {
            if (weekOffset < 0) setWeekOffset((prev) => prev + 1);
          }}
          className={`w-8 h-8 flex items-center justify-center ${weekOffset >= 0 ? "text-gray-300" : "text-gray-500"}`}
          disabled={weekOffset >= 0}
          aria-label="다음 주"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex justify-between items-center">
        {weekDates.map((date) => {
          const dateStr = formatDate(date);
          const isSelected = dateStr === selectedDate;
          const isToday = formatDate(date) === formatDate(today);
          const isFuture = date > today;
          const dayLabel = DAY_LABELS[date.getDay()];

          return (
            <button
              key={dateStr}
              onClick={() => {
                if (!isFuture) onDateChange(dateStr);
              }}
              disabled={isFuture}
              className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-colors ${
                isFuture
                  ? "text-gray-300 cursor-not-allowed"
                  : isSelected
                  ? "text-[#9B8EC2]"
                  : "text-black"
              }`}
            >
              <span className="text-[10px]">{dayLabel}</span>
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                  isSelected
                    ? "bg-[#9B8EC2] text-white"
                    : isToday
                    ? "border border-[#9B8EC2] text-[#9B8EC2]"
                    : ""
                }`}
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
