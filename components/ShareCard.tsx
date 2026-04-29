"use client";

import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { Sparkles, Timer, Trophy } from "lucide-react";
import { SummaryStats } from "@/types";

export default function ShareCard({ stats }: { stats?: SummaryStats }) {
  const timeBlocks = useTimeboxerStore((s) => s.timeBlocks);
  const brainDump = useTimeboxerStore((s) => s.brainDump);

  // props로 전달받은 데이터가 있으면 그것을 우선 사용 (마감 후 0점 방지)
  const completedBlocks = stats ? stats.completedBlocks : timeBlocks.filter((b) => b.isCompleted).length;
  const completedTasks = stats ? stats.completedTasks : brainDump.filter((i) => i.isCompleted).length;
  
  const blockRate = stats ? stats.blockRate : (timeBlocks.length > 0 ? Math.round((completedBlocks / timeBlocks.length) * 100) : 0);
  const taskRate = stats ? stats.taskRate : (brainDump.length > 0 ? Math.round((completedTasks / brainDump.length) * 100) : 0);
  const overallScore = stats ? stats.overallScore : (Math.round((blockRate + taskRate) / 2) || 0);

  const today = new Date().toLocaleDateString("ko-KR", { 
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' 
  });

  return (
    <div id="share-card" className="relative w-[360px] aspect-[4/5] bg-zinc-950 rounded-[40px] overflow-hidden p-8 flex flex-col justify-between shadow-2xl border border-white/10 group">
      {/* 배경 그라데이션 애니메이션 효과 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-violet-600/20 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="absolute top-[-10%] right-[-10%] w-60 h-60 bg-blue-500/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-60 h-60 bg-violet-500/20 blur-[100px] rounded-full" />

      {/* 헤더 */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
            <Timer className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-sm font-black tracking-tighter text-white uppercase">ZeroSlate</span>
        </div>
        <div className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-full border border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Daily Report
        </div>
      </div>

      {/* 메인 점수 */}
      <div className="relative z-10 flex flex-col items-center py-4">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
          <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 tracking-tighter leading-none">
            {overallScore}
          </h2>
        </div>
        <p className="text-zinc-500 font-bold text-xs mt-4 tracking-widest uppercase flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-blue-400" />
          Productivity Score
        </p>
      </div>

      {/* 통계 그리드 */}
      <div className="relative z-10 grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase">Blocks</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-white">{completedBlocks}</span>
            <span className="text-xs font-bold text-blue-400">{blockRate}%</span>
          </div>
        </div>
        <div className="p-4 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase">Tasks</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-white">{completedTasks}</span>
            <span className="text-xs font-bold text-violet-400">{taskRate}%</span>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="relative z-10 flex flex-col gap-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white tracking-tight">{today}</span>
            <span className="text-[9px] font-medium text-zinc-500">ZeroSlate App - Zero to Focus</span>
          </div>
          {overallScore >= 80 && (
            <div className="p-2 bg-emerald-500/20 rounded-full border border-emerald-500/20">
              <Trophy className="w-4 h-4 text-emerald-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
