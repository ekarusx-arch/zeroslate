"use client";

import { useRef, useState, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { Settings } from "@/types";
import CurrentTimeIndicator from "./CurrentTimeIndicator";
import TimeBlock from "./TimeBlock";

const ROW_HEIGHT = 48; // px per 30min slot

function minutesToTimeString(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────────────
// 개별 슬롯 (드롭 영역)
// ─────────────────────────────────────────────────────────────────────
function TimeSlot({
  slotId,
  hour,
  minute,
  showHourLabel,
  onStartDraw,
}: {
  slotId: string;
  hour: number;
  minute: number;
  showHourLabel: boolean;
  onStartDraw: (hour: number, minute: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId });

  return (
    <div
      ref={setNodeRef}
      className={`time-slot flex relative ${isOver ? "bg-blue-100/60" : ""}`}
      style={{ height: `${ROW_HEIGHT}px` }}
      onMouseDown={(e) => {
        if (e.button === 0) onStartDraw(hour, minute);
      }}
    >
      {/* 시간 레이블 - 정시만 표시 */}
      <div className="w-14 shrink-0 flex items-start justify-end pr-3 pt-1">
        {showHourLabel && (
          <span className="text-xs font-semibold text-zinc-600 leading-none tracking-tight">
            {String(hour).padStart(2, "0")}:00
          </span>
        )}
      </div>

      {/* 슬롯 라인 */}
      <div
        className={`flex-1 border-l border-zinc-200 ${
          minute === 30
            ? "border-t border-dashed border-zinc-100"
            : "border-t border-zinc-200"
        }`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 타임라인 그리드 전체
// ─────────────────────────────────────────────────────────────────────
export default function TimelineGrid({ settings }: { settings: Settings }) {
  const timeBlocks = useTimeboxerStore((s) => s.timeBlocks);
  const addTimeBlock = useTimeboxerStore((s) => s.addTimeBlock);

  const containerRef = useRef<HTMLDivElement>(null);

  // 직접 그리기 상태
  const [drawing, setDrawing] = useState<boolean>(false);

  // 슬롯 목록 생성
  const slots: { hour: number; minute: number }[] = [];
  for (let h = settings.startTime; h < settings.endTime; h++) {
    slots.push({ hour: h, minute: 0 });
    slots.push({ hour: h, minute: 30 });
  }

  // ── 마우스 드래그로 직접 블록 그리기 ──────────────────────────────
  const handleStartDraw = useCallback(
    (hour: number, minute: number) => {
      if (!containerRef.current) return;
      const startMin = hour * 60 + minute;
      const endMin = startMin + 30;

      addTimeBlock({
        taskId: null,
        content: "새 블록",
        startTime: minutesToTimeString(startMin),
        endTime: minutesToTimeString(endMin),
      });

      setDrawing(true);

      const onMouseUp = () => {
        window.removeEventListener("mouseup", onMouseUp);
        setDrawing(false);
      };

      window.addEventListener("mouseup", onMouseUp);
    },
    [addTimeBlock]
  );

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{ cursor: drawing ? "ns-resize" : "default" }}
    >
      {/* 슬롯 행 */}
      {slots.map((slot) => {
        const slotId = `slot-${slot.hour}-${slot.minute}`;
        const showHourLabel = slot.minute === 0;
        return (
          <TimeSlot
            key={slotId}
            slotId={slotId}
            hour={slot.hour}
            minute={slot.minute}
            showHourLabel={showHourLabel}
            onStartDraw={handleStartDraw}
          />
        );
      })}

      {/* 타임 블록 렌더링 */}
      {timeBlocks.map((block) => (
        <div key={block.id} className="absolute inset-0 pointer-events-none">
          <div className="absolute left-14 right-0 top-0 bottom-0 pointer-events-auto">
            <TimeBlock
              block={block}
              startHour={settings.startTime}
              endHour={settings.endTime}
              containerRef={containerRef}
            />
          </div>
        </div>
      ))}

      {/* 현재 시간 인디케이터 */}
      <CurrentTimeIndicator
        startTime={settings.startTime}
        endTime={settings.endTime}
        rowHeight={ROW_HEIGHT}
      />
    </div>
  );
}
