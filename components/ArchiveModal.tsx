"use client";

import { useMemo, useState } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { DailyLog } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Archive, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

function formatMonthLabel(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}시간 ${rest}분` : `${hours}시간`;
}

function getScoreTone(log?: DailyLog) {
  if (!log) return "bg-zinc-50 text-zinc-300 border-zinc-100";
  if (log.blockCompletionRate >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (log.blockCompletionRate >= 40) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

export default function ArchiveModal() {
  const dailyLogs = useTimeboxerStore((s) => s.dailyLogs);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const logsByDate = useMemo(
    () => new Map(dailyLogs.map((log) => [log.date, log])),
    [dailyLogs]
  );

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ date: Date; inMonth: boolean }> = [];

    for (let i = 0; i < startOffset; i++) {
      days.push({ date: new Date(year, month, i - startOffset + 1), inMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), inMonth: true });
    }

    while (days.length % 7 !== 0) {
      const last = days[days.length - 1].date;
      days.push({
        date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
        inMonth: false,
      });
    }

    return days;
  }, [visibleMonth]);

  const selectedLog = logsByDate.get(selectedDate);

  const moveMonth = (delta: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1)
    );
  };

  return (
    <Dialog>
      <DialogTrigger
        className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-zinc-200 bg-white text-xs text-zinc-600 hover:bg-zinc-50 font-medium transition-colors"
        aria-label="기록 보관소 열기"
      >
        <Archive className="w-3.5 h-3.5" />
        기록
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="w-4 h-4 text-violet-500" />
            작업 기록 보관소
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
          <section className="rounded-xl border border-zinc-100 p-3">
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => moveMonth(-1)}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100"
                aria-label="이전 달"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-sm font-semibold text-zinc-800">
                {formatMonthLabel(visibleMonth)}
              </p>
              <button
                onClick={() => moveMonth(1)}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100"
                aria-label="다음 달"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-zinc-400">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1">
              {calendarDays.map(({ date, inMonth }) => {
                const dateKey = toDateKey(date);
                const log = logsByDate.get(dateKey);
                const isSelected = selectedDate === dateKey;

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`aspect-square w-full flex flex-col items-center justify-center p-1 rounded-lg border transition-colors ${
                      getScoreTone(log)
                    } ${isSelected ? "ring-2 ring-blue-300" : ""} ${
                      inMonth ? "" : "opacity-40"
                    }`}
                  >
                    <span className="font-semibold text-sm leading-none mt-1.5">{date.getDate()}</span>
                    <span className="text-[10px] font-medium leading-none mt-1 h-[10px] text-black/40">
                      {log ? `${log.blockCompletionRate}%` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-100 p-4">
            {selectedLog ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">
                    {selectedLog.date}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    저장됨 {new Date(selectedLog.savedAt).toLocaleTimeString("ko-KR")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Badge className="justify-center bg-blue-50 text-blue-700 hover:bg-blue-50">
                    완료 {selectedLog.completedBlocks.length}/{selectedLog.totalBlocks}
                  </Badge>
                  <Badge className="justify-center bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                    {formatMinutes(selectedLog.completedMinutes)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-500">완료한 타임블록</p>
                  {selectedLog.completedBlocks.length > 0 ? (
                    selectedLog.completedBlocks.map((block) => (
                      <div key={block.id} className="flex items-center gap-2 text-xs text-zinc-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="flex-1 truncate">{block.content}</span>
                        <span className="text-zinc-400">
                          {block.startTime}-{block.endTime}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400">완료한 블록이 없습니다.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                <Archive className="mb-3 w-8 h-8 text-zinc-300" />
                <p className="text-sm font-medium text-zinc-700">저장된 기록 없음</p>
                <p className="mt-1 text-xs text-zinc-400">
                  오늘의 요약에서 하루 기록을 저장하면 여기에 표시됩니다.
                </p>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
