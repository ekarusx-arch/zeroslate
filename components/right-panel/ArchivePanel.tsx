"use client";

import { useMemo, useState } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { DailyLog } from "@/types";
import { Badge } from "@/components/ui/badge";
import { 
  Archive, 
  CalendarDays, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  History 
} from "lucide-react";
import AnalyticsView from "./AnalyticsView";

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
  if (!log) return "bg-zinc-50 text-zinc-400 border-zinc-200";
  if (log.blockCompletionRate >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (log.blockCompletionRate >= 40) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

export default function ArchivePanel() {
  const dailyLogs = useTimeboxerStore((s) => s.dailyLogs);
  const [activeTab, setActiveTab] = useState<"archive" | "analytics">("archive");
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
    <div className="flex h-full flex-col gap-3">
      {/* 탭 버튼 */}
      <div className="flex p-1 bg-zinc-100 rounded-xl shrink-0">
        <button
          onClick={() => setActiveTab("archive")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "archive" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          기록
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "analytics" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          통계
        </button>
      </div>

      {activeTab === "archive" ? (
        <div className="flex flex-col gap-3 overflow-hidden flex-1">
          {/* 달력 영역 */}
          <section className="rounded-xl border border-zinc-100 p-3 bg-white shadow-sm flex-shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => moveMonth(-1)}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100"
                aria-label="이전 달"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-violet-500" />
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

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-zinc-500">
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

          {/* 기록 요약 영역 */}
          <section className="flex-1 overflow-y-auto rounded-xl border border-zinc-100 p-4 bg-white shadow-sm min-h-0">
            {selectedLog ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">
                    {selectedLog.date}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    저장됨 {new Date(selectedLog.savedAt).toLocaleTimeString("ko-KR")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Badge className="justify-center bg-blue-50 text-blue-700 hover:bg-blue-50 py-1 px-0">
                    완료 {selectedLog.completedBlocks.length}/{selectedLog.totalBlocks}
                  </Badge>
                  <Badge className="justify-center bg-emerald-50 text-emerald-700 hover:bg-emerald-50 py-1 px-0">
                    {formatMinutes(selectedLog.completedMinutes)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-600">완료한 타임블록</p>
                  {selectedLog.completedBlocks.length > 0 ? (
                    selectedLog.completedBlocks.map((block) => (
                      <div key={block.id} className="flex items-start gap-2 text-xs text-zinc-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="flex-1 break-words">{block.content}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500">완료한 블록이 없습니다.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                <Archive className="mb-3 w-8 h-8 text-zinc-400" />
                <p className="text-sm font-semibold text-zinc-800">저장된 기록 없음</p>
                <p className="mt-1 text-xs text-zinc-500 px-4">
                  오늘의 요약에서 하루 기록을 저장하면 여기에 표시됩니다.
                </p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <section className="flex-1 overflow-y-auto rounded-xl border border-zinc-100 p-5 bg-white shadow-sm min-h-0">
          <AnalyticsView />
        </section>
      )}
    </div>
  );
}
