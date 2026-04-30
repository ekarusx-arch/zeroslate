"use client";

import { useRef, useState, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { Settings } from "@/types";
import CurrentTimeIndicator from "./CurrentTimeIndicator";
import TimeBlock from "./TimeBlock";
import { ExternalLink } from "lucide-react";

const ROW_HEIGHT_30 = 48; // 30분당 기준 높이

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
  slotHeight,
  onStartDraw,
}: {
  slotId: string;
  hour: number;
  minute: number;
  showHourLabel: boolean;
  slotHeight: number;
  onStartDraw: (hour: number, minute: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId });

  return (
    <div
      ref={setNodeRef}
      className={`time-slot flex relative ${isOver ? "bg-blue-100/60" : ""}`}
      style={{ height: `${slotHeight}px` }}
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
          minute === 0
            ? "border-t border-zinc-200"
            : "border-t border-dashed border-zinc-100"
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
  const googleCalendarEvents = useTimeboxerStore((s) => s.googleCalendarEvents);

  const containerRef = useRef<HTMLDivElement>(null);

  // 직접 그리기 상태
  const [drawing, setDrawing] = useState<boolean>(false);

  // 슬롯 높이 계산 (30분당 ROW_HEIGHT_30 기준)
  const slotHeight = (settings.step / 30) * ROW_HEIGHT_30;

  // 슬롯 목록 생성
  const slots: { hour: number; minute: number }[] = [];
  for (let h = settings.startTime; h < settings.endTime; h++) {
    for (let m = 0; m < 60; m += settings.step) {
      slots.push({ hour: h, minute: m });
    }
  }

  // ── 마우스 드래그로 직접 블록 그리기 ──────────────────────────────
  const handleStartDraw = useCallback(
    (hour: number, minute: number) => {
      if (!containerRef.current) return;
      const startMin = hour * 60 + minute;
      const endMin = startMin + settings.step; // 슬롯 단위만큼 기본 생성

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
    [addTimeBlock, settings.step]
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
            slotHeight={slotHeight}
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

      {/* 구글 캘린더 이벤트 론루 */}
      {googleCalendarEvents.map((event) => {
        const [startH, startM] = event.start.split(":").map(Number);
        const [endH, endM] = event.end.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const timelineStart = settings.startTime * 60;
        const timelineEnd = settings.endTime * 60;

        if (startMinutes >= timelineEnd || endMinutes <= timelineStart) return null;

        const topPx = ((startMinutes - timelineStart) / 30) * ROW_HEIGHT_30;
        const heightPx = ((endMinutes - startMinutes) / 30) * ROW_HEIGHT_30;

        return (
          <div
            key={event.id}
            className="absolute left-14 right-0 pointer-events-auto z-5"
            style={{ top: `${topPx}px`, height: `${Math.max(heightPx, 20)}px` }}
          >
            <div
              className="absolute inset-x-1 inset-y-0 rounded-lg border flex items-center gap-1.5 px-2 overflow-hidden"
              style={{
                backgroundColor: `${event.color || '#7986cb'}22`,
                borderColor: `${event.color || '#7986cb'}55`,
                borderStyle: 'dashed',
              }}
            >
              <div className="w-1 shrink-0 rounded-full self-stretch my-1" style={{ backgroundColor: event.color || '#7986cb' }} />
              <span className="text-[11px] font-semibold text-zinc-600 truncate flex-1">{event.summary}</span>
              {event.htmlLink && (
                <a href={event.htmlLink} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 text-zinc-400 hover:text-blue-500 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        );
      })}

      {/* 현재 시간 인디케이터 */}
      <CurrentTimeIndicator
        startTime={settings.startTime}
        endTime={settings.endTime}
        rowHeight={ROW_HEIGHT_30}
      />
    </div>
  );
}
