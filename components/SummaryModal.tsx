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

export default function SummaryModal() {
  const [saved, setSaved] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const timeBlocks = useTimeboxerStore((s) => s.timeBlocks);
  const brainDump = useTimeboxerStore((s) => s.brainDump);
  const topThree = useTimeboxerStore((s) => s.topThree);
  const saveTodayLog = useTimeboxerStore((s) => s.saveTodayLog);
  const carryOver = useTimeboxerStore((s) => s.carryOver);

  const totalBlocks = timeBlocks.length;
  const completedBlocks = timeBlocks.filter((b) => b.isCompleted).length;
  const blockRate = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  const totalTasks = brainDump.length;
  const completedTasks = brainDump.filter((i) => i.isCompleted).length;
  const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const assignedTop = topThree.filter((t) => t.isAssigned).length;
  const topRate = topThree.length > 0 ? Math.round((assignedTop / topThree.length) * 100) : 0;

  // 총 계획 시간 계산
  const totalPlannedMinutes = timeBlocks.reduce((acc, b) => {
    const [sh, sm] = b.startTime.split(":").map(Number);
    const [eh, em] = b.endTime.split(":").map(Number);
    return acc + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);
  const completedMinutes = timeBlocks
    .filter((b) => b.isCompleted)
    .reduce((acc, b) => {
      const [sh, sm] = b.startTime.split(":").map(Number);
      const [eh, em] = b.endTime.split(":").map(Number);
      return acc + (eh * 60 + em) - (sh * 60 + sm);
    }, 0);

  function formatTime(min: number) {
    if (min < 60) return `${min}분`;
    return `${Math.floor(min / 60)}시간 ${min % 60 > 0 ? min % 60 + "분" : ""}`;
  }

  const overallScore = Math.round((blockRate + taskRate + topRate) / 3);

  function getEmoji(score: number) {
    if (score >= 80) return "🏆";
    if (score >= 60) return "💪";
    if (score >= 40) return "📈";
    return "🌱";
  }

  const handleSave = () => {
    saveTodayLog();
    carryOver();
    setSaved(true);
  };

  return (
    <Dialog onOpenChange={(open) => { 
      if (!open) {
        setSaved(false);
        setShowShareCard(false);
      }
    }}>
      <DialogTrigger
        id="summary-modal-trigger"
        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm ml-2"
      >
        🚀 하루 마감하기
      </DialogTrigger>
      <DialogContent className="max-w-md" id="summary-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="text-2xl">{getEmoji(overallScore)}</span>
            오늘의 생산성 리포트
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 종합 점수 */}
          <div className="text-center py-4 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100">
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              {overallScore}
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
              <span className="text-sm font-semibold text-blue-600">{blockRate}%</span>
            </div>
            <Progress value={blockRate} className="h-2" />
            <p className="text-xs text-zinc-400">
              {completedBlocks}/{totalBlocks}개 완료 · 계획 {formatTime(totalPlannedMinutes)} 중 {formatTime(completedMinutes)} 수행
            </p>
          </div>

          {/* 브레인 덤프 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Zap className="w-4 h-4 text-amber-500" />
                할 일 완료율
              </div>
              <span className="text-sm font-semibold text-amber-600">{taskRate}%</span>
            </div>
            <Progress value={taskRate} className="h-2 [&>*]:bg-amber-400" />
            <p className="text-xs text-zinc-400">
              {completedTasks}/{totalTasks}개 완료
            </p>
          </div>

          {/* Top 3 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Target className="w-4 h-4 text-violet-500" />
                Top 3 타임라인 배정률
              </div>
              <span className="text-sm font-semibold text-violet-600">{topRate}%</span>
            </div>
            <Progress value={topRate} className="h-2 [&>*]:bg-violet-400" />
            <p className="text-xs text-zinc-400">
              {assignedTop}/{topThree.length}개 배정됨
            </p>
          </div>

          {/* 완료된 과업 목록 */}
          {completedBlocks > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">완료된 블록</p>
              <div className="space-y-1">
                {timeBlocks.filter((b) => b.isCompleted).map((b) => (
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
            disabled={saved}
            className={`w-full ${saved ? "bg-emerald-500 hover:bg-emerald-600 opacity-100" : "bg-zinc-900 hover:bg-zinc-800"}`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                성공적으로 마감 및 이월되었습니다!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                마감 & 미완료 항목 이월하기
              </>
            )}
          </Button>

          {/* 마감 완료 후 내일 계획 안내 메시지 */}
          {saved && !showShareCard && (
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
            <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
              <div className="scale-90 sm:scale-100">
                <ShareCard />
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
