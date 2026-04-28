"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { useCurrentMinutes } from "@/hooks/useCurrentMinutes";
import { playAlarm } from "@/utils/audio";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, StickyNote, AlignLeft, X } from "lucide-react";
import { TimeBlock as TimeBlockType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ROW_HEIGHT = 48; // px per 30min
const MIN_BLOCK_MINUTES = 15; // 최소 15분

function minutesToPx(minutes: number) {
  return (minutes / 30) * ROW_HEIGHT;
}

function pxToMinutes(px: number) {
  return Math.round(((px / ROW_HEIGHT) * 30) / 5) * 5; // 5분 단위 스냅
}

function timeStringToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeString(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface TimeBlockProps {
  block: TimeBlockType;
  startHour: number;
  endHour: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function TimeBlock({
  block,
  startHour,
  endHour,
  containerRef,
}: TimeBlockProps) {
  const updateTimeBlock = useTimeboxerStore((s) => s.updateTimeBlock);
  const deleteTimeBlock = useTimeboxerStore((s) => s.deleteTimeBlock);
  const toggleTimeBlock = useTimeboxerStore((s) => s.toggleTimeBlock);

  const blockRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [tempMemo, setTempMemo] = useState(block.memo || "");
  const currentMinutes = useCurrentMinutes();

  const startMinutes = timeStringToMinutes(block.startTime);
  const endMinutes = timeStringToMinutes(block.endTime);
  const timelineStartMinutes = startHour * 60;
  const timelineEndMinutes = endHour * 60;

  const isActive = currentMinutes >= startMinutes && currentMinutes < endMinutes;
  const isPast = currentMinutes >= endMinutes;
  const progressPercent = isActive ? ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100 : 0;
  const isEndingSoon = isActive && (endMinutes - currentMinutes) <= 5;

  // ── 알림 효과 (시작/종료 시 한 번씩만 울리도록 ref로 관리) ──
  const alarmsRef = useRef({ start: false, end: false });

  useEffect(() => {
    // 시작 알림 (현재 시간이 시작 시간과 정확히 일치할 때)
    if (currentMinutes === startMinutes && !alarmsRef.current.start) {
      playAlarm("start");
      alarmsRef.current.start = true;
    }
    // 종료 알림 (현재 시간이 종료 시간과 일치할 때)
    if (currentMinutes === endMinutes && !alarmsRef.current.end) {
      playAlarm("end");
      alarmsRef.current.end = true;
    }

    // 시간이 초기화되거나 블록이 수정되면 플래그 리셋
    if (currentMinutes < startMinutes) alarmsRef.current.start = false;
    if (currentMinutes < endMinutes) alarmsRef.current.end = false;
  }, [currentMinutes, startMinutes, endMinutes]);

  const top = minutesToPx(startMinutes - timelineStartMinutes);
  const height = minutesToPx(endMinutes - startMinutes);

  const duration = endMinutes - startMinutes;
  const durationText =
    duration >= 60
      ? `${Math.floor(duration / 60)}h${duration % 60 > 0 ? ` ${duration % 60}m` : ""}`
      : `${duration}m`;

  // ── 상단 핸들 리사이즈 ──────────────────────────────
  const handleTopResize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!containerRef.current) return;

      const containerTop = containerRef.current.getBoundingClientRect().top;
      const originalEnd = endMinutes;

      const onMouseMove = (me: MouseEvent) => {
        const relY = me.clientY - containerTop;
        const newStartRaw = timelineStartMinutes + pxToMinutes(relY);
        const newStart = Math.max(
          timelineStartMinutes,
          Math.min(newStartRaw, originalEnd - MIN_BLOCK_MINUTES)
        );
        updateTimeBlock(block.id, {
          startTime: minutesToTimeString(newStart),
        });
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [block.id, endMinutes, timelineStartMinutes, containerRef, updateTimeBlock]
  );

  // ── 하단 핸들 리사이즈 ──────────────────────────────
  const handleBottomResize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!containerRef.current) return;

      const containerTop = containerRef.current.getBoundingClientRect().top;
      const originalStart = startMinutes;

      const onMouseMove = (me: MouseEvent) => {
        const relY = me.clientY - containerTop;
        const newEndRaw = timelineStartMinutes + pxToMinutes(relY);
        const newEnd = Math.min(
          timelineEndMinutes,
          Math.max(originalStart + MIN_BLOCK_MINUTES, newEndRaw)
        );
        updateTimeBlock(block.id, {
          endTime: minutesToTimeString(newEnd),
        });
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [
      block.id,
      startMinutes,
      timelineStartMinutes,
      timelineEndMinutes,
      containerRef,
      updateTimeBlock,
    ]
  );

  // ── 블록 드래그 이동 ──────────────────────────────
  const handleBlockDrag = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-handle]")) return;
      e.preventDefault();

      const blockDuration = endMinutes - startMinutes;
      const startY = e.clientY;
      const originalStartMin = startMinutes;
      const maxStartMin = timelineEndMinutes - blockDuration;

      const onMouseMove = (me: MouseEvent) => {
        const dy = me.clientY - startY;
        const deltaMin = pxToMinutes(dy);
        const newStart = Math.min(
          maxStartMin,
          Math.max(
          timelineStartMinutes,
          originalStartMin + deltaMin
          )
        );
        updateTimeBlock(block.id, {
          startTime: minutesToTimeString(newStart),
          endTime: minutesToTimeString(newStart + blockDuration),
        });
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [
      block.id,
      startMinutes,
      endMinutes,
      timelineStartMinutes,
      timelineEndMinutes,
      updateTimeBlock,
    ]
  );

  const handleSaveMemo = () => {
    updateTimeBlock(block.id, { memo: tempMemo });
    setIsMemoOpen(false);
  };

  return (
    <>
    <div
      ref={blockRef}
      className={`time-block group transition-all duration-300 overflow-hidden cursor-pointer ${
        isActive ? "active-block-glow" : ""
      } ${!isActive && isPast && !block.isCompleted ? "opacity-60 grayscale-[0.2]" : ""} ${
        isEndingSoon ? "animate-pulse ring-2 ring-red-400" : ""
      }`}
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 20)}px`,
        backgroundColor: block.color + "CC",
        borderLeft: `3px solid ${block.color}`,
        zIndex: isHovered ? 10 : 5,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => {
        // 드래그 로직 실행
        handleBlockDrag(e);
      }}
      onClick={(e) => {
        // 드래그 핸들이나 버튼 클릭 시에는 모달을 띄우지 않음
        if (!(e.target as HTMLElement).closest("button, input, [data-handle]")) {
          setTempMemo(block.memo || "");
          setIsMemoOpen(true);
        }
      }}
    >
      {/* 상단 리사이즈 핸들 */}
      <div
        data-handle="top"
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
        onMouseDown={handleTopResize}
      >
        <div className="w-8 h-0.5 bg-white/60 rounded-full" />
      </div>

      {/* 내부 프로그레스 바 (진행 중일 때만 표시) */}
      {isActive && (
        <div 
          className="absolute top-0 left-0 right-0 bg-white/20 transition-all duration-1000 ease-linear z-0 pointer-events-none"
          style={{ height: `${progressPercent}%` }}
        />
      )}

      {/* 블록 내용 */}
      <div className="px-2 pt-1 pb-4 h-full flex flex-col gap-0.5 overflow-hidden relative z-10">
        <div className="flex items-start gap-1.5">
          <Checkbox
            checked={block.isCompleted}
            onCheckedChange={() => toggleTimeBlock(block.id)}
            className="w-3.5 h-3.5 mt-0.5 shrink-0 border-white/60 data-[state=checked]:bg-white/80 data-[state=checked]:border-white/80"
            onClick={(e) => e.stopPropagation()}
            aria-label={`${block.content} 완료 토글`}
          />
          <span
            className={`text-xs font-medium leading-tight flex-1 text-zinc-800 ${
              block.isCompleted ? "line-through opacity-60" : ""
            } ${isActive ? "font-bold" : ""}`}
          >
            {block.content}
          </span>

          {isActive && (
            <span className="flex h-2 w-2 relative shrink-0 mt-1 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}

          {isHovered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTimeBlock(block.id);
              }}
              className="shrink-0 text-zinc-500 hover:text-red-500 transition-colors"
              aria-label="타임블록 삭제"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {height >= 40 && (
          <span className="text-[10px] text-zinc-600/70 leading-none pl-5">
            {block.startTime} – {block.endTime} · {durationText}
          </span>
        )}
      </div>

      {/* 메모 배지 (내용이 있을 때만) */}
      {block.memo && (
        <div className="absolute bottom-1 right-2 opacity-60 group-hover:opacity-100">
          <StickyNote className="w-2.5 h-2.5 text-zinc-700" />
        </div>
      )}

      {/* 하단 리사이즈 핸들 */}
      <div
        data-handle="bottom"
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
        onMouseDown={handleBottomResize}
      >
        <div className="w-8 h-0.5 bg-white/60 rounded-full" />
      </div>
    </div>

    {/* 메모 편집 모달 */}
    <Dialog open={isMemoOpen} onOpenChange={setIsMemoOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <div 
          className="h-2 w-full" 
          style={{ backgroundColor: block.color }}
        />
        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <AlignLeft className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Details & Memo</span>
            </div>
            <DialogTitle className="text-xl font-bold text-zinc-900">
              {block.content}
            </DialogTitle>
            <p className="text-xs text-zinc-500">
              🕒 {block.startTime} – {block.endTime} ({durationText})
            </p>
          </DialogHeader>

          <div className="relative">
            <textarea
              value={tempMemo}
              onChange={(e) => setTempMemo(e.target.value)}
              placeholder="이 작업에 대한 상세한 내용을 적어보세요..."
              className="w-full min-h-[160px] p-4 text-sm bg-zinc-50 rounded-xl border border-zinc-100 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none text-zinc-700"
              autoFocus
            />
          </div>

          <div className="mt-6 flex gap-2">
            <Button 
              variant="ghost" 
              className="flex-1 h-11 rounded-xl text-zinc-500 hover:bg-zinc-100"
              onClick={() => setIsMemoOpen(false)}
            >
              취소
            </Button>
            <Button 
              className="flex-2 h-11 rounded-xl bg-zinc-900 hover:bg-black text-white px-8"
              onClick={handleSaveMemo}
            >
              메모 저장하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
