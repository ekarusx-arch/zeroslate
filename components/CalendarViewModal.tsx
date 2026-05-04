"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays,
  RefreshCw,
  X,
  Maximize2
} from "lucide-react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function CalendarViewModal() {
  const isCalendarOpen = useTimeboxerStore((s) => s.isCalendarOpen);
  const setIsCalendarOpen = useTimeboxerStore((s) => s.setIsCalendarOpen);
  const selectedDate = useTimeboxerStore((s) => s.selectedDate);
  const setSelectedDate = useTimeboxerStore((s) => s.setSelectedDate);
  const googleCalendarEvents = useTimeboxerStore((s) => s.googleCalendarEvents);
  const googleTokenConnected = useTimeboxerStore((s) => s.googleTokenConnected);
  const syncGoogleCalendar = useTimeboxerStore((s) => s.syncGoogleCalendar);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewingDate, setViewingDate] = useState<string | null>(null);

  // ── 플로팅 윈도우 상태 관리 ──
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ w: 1300, h: 850 });
  const [isDragging, setIsDragging] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  // 초기 위치 중앙 정렬
  useEffect(() => {
    if (typeof window !== "undefined") {
      const defaultW = Math.min(1300, window.innerWidth - 40);
      const defaultH = Math.min(850, window.innerHeight - 80);
      setSize({ w: defaultW, h: defaultH });
      setPos({
        x: (window.innerWidth - defaultW) / 2,
        y: (window.innerHeight - defaultH) / 2,
      });
    }
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const syncVisibleMonth = async () => {
    if (!googleTokenConnected) return;
    setIsSyncing(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    await syncGoogleCalendar({
      timeMin: new Date(year, month, 1).toISOString(),
      timeMax: new Date(year, month + 1, 1).toISOString(),
    });
    setIsSyncing(false);
  };

  useEffect(() => {
    if (isCalendarOpen) {
      syncVisibleMonth();
    }
  }, [isCalendarOpen, currentMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return formatDateKey(date) === selectedDate;
  };

  // ── 드래그 & 리사이즈 로직 ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      setPos({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [pos]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startW = size.w;
    const startH = size.h;
    const startX = e.clientX;
    const startY = e.clientY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      setSize({
        w: Math.max(1200, startW + (moveEvent.clientX - startX)),
        h: Math.max(800, startH + (moveEvent.clientY - startY)),
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [size]);

  if (!isCalendarOpen) return null;

  return (
    <div 
      ref={windowRef}
      className={cn(
        "zs-calendar-modal fixed z-[100] flex flex-col border rounded-2xl overflow-hidden font-sans tracking-tight select-none",
        isDragging && "cursor-grabbing ring-2 ring-blue-500/30",
        !isDragging && "transition-shadow"
      )}
      style={{ 
        left: `${pos.x}px`, 
        top: `${pos.y}px`, 
        width: `${size.w}px`, 
        height: `${size.h}px` 
      }}
    >
      {/* ── 헤더 (드래그 핸들) ── */}
      <div 
        className="zs-calendar-header flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 border-b z-10 shrink-0 cursor-grab active:cursor-grabbing gap-2"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="zs-calendar-icon hidden sm:flex w-8 h-8 rounded-xl items-center justify-center shadow-sm">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h2 className="zs-calendar-title text-base sm:text-lg font-black truncate">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </h2>
          </div>
          
          <div className="zs-calendar-divider h-5 w-px opacity-50 hidden sm:block" />
          
          <div className="zs-calendar-nav flex items-center gap-0.5 p-0.5 sm:p-1 rounded-xl shrink-0">
            <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="zs-calendar-nav-button w-7 h-7 rounded-lg transition-all">
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setCurrentMonth(new Date())}
              className="zs-calendar-nav-button h-7 px-3 text-[12px] font-bold rounded-lg transition-all"
            >
              오늘
            </Button>
            <Button variant="ghost" size="icon" onClick={() => changeMonth(+1)} className="zs-calendar-nav-button w-7 h-7 rounded-lg transition-all">
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={syncVisibleMonth}
            disabled={!googleTokenConnected || isSyncing}
            className="zs-calendar-tool-button w-8 h-8 rounded-lg transition-colors"
            title="구글 캘린더 새로고침"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsCalendarOpen(false)}
            className="zs-calendar-tool-button w-8 h-8 rounded-lg transition-colors hover:text-red-500 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="zs-calendar-weekdays grid grid-cols-7 border-b shrink-0">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
          <div key={day} className={cn(
            "py-3 text-center text-sm font-bold",
            i === 0 ? "text-rose-500/80" : i === 6 ? "text-blue-500/80" : "text-zinc-500"
          )}>
            {day}
          </div>
        ))}
      </div>

      {/* ── 날짜 그리드 영역 ── */}
      <div className="zs-calendar-grid flex-1 grid grid-cols-7 grid-rows-6 overflow-hidden">
        {calendarDays.map((dayObj, idx) => {
          const { date, isCurrentMonth } = dayObj;
          const dateStr = formatDateKey(date);
          
          const daysEvents = googleCalendarEvents
            .filter((event) => event.date === dateStr)
            .sort((a, b) => a.start.localeCompare(b.start));

          const isCurrentSelected = isSelected(date);
          const isTodayDate = isToday(date);

          return (
            <div 
              key={idx}
              onClick={() => {
                setSelectedDate(dateStr);
                // 모바일 환경이거나 내용물을 명확히 보고 싶을 때 팝업 표시
                if (window.innerWidth < 768 || daysEvents.length > 0) {
                  setViewingDate(dateStr);
                }
              }}
              className={cn(
                "zs-calendar-day p-3 border-r border-b transition-colors cursor-pointer group flex flex-col min-h-0",
                !isCurrentMonth && "zs-calendar-day-muted",
                isCurrentSelected && "zs-calendar-day-selected z-10"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold",
                  isTodayDate 
                    ? "zs-calendar-today" 
                    : !isCurrentMonth 
                      ? "zs-calendar-date-muted"
                      : "zs-calendar-date",
                  isCurrentSelected && !isTodayDate && "zs-calendar-date-selected"
                )}>
                  {date.getDate()}
                </span>
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-transparent group-hover:scrollbar-thumb-zinc-200 pr-0.5">
                {daysEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-center gap-1.5 px-2 py-[3px] rounded-lg overflow-hidden shrink-0 transition-all hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: `${event.color || '#6366f1'}18`,
                      borderLeft: `3px solid ${event.color || '#6366f1'}`,
                    }}
                  >
                    <span className="text-[11px] font-semibold truncate text-zinc-800">
                      {event.summary}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 리사이즈 핸들 ── */}
      <div 
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 text-zinc-300 hover:text-zinc-500 transition-colors"
        onMouseDown={handleResizeStart}
      >
        <Maximize2 className="w-3 h-3 rotate-90" />
      </div>

      {/* ── 모바일/상세 일정 팝업 ── */}
      <Dialog open={!!viewingDate} onOpenChange={(open) => !open && setViewingDate(null)}>
        <DialogContent className="sm:max-w-[425px] z-[200]">
          <DialogHeader>
            <DialogTitle>
              {viewingDate && new Date(viewingDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[60vh] overflow-y-auto">
            {viewingDate && googleCalendarEvents
              .filter(e => e.date === viewingDate)
              .sort((a, b) => a.start.localeCompare(b.start))
              .map(event => (
                <div 
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-xl border bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
                  style={{ borderLeft: `4px solid ${event.color || '#6366f1'}` }}
                >
                  {event.isAllDay ? (
                    <span className="text-xs font-bold text-zinc-500 w-12 text-center bg-zinc-100 rounded py-1">종일</span>
                  ) : (
                    <span className="text-[13px] font-bold text-zinc-600 w-12 text-center tracking-tight">{event.start}</span>
                  )}
                  <span className="text-sm font-semibold text-zinc-800 flex-1 leading-snug">{event.summary}</span>
                </div>
              ))}
            {viewingDate && googleCalendarEvents.filter(e => e.date === viewingDate).length === 0 && (
              <p className="text-sm font-medium text-zinc-400 text-center py-8">예정된 일정이 없습니다.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
