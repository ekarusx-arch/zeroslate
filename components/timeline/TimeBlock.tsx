"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { getTodayDateKey, useTimeboxerStore } from "@/store/useTimeboxerStore";
import { useCurrentMinutes } from "@/hooks/useCurrentMinutes";
import { playAlarm } from "@/utils/audio";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, StickyNote, AlignLeft } from "lucide-react";
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
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [tempMemo, setTempMemo] = useState(block.memo || "");
  const currentMinutes = useCurrentMinutes();

  // ── 드래그/리사이징 로컬 상태 ──
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileEditing, setIsMobileEditing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartY = useRef<number>(0);
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);
  const [localStart, setLocalStart] = useState(timeStringToMinutes(block.startTime));
  const [localEnd, setLocalEnd] = useState(timeStringToMinutes(block.endTime));

  // 외부(스토어) 데이터와 동기화
  useEffect(() => {
    if (!isDragging) {
      setLocalStart(timeStringToMinutes(block.startTime));
      setLocalEnd(timeStringToMinutes(block.endTime));
    }
  }, [block.startTime, block.endTime, isDragging]);

  const timelineStartMinutes = startHour * 60;
  const timelineEndMinutes = endHour * 60;

  const selectedDate = useTimeboxerStore((s) => s.selectedDate);
  const todayDate = getTodayDateKey();

  const isToday = selectedDate === todayDate;
  const isPastDay = selectedDate < todayDate;

  // 오늘일 때만 현재 시간과 비교하여 활성/과거 여부 판단
  const isActive = isToday && (localStart <= currentMinutes && currentMinutes < localEnd);
  const isPast = isPastDay || (isToday && currentMinutes >= localEnd);
  
  const progressPercent = isActive ? ((currentMinutes - localStart) / (localEnd - localStart)) * 100 : 0;
  const isEndingSoon = isActive && (localEnd - currentMinutes) <= 5;

  // ── 알림 효과 ──
  const alarmsRef = useRef({ start: false, end: false });

  useEffect(() => {
    if (currentMinutes === localStart && !alarmsRef.current.start) {
      playAlarm("start");
      alarmsRef.current.start = true;
    }
    if (currentMinutes === localEnd && !alarmsRef.current.end) {
      playAlarm("end");
      alarmsRef.current.end = true;
    }
    if (currentMinutes < localStart) alarmsRef.current.start = false;
    if (currentMinutes < localEnd) alarmsRef.current.end = false;
  }, [currentMinutes, localStart, localEnd]);

  const visibleStart = Math.max(localStart, timelineStartMinutes);
  const visibleEnd = Math.min(localEnd, timelineEndMinutes);

  const top = minutesToPx(visibleStart - timelineStartMinutes);
  const height = minutesToPx(visibleEnd - visibleStart);

  const duration = localEnd - localStart;
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

      setIsDragging(true);
      const containerTop = containerRef.current.getBoundingClientRect().top;
      const originalEnd = localEnd;

      const onMouseMove = (me: MouseEvent) => {
        const relY = me.clientY - containerTop;
        const newStartRaw = timelineStartMinutes + pxToMinutes(relY);
        const newStart = Math.max(
          timelineStartMinutes,
          Math.min(newStartRaw, originalEnd - MIN_BLOCK_MINUTES)
        );
        setLocalStart(newStart);
      };

      const onMouseUp = (me: MouseEvent) => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        
        setIsDragging(false);
        const relY = me.clientY - containerTop;
        const finalStartRaw = timelineStartMinutes + pxToMinutes(relY);
        const finalStart = Math.max(
          timelineStartMinutes,
          Math.min(finalStartRaw, originalEnd - MIN_BLOCK_MINUTES)
        );

        if (finalStart !== timeStringToMinutes(block.startTime)) {
          updateTimeBlock(block.id, {
            startTime: minutesToTimeString(finalStart),
          });
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [block.id, block.startTime, localEnd, timelineStartMinutes, containerRef, updateTimeBlock]
  );

  // ── 하단 핸들 리사이즈 ──────────────────────────────
  const handleBottomResize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!containerRef.current) return;

      setIsDragging(true);
      const containerTop = containerRef.current.getBoundingClientRect().top;
      const originalStart = localStart;

      const onMouseMove = (me: MouseEvent) => {
        const relY = me.clientY - containerTop;
        const newEndRaw = timelineStartMinutes + pxToMinutes(relY);
        const newEnd = Math.min(
          timelineEndMinutes,
          Math.max(originalStart + MIN_BLOCK_MINUTES, newEndRaw)
        );
        setLocalEnd(newEnd);
      };

      const onMouseUp = (me: MouseEvent) => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        
        setIsDragging(false);
        const relY = me.clientY - containerTop;
        const finalEndRaw = timelineStartMinutes + pxToMinutes(relY);
        const finalEnd = Math.min(
          timelineEndMinutes,
          Math.max(originalStart + MIN_BLOCK_MINUTES, finalEndRaw)
        );

        if (finalEnd !== timeStringToMinutes(block.endTime)) {
          updateTimeBlock(block.id, {
            endTime: minutesToTimeString(finalEnd),
          });
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [
      block.id,
      block.endTime,
      localStart,
      timelineStartMinutes,
      timelineEndMinutes,
      containerRef,
      updateTimeBlock,
    ]
  );

  // ── 블록 드래그 이동 ──────────────────────────────
  const handleBlockDrag = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button, input, [data-handle]")) return;
      e.preventDefault();

      setIsDragging(true);
      const blockDuration = localEnd - localStart;
      const startY = e.clientY;
      const originalStartMin = localStart;
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
        setLocalStart(newStart);
        setLocalEnd(newStart + blockDuration);
      };

      const onMouseUp = (me: MouseEvent) => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        
        setIsDragging(false);
        const dy = me.clientY - startY;
        const deltaMin = pxToMinutes(dy);
        const finalStart = Math.min(
          maxStartMin,
          Math.max(
          timelineStartMinutes,
          originalStartMin + deltaMin
          )
        );

        if (finalStart !== timeStringToMinutes(block.startTime)) {
          updateTimeBlock(block.id, {
            startTime: minutesToTimeString(finalStart),
            endTime: minutesToTimeString(finalStart + blockDuration),
          });
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [
      block.id,
      block.startTime,
      localStart,
      localEnd,
      timelineStartMinutes,
      timelineEndMinutes,
      updateTimeBlock,
    ]
  );

  // ── 모바일 터치 핸들러 ──────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button, input, [data-handle]")) return;
    
    touchStartY.current = e.touches[0].clientY;
    setIsLongPressing(true);
    
    // 롱프레스 타이머 시작 (2초)
    longPressTimer.current = setTimeout(() => {
      setIsMobileEditing(true);
      setIsLongPressing(false);
      useTimeboxerStore.getState().setIsDragging(true);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 2000);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    
    // 움직임이 크면 롱프레스 취소 (스크롤 의도)
    if (!isMobileEditing && Math.abs(currentY - touchStartY.current) > 20) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
        setIsLongPressing(false);
      }
    }

    if (isMobileEditing) {
      const scrollContainer = document.getElementById("timeline-scroll-container") as HTMLDivElement;
      if (!scrollContainer) return;

      const containerRect = scrollContainer.getBoundingClientRect();
      const relativeY = currentY - containerRect.top;
      const viewportHeight = containerRect.height;

      // 자동 스크롤 감지 및 실행 (감지 영역 100px로 확대)
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
        scrollInterval.current = null;
      }

      const threshold = 100;
      if (relativeY < threshold) {
        // 상단 스크롤 (경계에 가까울수록 가속)
        const speed = Math.max(3, (threshold - relativeY) / 3);
        scrollInterval.current = setInterval(() => {
          scrollContainer.scrollTop -= speed;
        }, 16);
      } else if (relativeY > viewportHeight - threshold) {
        // 하단 스크롤
        const speed = Math.max(3, (relativeY - (viewportHeight - threshold)) / 3);
        scrollInterval.current = setInterval(() => {
          scrollContainer.scrollTop += speed;
        }, 16);
      }

      // 비수동 리스너를 통해 브라우저 기본 스크롤을 확실히 차단
      const containerTop = containerRef.current?.getBoundingClientRect().top || 0;
      const relY = currentY - containerTop;
      const blockDuration = localEnd - localStart;
      
      const newStartRaw = timelineStartMinutes + pxToMinutes(relY - (blockDuration / 2 / 30) * ROW_HEIGHT);
      const maxStartMin = timelineEndMinutes - blockDuration;
      const newStart = Math.min(maxStartMin, Math.max(timelineStartMinutes, newStartRaw));
      
      setLocalStart(newStart);
      setLocalEnd(newStart + blockDuration);
      setIsDragging(true);
    }
  };

  // 비수동(non-passive) 리스너 연결로 모바일 스크롤 완벽 차단
  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;

    const handleTouchMoveNonPassive = (e: TouchEvent) => {
      if (isMobileEditing) {
        e.preventDefault();
      }
    };

    el.addEventListener("touchmove", handleTouchMoveNonPassive, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMoveNonPassive);
  }, [isMobileEditing]);

  const handleTouchEnd = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
    setIsLongPressing(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isMobileEditing) {
      setIsMobileEditing(false);
      setIsDragging(false);
      useTimeboxerStore.getState().setIsDragging(false);
      
      // 스토어 업데이트
      if (localStart !== timeStringToMinutes(block.startTime)) {
        updateTimeBlock(block.id, {
          startTime: minutesToTimeString(localStart),
          endTime: minutesToTimeString(localEnd),
        });
      }
    }
  };

  // ── 모바일 하단 핸들 터치 리사이즈 ──
  const handleBottomTouchResize = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsMobileEditing(true);
    setIsDragging(true);

    const onTouchMove = (te: TouchEvent) => {
      te.preventDefault();
      const containerTop = containerRef.current?.getBoundingClientRect().top || 0;
      const relY = te.touches[0].clientY - containerTop;
      const newEndRaw = timelineStartMinutes + pxToMinutes(relY);
      const newEnd = Math.min(
        timelineEndMinutes,
        Math.max(localStart + MIN_BLOCK_MINUTES, newEndRaw)
      );
      setLocalEnd(newEnd);
    };

    const onTouchEnd = () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      
      setIsMobileEditing(false);
      setIsDragging(false);
      
      if (localEnd !== timeStringToMinutes(block.endTime)) {
        updateTimeBlock(block.id, {
          endTime: minutesToTimeString(localEnd),
        });
      }
    };

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
  };

  const handleSaveMemo = () => {
    updateTimeBlock(block.id, { memo: tempMemo });
    setIsMemoOpen(false);
  };

  if (visibleStart >= timelineEndMinutes || visibleEnd <= timelineStartMinutes) return null;

  const blockColor = useTimeboxerStore.getState().getColorForContent(block.content) || block.color || "#e4e4e7";

  return (
    <>
    <div
      ref={blockRef}
      className={`time-block group overflow-hidden cursor-pointer ${
        isActive ? "active-block-glow" : ""
      } ${!isActive && isPast && !block.isCompleted ? "opacity-60 grayscale-[0.2]" : ""} ${
        isEndingSoon ? "animate-pulse ring-2 ring-red-400" : ""
      } ${isDragging ? "z-50 shadow-2xl scale-[1.02]" : "transition-all duration-300 z-5"} ${
        isLongPressing ? "brightness-110 scale-[0.98]" : ""
      }`}
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 34)}px`, // 최소 높이 34px 확보
        backgroundColor: blockColor + "CC",
        borderLeft: `3px solid ${blockColor}`,
        zIndex: isDragging ? 50 : (isHovered ? 10 : 5),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => {
        handleBlockDrag(e);
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      // onClick 제거 (메모 버튼으로 대체)
    >
      {/* 모바일 편집 모드 시각적 효과 */}
      {isMobileEditing && (
        <div className="absolute inset-0 z-20 border-2 border-white/50 rounded-xl pointer-events-none bg-white/10" />
      )}
      {/* 상단 리사이즈 핸들 */}
      <div
        data-handle="top"
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
        onMouseDown={handleTopResize}
      >
        <div className="w-8 h-0.5 bg-white/60 rounded-full" />
      </div>

      {/* 내부 프로그레스 바 */}
      {isActive && (
        <div 
          className="absolute top-0 left-0 right-0 bg-white/20 transition-all duration-1000 ease-linear z-0 pointer-events-none"
          style={{ height: `${progressPercent}%` }}
        />
      )}

      {/* 블록 내용 */}
      <div className={`px-2 h-full flex flex-col gap-0.5 overflow-hidden relative z-10 ${height < 34 ? "pt-0.5 pb-1" : "pt-1 pb-4"}`}>
        <div className={`flex items-start gap-1 ${height < 34 ? "pt-0" : ""}`}>
          <Checkbox
            checked={block.isCompleted}
            onCheckedChange={() => toggleTimeBlock(block.id)}
            className={`${height < 30 ? "w-3 h-3" : "w-3.5 h-3.5"} mt-0.5 shrink-0 border-white/60 data-[state=checked]:bg-white/80 data-[state=checked]:border-white/80`}
            onClick={(e) => e.stopPropagation()}
            aria-label={`${block.content} 완료 토글`}
          />
          <span
            className={`text-xs font-medium leading-tight flex-1 text-zinc-800 truncate ${
              block.isCompleted ? "line-through opacity-60" : ""
            } ${isActive ? "font-bold" : ""}`}
          >
            {block.content}
          </span>

          {/* 메모 버튼 추가 (onClick 대신 사용) */}
          {!isDragging && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTempMemo(block.memo || "");
                setIsMemoOpen(true);
              }}
              className={`shrink-0 p-1 rounded-md transition-colors ${
                block.memo ? "text-white bg-black/10" : "text-zinc-500 hover:bg-black/5"
              }`}
              title="메모 작성"
            >
              <StickyNote className={height < 30 ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
            </button>
          )}

          {isActive && (
            <span className="flex h-2 w-2 relative shrink-0 mt-1 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}

          {isHovered && !isDragging && (
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

        {height >= 34 && (
          <span className="text-[10px] text-zinc-600/70 leading-none pl-5">
            {minutesToTimeString(localStart)} – {minutesToTimeString(localEnd)} · {durationText}
          </span>
        )}
      </div>

      {/* 메모 배지 */}
      {block.memo && (
        <div className="absolute bottom-1 right-2 opacity-60 group-hover:opacity-100">
          <StickyNote className="w-2.5 h-2.5 text-zinc-700" />
        </div>
      )}

      {/* 하단 리사이즈 핸들 */}
      <div
        data-handle="bottom"
        className={`absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize flex items-center justify-center transition-opacity z-30 ${
          isMobileEditing || isHovered ? "opacity-100" : "opacity-0"
        }`}
        onMouseDown={handleBottomResize}
        onTouchStart={handleBottomTouchResize}
      >
        <div className={`w-8 h-1 rounded-full shadow-sm transition-all ${isMobileEditing ? "bg-white scale-x-125" : "bg-white/60"}`} />
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
