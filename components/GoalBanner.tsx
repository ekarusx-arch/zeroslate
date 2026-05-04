"use client";

import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { Target, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

export default function GoalBanner() {
  const { goals, openUpgradeModal, userPlan } = useTimeboxerStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // 완료되지 않은 목표들만 필터링
  const activeGoals = goals.filter(g => !g.isCompleted);
  
  if (activeGoals.length === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-white/40 backdrop-blur-md border border-zinc-200/50 rounded-2xl mx-4 mb-4 group hover:bg-white/60 transition-all cursor-pointer"
           onClick={() => {
             // 목표 관리 모달 열기 로직 (추후 구현)
             window.dispatchEvent(new CustomEvent('open-goal-modal'));
           }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 group-hover:text-blue-600 transition-colors">No Active Goals</p>
            <p className="text-[10px] text-zinc-400">장기 목표를 설정하고 오늘을 더 의미 있게 만드세요</p>
          </div>
        </div>
        <Plus className="w-4 h-4 text-zinc-300 group-hover:text-blue-500 transition-colors" />
      </div>
    );
  }

  const currentGoal = activeGoals[currentIndex % activeGoals.length];

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white/50 backdrop-blur-xl border border-white/40 rounded-2xl mx-4 mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer"
         onClick={() => window.dispatchEvent(new CustomEvent('open-goal-modal'))}>
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden"
             style={{ backgroundColor: `${currentGoal.color || '#3B82F6'}15` }}>
          <Target className="w-4.5 h-4.5 relative z-10" style={{ color: currentGoal.color || '#3B82F6' }} />
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white to-transparent" />
        </div>
        
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-900 text-white leading-none">
              {currentGoal.type === 'monthly' ? 'Monthly' : 'Quarterly'}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">Main Focus</span>
          </div>
          <p className="text-sm font-black text-zinc-800 truncate leading-tight">
            {currentGoal.content || currentGoal.title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-4 shrink-0">
        <div className="h-8 w-[1px] bg-zinc-200/50 mx-2 hidden sm:block" />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex(prev => prev + 1);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
