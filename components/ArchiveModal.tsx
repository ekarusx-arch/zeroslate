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
import { Archive, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Crown, Lock, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import UpgradeModal from "@/components/UpgradeModal";
import { formatMinutes, isArchiveLocked, toDateKey } from "@/utils/archive";

function formatMonthLabel(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function getScoreTone(log?: DailyLog) {
  if (!log) return "bg-zinc-50 text-zinc-300 border-zinc-100";
  if (log.blockCompletionRate >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (log.blockCompletionRate >= 40) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

export default function ArchiveModal() {
  const dailyLogs = useTimeboxerStore((s) => s.dailyLogs);
  const userPlan = useTimeboxerStore((s) => s.userPlan);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [isOpen, setIsOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const restoreLog = useTimeboxerStore((s) => s.restoreLog);

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
  const selectedLocked = isArchiveLocked(selectedDate, userPlan);

  const moveMonth = (delta: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 h-[33px] px-[14px] rounded-lg border border-zinc-200 bg-white text-xs text-zinc-600 hover:bg-zinc-50 font-semibold transition-all active:scale-95 shadow-sm shrink-0 whitespace-nowrap"
        aria-label="기록 보관소 열기"
      >
        <Archive className="w-3.5 h-3.5" />
        기록
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[900px] max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2 text-base">
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-violet-500" />
              작업 기록 보관소
            </span>
            {userPlan !== "pro" && (
              <button
                onClick={() => setUpgradeOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700"
              >
                <Crown className="h-3 w-3" />
                최근 7일
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr] flex-1 min-h-0 overflow-y-auto pr-1">
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
                const locked = Boolean(log) && isArchiveLocked(dateKey, userPlan);

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`relative aspect-square w-full flex flex-col items-center justify-center p-1 rounded-lg border transition-colors ${
                      getScoreTone(log)
                    } ${isSelected ? "ring-2 ring-blue-300" : ""} ${
                      inMonth ? "" : "opacity-40"
                    } ${locked ? "bg-zinc-50 text-zinc-400 border-zinc-200" : ""}`}
                  >
                    <span className="font-semibold text-sm leading-none mt-1.5">{date.getDate()}</span>
                    <span className="text-[10px] font-medium leading-none mt-1 h-[10px] text-black/40">
                      {log && !locked ? `${log.blockCompletionRate}%` : ""}
                    </span>
                    {locked && <Lock className="absolute right-1 top-1 h-3 w-3 text-amber-500" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-100 p-4">
            {selectedLog && selectedLocked ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                  <Lock className="h-5 w-5" />
                </div>
                <p className="text-sm font-black text-zinc-900">Pro 기록입니다</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  Free에서는 최근 7일 기록만 조회할 수 있습니다.
                </p>
                <button
                  onClick={() => setUpgradeOpen(true)}
                  className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-black text-white transition-colors hover:bg-zinc-800"
                >
                  전체 기록 보기
                </button>
              </div>
            ) : selectedLog ? (
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

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 transition-all"
                  onClick={async () => {
                    if (confirm(`${selectedLog.date}의 기록을 오늘로 다시 불러올까요?\n현재 작성 중인 내용은 사라질 수 있습니다.`)) {
                      await restoreLog(selectedLog.date);
                      setIsOpen(false);
                      alert("기록이 성공적으로 복구되었습니다!");
                    }
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  오늘로 다시 불러오기
                </Button>

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
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        featureName="무제한 아카이브 조회"
      />
    </Dialog>
  );
}
