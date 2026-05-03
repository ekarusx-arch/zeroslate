"use client";

import { useMemo } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { BarChart3, Clock, Crown, Target, Tag, TrendingUp } from "lucide-react";
import { formatMinutes, getAccessibleLogs, getBlockMinutes, getBlockTags } from "@/utils/archive";

export default function AnalyticsView() {
  const timeBlocks = useTimeboxerStore((s) => s.timeBlocks);
  const dailyLogs = useTimeboxerStore((s) => s.dailyLogs);
  const userPlan = useTimeboxerStore((s) => s.userPlan);

  const stats = useMemo(() => {
    const map = new Map<string, { minutes: number; color: string; count: number }>();
    let totalMinutes = 0;
    let completedMinutes = 0;
    let totalBlocks = 0;
    let completedBlocks = 0;
    const accessibleLogs = getAccessibleLogs(dailyLogs, userPlan);

    accessibleLogs.forEach((log) => {
      totalMinutes += log.totalPlannedMinutes || 0;
      completedMinutes += log.completedMinutes || 0;
      totalBlocks += log.totalBlocks || 0;
      completedBlocks += log.completedBlocks.length;

      log.completedBlocks.forEach((block) => {
        const duration = getBlockMinutes(block);
        getBlockTags(block).forEach((tag) => {
          const existing = map.get(tag) || { minutes: 0, color: block.color, count: 0 };
          map.set(tag, {
            minutes: existing.minutes + duration,
            color: block.color || existing.color,
            count: existing.count + 1,
          });
        });
      });
    });

    timeBlocks.forEach((block) => {
      const duration = getBlockMinutes(block);
      totalMinutes += duration;
      totalBlocks += 1;
      if (block.isCompleted) {
        completedMinutes += duration;
        completedBlocks += 1;
      }

      getBlockTags(block).forEach((tag) => {
        const existing = map.get(tag) || { minutes: 0, color: block.color, count: 0 };
        map.set(tag, {
          minutes: existing.minutes + duration,
          color: block.color || existing.color,
          count: existing.count + 1,
        });
      });
    });

    const sorted = Array.from(map.entries())
      .map(([tag, data]) => ({
        tag,
        ...data,
        percent: totalMinutes > 0 ? Math.round((data.minutes / totalMinutes) * 100) : 0
      }))
      .sort((a, b) => b.minutes - a.minutes);

    const averageCompletion = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;
    const strongDays = accessibleLogs.filter((log) => log.blockCompletionRate >= 80).length;
    const monthLogs = accessibleLogs.filter((log) => {
      const now = new Date();
      return log.date.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    });
    const monthlyGoalRate = monthLogs.length > 0
      ? Math.round((monthLogs.filter((log) => log.blockCompletionRate >= 80).length / monthLogs.length) * 100)
      : 0;

    return {
      items: sorted,
      totalMinutes,
      completedMinutes,
      averageCompletion,
      strongDays,
      monthlyGoalRate,
      logCount: accessibleLogs.length,
      hiddenLogCount: Math.max(0, dailyLogs.length - accessibleLogs.length),
    };
  }, [dailyLogs, timeBlocks, userPlan]);

  if (timeBlocks.length === 0 && dailyLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <BarChart3 className="w-10 h-10 text-zinc-300 mb-4" />
        <p className="text-sm font-bold text-zinc-800">통계를 낼 데이터가 부족해요</p>
        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
          타임라인에 블록을 추가하고<br />
          <span className="font-bold text-blue-500">#해시태그</span>를 입력해 보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* 총 시간 요약 */}
      <div className="rounded-2xl bg-zinc-950 p-5 text-white shadow-lg">
        <div className="mb-1 flex items-center justify-between gap-2 text-zinc-400">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {userPlan === "pro" ? "All Archive" : "Recent 7 Days"}
            </span>
          </div>
          {userPlan === "pro" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-1 text-[10px] font-black text-amber-300">
              <Crown className="h-3 w-3" />
              PRO
            </span>
          )}
        </div>
        <p className="text-3xl font-black">{formatMinutes(stats.totalMinutes)}</p>
        <p className="mt-1 text-[11px] text-zinc-500">
          저장 기록 {stats.logCount}일 · 오늘 블록 포함 분석
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
          <TrendingUp className="mb-2 h-3.5 w-3.5 text-emerald-500" />
          <p className="text-[10px] font-bold text-zinc-400">평균 완료율</p>
          <p className="mt-1 text-lg font-black text-zinc-900">{stats.averageCompletion}%</p>
        </div>
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
          <Target className="mb-2 h-3.5 w-3.5 text-blue-500" />
          <p className="text-[10px] font-bold text-zinc-400">월간 달성</p>
          <p className="mt-1 text-lg font-black text-zinc-900">{stats.monthlyGoalRate}%</p>
        </div>
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
          <Clock className="mb-2 h-3.5 w-3.5 text-violet-500" />
          <p className="text-[10px] font-bold text-zinc-400">완료 시간</p>
          <p className="mt-1 text-sm font-black text-zinc-900">{formatMinutes(stats.completedMinutes)}</p>
        </div>
      </div>

      {/* 태그 통계 리스트 */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-tight flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            시간 분배 현황
          </h3>
          <span className="text-[10px] font-bold text-zinc-400">비율 (%)</span>
        </div>

        <div className="space-y-4">
          {stats.items.map((item) => (
            <div key={item.tag} className="space-y-2 group">
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-800">{item.tag}</span>
                  <span className="text-[10px] font-medium text-zinc-400">{formatMinutes(item.minutes)}</span>
                </div>
                <span className="text-sm font-black text-zinc-900">{item.percent}%</span>
              </div>
              
              {/* 바 차트 */}
              <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(0,0,0,0.05)]"
                  style={{ 
                    width: `${item.percent}%`, 
                    backgroundColor: item.color,
                    boxShadow: `0 0 12px ${item.color}33`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 팁 인사이트 */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="mb-1 text-xs font-bold text-blue-800">통계 활용 팁</p>
        <p className="text-[11px] leading-relaxed text-blue-600">
          블록 내용에 <span className="font-bold">#</span>으로 태그를 남기면 자동으로 분류됩니다.
          {userPlan === "pro"
            ? " 오래 쌓인 기록일수록 태그별 시간 비중이 더 정확해집니다."
            : stats.hiddenLogCount > 0
              ? ` Pro에서는 숨겨진 과거 기록 ${stats.hiddenLogCount}일까지 함께 분석합니다.`
              : " 기록이 7일을 넘기면 Pro에서 전체 흐름을 볼 수 있습니다."}
        </p>
      </div>
    </div>
  );
}
