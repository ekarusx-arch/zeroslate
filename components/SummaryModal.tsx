"use client";

import { useState } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock3, Save, Target, Zap, Share2 } from "lucide-react";
import ShareCard from "./ShareCard";
import { SummaryStats } from "@/types";

export default function SummaryModal() {
  const [summaryData, setSummaryData] = useState<SummaryStats | null>(null);
  const [saved, setSaved] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  const timeBlocks = useTimeboxerStore((s) => s.timeBlocks);
  const brainDump = useTimeboxerStore((s) => s.brainDump);
  const topThree = useTimeboxerStore((s) => s.topThree);
  const dailyLogs = useTimeboxerStore((s) => s.dailyLogs);
  const saveTodayLog = useTimeboxerStore((s) => s.saveTodayLog);
  const carryOver = useTimeboxerStore((s) => s.carryOver);

  // 오늘 날짜 키 (YYYY-MM-DD)
  const getTodayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const todayKey = getTodayKey();
  const existingLog = dailyLogs.find(l => l.date === todayKey);

  // 이미 마감되었는지 여부 (저장된 로그가 있거나 saved 상태가 true인 경우)
  const isActuallySaved = saved || !!existingLog;

  // 현재 실시간 통계 계산 (마감 전용)
  const calcStats = () => {
    const totalBlocks = timeBlocks.length;
    const completedBlocksCount = timeBlocks.filter((b) => b.isCompleted).length;
    const blockRate = totalBlocks > 0 ? Math.round((completedBlocksCount / totalBlocks) * 100) : 0;

    const totalTasks = brainDump.length;
    const completedTasksCount = brainDump.filter((i) => i.isCompleted).length;
    const taskRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    const assignedTopCount = topThree.filter((t) => t.isAssigned).length;
    const topRate = topThree.length > 0 ? Math.round((assignedTopCount / topThree.length) * 100) : 0;

    const totalPlannedMins = timeBlocks.reduce((acc, b) => {
      const [sh, sm] = b.startTime.split(":").map(Number);
      const [eh, em] = b.endTime.split(":").map(Number);
      return acc + (eh * 60 + em) - (sh * 60 + sm);
    }, 0);
    const completedMins = timeBlocks
      .filter((b) => b.isCompleted)
      .reduce((acc, b) => {
        const [sh, sm] = b.startTime.split(":").map(Number);
        const [eh, em] = b.endTime.split(":").map(Number);
        return acc + (eh * 60 + em) - (sh * 60 + sm);
      }, 0);

    const score = Math.round((blockRate + taskRate + topRate) / 3);
    const completedBlockList = timeBlocks.filter((b) => b.isCompleted);

    return {
      overallScore: score,
      blockRate,
      taskRate,
      topRate,
      completedBlocks: completedBlocksCount,
      totalBlocks,
      completedTasks: completedTasksCount,
      totalTasks,
      assignedTop: assignedTopCount,
      totalTopThree: topThree.length,
      totalPlannedMinutes: totalPlannedMins,
      completedMinutes: completedMins,
      completedBlockList,
    };
  };

  // 현재 상태에 따른 실시간 값 (UI 표시용)
  const liveStats = calcStats();
  
  // 표시할 데이터: 이미 마감되었다면 기존 로그 데이터를, 아니라면 현재 실시간 데이터를 보여줌
  const currentStats = summaryData || (existingLog ? {
    overallScore: Math.round((existingLog.blockCompletionRate + (existingLog.totalTasks > 0 ? Math.round((existingLog.completedBrainDump.length / existingLog.totalTasks) * 100) : 0) + existingLog.topCompletionRate) / 3),
    blockRate: existingLog.blockCompletionRate,
    taskRate: existingLog.totalTasks > 0 ? Math.round((existingLog.completedBrainDump.length / existingLog.totalTasks) * 100) : 0,
    topRate: existingLog.topCompletionRate,
    completedBlocks: existingLog.completedBlocks.length,
    totalBlocks: existingLog.totalBlocks,
    completedTasks: existingLog.completedBrainDump.length,
    totalTasks: existingLog.totalTasks,
    assignedTop: existingLog.topThree.filter(t => t.isAssigned).length,
    totalTopThree: existingLog.topThree.length,
    totalPlannedMinutes: existingLog.totalPlannedMinutes,
    completedMinutes: existingLog.completedMinutes,
    completedBlockList: existingLog.completedBlocks,
  } : liveStats);


  function formatTime(min: number) {
    if (min < 60) return `${min}분`;
    return `${Math.floor(min / 60)}시간 ${min % 60 > 0 ? min % 60 + "분" : ""}`;
  }

  function getEmoji(score: number) {
    if (score >= 80) return "🏆";
    if (score >= 60) return "💪";
    if (score >= 40) return "📈";
    return "🌱";
  }

    const handleSave = () => {
    if (isActuallySaved && !saved) {
      setSaved(true);
      return;
    }

    // 1. 마감 전 현재 통계를 스냅샷으로 저장
    setSummaryData(liveStats);
    
    // 2. 마감 및 이월 (상태 초기화됨)
    saveTodayLog();
    carryOver();
    setSaved(true);
  };

  return (
    <Dialog onOpenChange={(open) => { 
      if (!open) {
        setSaved(false);
        setShowShareCard(false);
        setSummaryData(null);
      }
    }}>
      <DialogTrigger
        id="summary-modal-trigger"
        className="inline-flex items-center gap-1.5 h-[33px] px-[16px] rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-all shadow-md whitespace-nowrap shrink-0 active:scale-95"
      >
        🚀 하루 마감하기
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden" id="summary-modal">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="text-2xl">{getEmoji(currentStats.overallScore)}</span>
            오늘의 생산성 리포트
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* 종합 점수 */}
          <div className="text-center py-4 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100">
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              {currentStats.overallScore}
            </p>
            <p className="text-sm text-zinc-500 mt-1">종합 생산성 점수</p>
          </div>

          {/* 타임 블록 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Clock3 className="w-4 h-4 text-blue-500" />
                타임 블록 완료율
              </div>
              <span className="text-sm font-semibold text-blue-600">{currentStats.blockRate}%</span>
            </div>
            <Progress value={currentStats.blockRate} className="h-2" />
            <p className="text-xs text-zinc-400">
              {currentStats.completedBlocks}/{currentStats.totalBlocks}개 완료 · 계획 {formatTime(currentStats.totalPlannedMinutes)} 중 {formatTime(currentStats.completedMinutes)} 수행
            </p>
          </div>

          {/* 브레인 덤프 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Zap className="w-4 h-4 text-amber-500" />
                할 일 완료율
              </div>
              <span className="text-sm font-semibold text-amber-600">{currentStats.taskRate}%</span>
            </div>
            <Progress value={currentStats.taskRate} className="h-2 [&>*]:bg-amber-400" />
            <p className="text-xs text-zinc-400">
              {currentStats.completedTasks}/{currentStats.totalTasks}개 완료
            </p>
          </div>

          {/* Top 3 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Target className="w-4 h-4 text-violet-500" />
                Top 3 타임라인 배정률
              </div>
              <span className="text-sm font-semibold text-violet-600">{currentStats.topRate}%</span>
            </div>
            <Progress value={currentStats.topRate} className="h-2 [&>*]:bg-violet-400" />
            <p className="text-xs text-zinc-400">
              {currentStats.assignedTop}/{currentStats.totalTopThree}개 배정됨
            </p>
          </div>

          {/* 완료된 과업 목록 */}
          {currentStats.completedBlocks > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">완료된 블록</p>
              <div className="space-y-1">
                {currentStats.completedBlockList.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 text-xs text-zinc-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{b.content}</span>
                    <span className="text-zinc-400 ml-auto">{b.startTime}–{b.endTime}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={isActuallySaved}
            className={`w-full ${isActuallySaved ? "bg-emerald-500 hover:bg-emerald-600 opacity-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-zinc-900 hover:bg-zinc-800"}`}
          >
            {isActuallySaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                오늘의 마감이 이미 완료되었습니다!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                마감 & 미완료 항목 이월하기
              </>
            )}
          </Button>

          {/* 마감 완료 후 내일 계획 안내 메시지 */}
          {isActuallySaved && !showShareCard && (
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-center animate-in fade-in slide-in-from-bottom-2">
              <p className="text-sm font-semibold text-blue-800">
                🎉 오늘 하루도 고생 많으셨습니다!
              </p>
              <p className="text-xs text-blue-600 mt-1.5 leading-relaxed">
                타임라인이 비워졌습니다.<br />
                남은 잡념들을 보며 <b>내일의 핵심 과업(Top 3)</b>과<br />
                <b>타임블록</b>을 미리 세팅해 두고 푹 쉬세요!
              </p>
              
              <Button 
                onClick={() => setShowShareCard(true)}
                variant="outline" 
                className="mt-4 w-full border-blue-200 text-blue-700 hover:bg-blue-100 gap-2"
              >
                <Share2 className="w-4 h-4" />
                성과 공유 카드 만들기
              </Button>
            </div>
          )}

          {showShareCard && (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300 pb-8">
              <div className="scale-90 sm:scale-100">
                <ShareCard stats={currentStats} />
              </div>
              <p className="text-[10px] text-zinc-400">화면을 캡처하여 SNS에 공유해보세요!</p>
              <Button 
                onClick={() => setShowShareCard(false)}
                variant="ghost" 
                className="text-xs text-zinc-500"
              >
                리포트 보러가기
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
