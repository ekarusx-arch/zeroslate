"use client";

import { useRef, useState, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { getTodayDateKey, useTimeboxerStore } from "@/store/useTimeboxerStore";
import { GoogleCalendarEvent, Settings } from "@/types";
import CurrentTimeIndicator from "./CurrentTimeIndicator";
import TimeBlock from "./TimeBlock";
import { ExternalLink, Lock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileQuickAdd from "../navigation/MobileQuickAdd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ROW_HEIGHT_30 = 48; // 30분당 기준 높이

// ROW_HEIGHT_30 is defined above


function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function GoogleEventEditor({
  event,
  open,
  onOpenChange,
}: {
  event: GoogleCalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const syncGoogleCalendar = useTimeboxerStore((s) => s.syncGoogleCalendar);
  const [summary, setSummary] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!event) return;
    setSummary(event.summary);
    setStartTime(event.start);
    setEndTime(event.end);
  }, [event]);

  if (!event) return null;

  const canSave = event.canEdit && !event.isAllDay && event.calendarId && event.googleEventId;

  const handleSave = async () => {
    if (!canSave) return;
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      window.alert("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/calendar/event", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarId: event.calendarId,
          eventId: event.googleEventId,
          summary,
          date: event.date,
          startTime,
          endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "google_event_update_failed");
      }

      await syncGoogleCalendar({ date: event.date });
      onOpenChange(false);
    } catch (error) {
      console.error("Google Calendar event update failed:", error);
      window.alert(error instanceof Error ? error.message : "Google Calendar 일정을 수정하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Google Calendar 일정</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
            {event.calendarSummary || "Google Calendar"}
          </div>

          {!event.canEdit && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
              <p>이 공유 캘린더는 현재 계정에 수정 권한이 없습니다. Google Calendar에서 공유 권한을 “일정 변경 가능” 이상으로 받아야 ZeroSlate에서 수정할 수 있어요.</p>
            </div>
          )}

          {event.isAllDay && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
              종일 일정 편집은 아직 Google Calendar에서 직접 수정해주세요.
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-zinc-500">제목</span>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={!canSave}
              className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-zinc-50 disabled:text-zinc-400"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-zinc-500">시작</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={!canSave}
                className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-zinc-500">종료</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={!canSave}
                className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-3">
            {event.htmlLink ? (
              <a
                href={event.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-zinc-500 hover:text-blue-600"
              >
                Google에서 열기
              </a>
            ) : <span />}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>닫기</Button>
              <Button onClick={handleSave} disabled={!canSave || isSaving}>
                {isSaving ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
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
  isAssigningMode,
  onClick,
}: {
  slotId: string;
  hour: number;
  minute: number;
  showHourLabel: boolean;
  slotHeight: number;
  isAssigningMode?: boolean;
  onClick?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`time-slot flex relative transition-all duration-300 ${
        isOver ? "bg-blue-100/60" : ""
      } ${
        isAssigningMode 
          ? "cursor-pointer hover:bg-blue-50/50 bg-blue-50/20 active:bg-blue-100/40" 
          : "cursor-pointer sm:cursor-default"
      }`}
      style={{ height: `${slotHeight}px` }}
    >
      {/* 배치 모드일 때의 안내 효과 */}
      {isAssigningMode && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Tap to Place</span>
          </div>
        </div>
      )}
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
  const googleCalendarEvents = useTimeboxerStore((s) => s.googleCalendarEvents);
  const selectedDate = useTimeboxerStore((s) => s.selectedDate);
  const selectedSlotTime = useTimeboxerStore((s) => s.selectedSlotTime);
  const setSelectedSlotTime = useTimeboxerStore((s) => s.setSelectedSlotTime);
  const assigningTask = useTimeboxerStore((s) => s.assigningTask);
  const setAssigningTask = useTimeboxerStore((s) => s.setAssigningTask);
  const addTimeBlock = useTimeboxerStore((s) => s.addTimeBlock);
  const [editingEvent, setEditingEvent] = useState<GoogleCalendarEvent | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const isTodaySelected = selectedDate === getTodayDateKey();

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useTimeboxerStore((s) => s.isDragging);

  // ── 직접 그리기 상태 ──

  // 슬롯 높이 계산 (30분당 ROW_HEIGHT_30 기준)
  const slotHeight = (settings.step / 30) * ROW_HEIGHT_30;

  // 슬롯 목록 생성
  const slots: { hour: number; minute: number }[] = [];
  for (let h = settings.startTime; h < settings.endTime; h++) {
    for (let m = 0; m < 60; m += settings.step) {
      slots.push({ hour: h, minute: m });
    }
  }

  // ── 타임라인 클릭 생성 기능 제거됨 (드래그 앤 드롭만 사용) ────────────────────────

  const allDayEvents = googleCalendarEvents.filter((event) => event.date === selectedDate && event.isAllDay);
  const timeEvents = googleCalendarEvents.filter((event) => event.date === selectedDate && !event.isAllDay);

  return (
    <>
      {/* ── 종일 일정 헤더 영역 ── */}
      {allDayEvents.length > 0 && (
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-100 pl-14 pr-4 py-2 flex flex-col gap-1.5 shadow-sm">
          {allDayEvents.map(event => (
            <div
              key={event.id}
              className="rounded-md px-2.5 py-1.5 flex items-center justify-between border shadow-sm cursor-pointer hover:bg-zinc-50 transition-colors bg-white group"
              style={{ borderColor: `${event.color || '#e4e4e7'}60` }}
              onClick={() => setEditingEvent(event)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: event.color || '#a1a1aa' }} />
                <span className="text-xs font-bold text-zinc-700 truncate">{event.summary}</span>
                <span className="text-[10px] text-zinc-400 font-medium shrink-0 ml-1 bg-zinc-100 px-1.5 py-0.5 rounded-sm">종일</span>
              </div>
              {event.canEdit ? (
                <Pencil className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 shrink-0 ml-2" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-zinc-300 shrink-0 ml-2" />
              )}
            </div>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative select-none pb-8 ${isDragging ? "touch-none overflow-hidden" : ""}`}
        style={{ cursor: "default" }}
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
            isAssigningMode={!!assigningTask}
            onClick={() => {
              if (isDragging) return;
              if (assigningTask) {
                const startTime = `${String(slot.hour).padStart(2, "0")}:${String(slot.minute).padStart(2, "0")}`;
                const endTotalMin = slot.hour * 60 + slot.minute + 30;
                const endH = Math.floor(endTotalMin / 60);
                const endM = endTotalMin % 60;
                const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

                addTimeBlock({
                  taskId: assigningTask.id,
                  content: assigningTask.content,
                  color: assigningTask.color,
                  startTime,
                  endTime,
                  date: selectedDate,
                });
                setAssigningTask(null);
              } else if (window.innerWidth < 768) {
                setSelectedSlotTime({ hour: slot.hour, minute: slot.minute });
                setQuickAddOpen(true);
              }
            }}
          />
        );
      })}

      {/* 수동 배치 모드 배너 - 하단 중앙 배치로 모바일 편의성 개선 */}
      {assigningTask && (
        <div className="fixed bottom-24 left-4 right-4 z-[60] animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500">
          <div className="mx-auto max-w-[400px] flex items-center justify-between gap-4 px-5 py-4 bg-zinc-900/90 backdrop-blur-xl text-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5 leading-none">Assigning Task</span>
                <span className="text-sm font-bold truncate leading-none">&quot;{assigningTask.content}&quot;</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-px h-8 bg-white/10 mx-1" />
              <button 
                onClick={() => setAssigningTask(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 active:scale-95 rounded-xl text-xs font-black uppercase text-zinc-400 hover:text-white transition-all"
              >
                취소
              </button>
            </div>
          </div>
          {/* 타임라인 안내 텍스트 */}
          <div className="text-center mt-3">
             <p className="text-[11px] font-black text-zinc-900 bg-white/80 backdrop-blur-sm inline-block px-3 py-1 rounded-full shadow-sm">원하는 시간 칸을 터치하세요</p>
          </div>
        </div>
      )}

      {/* 타임 블록 렌더링 */}
      {timeBlocks.map((block) => (
        <div key={block.id} className="absolute inset-0 pointer-events-none">
          {/* 오늘이면 왼쪽부터, 아니면 약간의 여백(또는 전체) */}
          <div className={`absolute top-0 bottom-0 right-0 pointer-events-auto ${isTodaySelected ? 'left-14' : 'left-14'}`}>
            <TimeBlock
              block={block}
              startHour={settings.startTime}
              endHour={settings.endTime}
              containerRef={containerRef}
            />
          </div>
        </div>
      ))}

      {/* 구글 캘린더 이벤트 렌더링 */}
      {timeEvents.map((event) => {
        const [startH, startM] = event.start.split(":").map(Number);
        const [endH, endM] = event.end.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const timelineStart = settings.startTime * 60;
        const timelineEnd = settings.endTime * 60;

        // 타임라인 범위 밖인 경우 로그 출력
        if (startMinutes >= timelineEnd || endMinutes <= timelineStart) {
          console.log(`📌 Event "${event.summary}" is outside visible range (${event.start}-${event.end})`);
          return null;
        }

        const visibleStart = Math.max(startMinutes, timelineStart);
        const visibleEnd = Math.min(endMinutes, timelineEnd);
        const topPx = ((visibleStart - timelineStart) / 30) * ROW_HEIGHT_30;
        const heightPx = ((visibleEnd - visibleStart) / 30) * ROW_HEIGHT_30;

        return (
          <div
            key={event.id}
            className="absolute left-14 right-0 pointer-events-auto z-0 group/g-event"
            style={{ top: `${topPx}px`, height: `${heightPx}px` }}
          >
            <div
              className="absolute inset-0 rounded-xl border-2 flex items-center gap-2 px-3 shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
              style={{
                backgroundColor: `${event.color || '#7986cb'}15`,
                borderColor: `${event.color || '#7986cb'}88`,
                borderStyle: 'dashed',
              }}
              onClick={() => setEditingEvent(event)}
            >
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: event.color || '#7986cb' }} />
              <div className="flex flex-col overflow-hidden flex-1 leading-tight py-0.5">
                <span className="text-[11px] font-bold text-zinc-700 truncate">{event.summary}</span>
                {heightPx >= 25 && (
                  <span className="text-[9px] text-zinc-400 font-medium whitespace-nowrap">
                    {event.isAllDay ? "종일" : `${event.start} - ${event.end}`}
                  </span>
                )}
              </div>
              <div className="flex items-center opacity-0 group-hover/g-event:opacity-100 transition-opacity">
                {event.canEdit ? (
                  <Pencil className="h-3 w-3 shrink-0 text-zinc-400 hover:text-zinc-600" />
                ) : (
                  <Lock className="h-2.5 w-2.5 shrink-0 text-zinc-300" />
                )}
                {event.htmlLink && (
                  <a href={event.htmlLink} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-zinc-400 hover:text-blue-500 transition-all ml-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
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
      <GoogleEventEditor
        event={editingEvent}
        open={!!editingEvent}
        onOpenChange={(open) => {
          if (!open) setEditingEvent(null);
        }}
      />
      <MobileQuickAdd
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        selectedTime={selectedSlotTime}
      />
    </div>
    </>
  );
}
