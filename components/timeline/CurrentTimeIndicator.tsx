"use client";

import { useEffect, useRef, useState } from "react";

// 타임라인에서 분 단위로 현재 시간 위치를 계산
export default function CurrentTimeIndicator({
  startTime,
  endTime,
  rowHeight,
}: {
  startTime: number;
  endTime: number;
  rowHeight: number; // px per 30 minutes
}) {
  const [position, setPosition] = useState<number | null>(null);
  const [timeLabel, setTimeLabel] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calculatePosition = () => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startTime * 60;
    const endMinutes = endTime * 60;

    if (totalMinutes < startMinutes || totalMinutes >= endMinutes) {
      setPosition(null);
      return;
    }

    const elapsed = totalMinutes - startMinutes;
    const px = (elapsed / 30) * rowHeight;
    setPosition(px);

    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    setTimeLabel(`${h}:${m}`);
  };

  useEffect(() => {
    calculatePosition();
    intervalRef.current = setInterval(calculatePosition, 30000); // 30초마다 갱신
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime, rowHeight]);

  if (position === null) return null;

  return (
    <div
      className="current-time-line"
      style={{ top: `${position}px` }}
    >
      {/* 시간 레이블 */}
      <span className="absolute left-0 top-[-8px] text-[10px] font-semibold text-red-500 w-11 text-right pr-1 leading-none">
        {timeLabel}
      </span>
      {/* 점 */}
      <span className="current-time-dot pulse-dot" />
      {/* 라인은 CSS ::before로 */}
    </div>
  );
}
