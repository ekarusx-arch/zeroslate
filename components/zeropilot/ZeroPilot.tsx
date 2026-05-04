"use client";

import { useState } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { 
  Sparkles, 
  X, 
  Zap, 
  BrainCircuit,
  Loader2,
  ChevronRight,
  Wand2,
  CheckCircle2,
  BarChart3,
  Lock
} from "lucide-react";

interface MagicSuggestion {
  taskId: string;
  content: string;
  source: "top-three" | "brain-dump";
  color?: string;
  startTime: string;
  endTime: string;
  reason: string;
}

interface MagicExplanation {
  summary: string;
  bullets: string[];
}

interface PilotAnalysis {
  summary: string;
  stats: {
    pending: number;
    completed: number;
    unassigned: number;
    plannedMinutes: number;
    loadRate: number;
  };
  topTags: Array<{ tag: string; count: number }>;
  categories: Array<{ label: string; count: number }>;
  risks: string[];
  nextActions: Array<{
    id: string;
    title: string;
    source: string;
    duration: number;
  }>;
}

interface PatternReport {
  averageRate: number;
  logCount: number;
  bestPeriods: Array<{ label: string; count: number; minutes: number }>;
  topTags: Array<{ label: string; count: number; minutes: number }>;
  insights: string[];
  recommendation: string;
}

export default function ZeroPilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [magicSuggestions, setMagicSuggestions] = useState<MagicSuggestion[]>([]);
  const [magicExplanation, setMagicExplanation] = useState<MagicExplanation | null>(null);
  const [analysis, setAnalysis] = useState<PilotAnalysis | null>(null);
  const [patternReport, setPatternReport] = useState<PatternReport | null>(null);
  const { 
    isPilotLoading, 
    pilotMessage, 
    setPilotLoading, 
    setPilotMessage,
    brainDump,
    topThree,
    timeBlocks,
    settings,
    userPlan,
    dailyLogs,
    addTimeBlock,
  } = useTimeboxerStore();
  const isPro = userPlan === "pro";
  const isProAction = (type: string) => ["magic-fill", "plan", "pattern-report"].includes(type);

  const handleAction = async (type: string, data?: unknown) => {
    if (isProAction(type) && !isPro) {
      const featureLabel = type === "magic-fill"
        ? "Magic Fill 자동 배치"
        : type === "plan"
          ? "브레인 덤프 AI 분석"
          : "완료 패턴 리포트";
      setIsOpen(true);
      setMagicSuggestions([]);
      setMagicExplanation(null);
      setAnalysis(null);
      setPatternReport(null);
      setPilotMessage(`${featureLabel}는 ZeroPilot Pro 기능입니다. 무료 플랜에서는 응원 한 마디를 먼저 써볼 수 있어요.`);
      return;
    }

    setPilotLoading(true);
    setIsOpen(true);
    try {
      const pendingTopThree = topThree
        .filter((item) => !item.isCompleted && !item.isAssigned)
        .map((item) => ({
          id: item.id,
          content: item.content,
          source: "top-three" as const,
          color: item.color,
        }));
      const pendingBrainDump = brainDump
        .filter((item) => !item.isCompleted && !timeBlocks.some((block) => block.taskId === item.id))
        .map((item) => ({
          id: item.id,
          content: item.content,
          source: "brain-dump" as const,
          color: item.color,
        }));
      const payload = type === "magic-fill"
        ? {
            items: [...pendingTopThree, ...pendingBrainDump],
            existingBlocks: timeBlocks.map((block) => ({
              taskId: block.taskId,
              startTime: block.startTime,
              endTime: block.endTime,
            })),
            settings,
          }
        : type === "plan"
          ? {
              items: brainDump,
              topThree,
              timeBlocks,
              settings,
            }
          : type === "feedback"
            ? (() => {
                const completedBlocks = timeBlocks.filter((block) => block.isCompleted).length;
                const totalBlocks = timeBlocks.length;
                const plannedMinutes = timeBlocks.reduce((sum, block) => {
                  const [startHour, startMinute] = block.startTime.split(":").map(Number);
                  const [endHour, endMinute] = block.endTime.split(":").map(Number);
                  return sum + Math.max(0, endHour * 60 + endMinute - (startHour * 60 + startMinute));
                }, 0);
                const completedMinutes = timeBlocks
                  .filter((block) => block.isCompleted)
                  .reduce((sum, block) => {
                    const [startHour, startMinute] = block.startTime.split(":").map(Number);
                    const [endHour, endMinute] = block.endTime.split(":").map(Number);
                    return sum + Math.max(0, endHour * 60 + endMinute - (startHour * 60 + startMinute));
                  }, 0);
                const nextBlock = timeBlocks.find((block) => !block.isCompleted) || null;

                return {
                  progress: totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0,
                  completedBlocks,
                  totalBlocks,
                  plannedMinutes,
                  completedMinutes,
                  pendingTopThree: topThree.filter((item) => !item.isCompleted).length,
                  nextBlock,
                  recentLogs: dailyLogs.slice(0, 3),
                };
              })()
            : type === "pattern-report"
              ? {
                  logs: dailyLogs,
                  currentBlocks: timeBlocks,
                }
        : data || { items: brainDump };

      const res = await fetch("/api/zeropilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: payload })
      });
      const result = await res.json();
      
      if (type === "magic-fill") {
        setAnalysis(null);
        setPatternReport(null);
        setMagicSuggestions(result.suggestions || []);
        setMagicExplanation(result.explanation || null);
        setPilotMessage(result.message);
      } else if (type === "plan") {
        setMagicSuggestions([]);
        setMagicExplanation(null);
        setPatternReport(null);
        setAnalysis(result.analysis || null);
        setPilotMessage(result.message);
      } else if (type === "pattern-report") {
        setMagicSuggestions([]);
        setMagicExplanation(null);
        setAnalysis(null);
        setPatternReport(result.report || null);
        setPilotMessage(result.message);
      } else {
        setMagicSuggestions([]);
        setMagicExplanation(null);
        setAnalysis(null);
        setPatternReport(null);
        setPilotMessage(result.message);
      }
    } catch {
      setMagicSuggestions([]);
      setMagicExplanation(null);
      setAnalysis(null);
      setPatternReport(null);
      setPilotMessage("앗, 연결에 문제가 생겼어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setPilotLoading(false);
    }
  };

  const applyMagicFill = async () => {
    if (magicSuggestions.length === 0) return;
    setPilotLoading(true);
    try {
      for (const suggestion of magicSuggestions) {
        await addTimeBlock({
          taskId: suggestion.taskId,
          content: suggestion.content,
          startTime: suggestion.startTime,
          endTime: suggestion.endTime,
          color: suggestion.color,
        });
      }
      setPilotMessage(`${magicSuggestions.length}개 작업을 타임라인에 배치했습니다.`);
      setMagicSuggestions([]);
      setMagicExplanation(null);
      setAnalysis(null);
      setPatternReport(null);
    } catch {
      setPilotMessage("자동 배치 적용 중 문제가 생겼어요. 겹치는 시간대가 있는지 확인해주세요.");
    } finally {
      setPilotLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Pilot 대화창 */}
      {isOpen && (
        <div className="w-[calc(100vw-3rem)] sm:w-80 max-h-[min(760px,calc(100vh-7rem))] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-zinc-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">
          {/* 헤더 */}
          <div className="p-4 bg-zinc-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500 rounded-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-black tracking-tight">ZeroPilot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 min-h-[120px] overflow-y-auto p-4">
            {isPilotLoading ? (
              <div className="flex flex-col items-center gap-3 text-zinc-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <p className="text-xs font-bold animate-pulse">생각 중...</p>
              </div>
            ) : pilotMessage ? (
              <div className="space-y-3">
                <p className="text-sm text-zinc-700 leading-relaxed font-medium">{pilotMessage}</p>
                {magicExplanation && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                    <p className="text-[11px] font-black text-blue-600">배치 전략</p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-zinc-700">
                      {magicExplanation.summary}
                    </p>
                    {magicExplanation.bullets.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {magicExplanation.bullets.map((bullet) => (
                          <p key={bullet} className="text-[10px] font-semibold leading-relaxed text-zinc-500">
                            - {bullet}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {magicSuggestions.length > 0 && (
                  <div className="space-y-2">
                    {magicSuggestions.map((suggestion) => (
                      <div key={suggestion.taskId} className="rounded-xl border border-zinc-100 bg-zinc-50 p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-bold text-zinc-800">{suggestion.content}</p>
                          <span className="shrink-0 text-[10px] font-bold text-blue-500">
                            {suggestion.startTime}-{suggestion.endTime}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] font-medium text-zinc-400">{suggestion.reason}</p>
                      </div>
                    ))}
                    <button
                      onClick={applyMagicFill}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-xs font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      타임라인에 적용
                    </button>
                  </div>
                )}
                {analysis && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-zinc-50 p-2 text-center">
                        <p className="text-[10px] font-bold text-zinc-400">남은 작업</p>
                        <p className="mt-1 text-base font-black text-zinc-900">{analysis.stats.pending}</p>
                      </div>
                      <div className="rounded-xl bg-zinc-50 p-2 text-center">
                        <p className="text-[10px] font-bold text-zinc-400">미배치</p>
                        <p className="mt-1 text-base font-black text-zinc-900">{analysis.stats.unassigned}</p>
                      </div>
                      <div className="rounded-xl bg-zinc-50 p-2 text-center">
                        <p className="text-[10px] font-bold text-zinc-400">부하</p>
                        <p className="mt-1 text-base font-black text-zinc-900">{analysis.stats.loadRate}%</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-zinc-100 bg-white p-3">
                      <p className="text-[11px] font-bold text-zinc-500">요약</p>
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-zinc-700">{analysis.summary}</p>
                    </div>

                    {analysis.nextActions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-zinc-500">추천 실행 순서</p>
                        {analysis.nextActions.map((action, index) => (
                          <div key={action.id} className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-zinc-800">
                                {index + 1}. {action.title}
                              </p>
                              <p className="text-[10px] font-medium text-zinc-400">{action.source}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-blue-500 shadow-sm">
                              {action.duration}분
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-zinc-500">주의할 점</p>
                      {analysis.risks.map((risk) => (
                        <p key={risk} className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-amber-700">
                          {risk}
                        </p>
                      ))}
                    </div>

                    {(analysis.topTags.length > 0 || analysis.categories.length > 0) && (
                      <div className="flex flex-wrap gap-1.5">
                        {[...analysis.topTags.map((tag) => `${tag.tag} ${tag.count}`), ...analysis.categories.map((category) => `${category.label} ${category.count}`)].map((label) => (
                          <span key={label} className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500">
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {patternReport && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-zinc-50 p-3 text-center">
                        <p className="text-[10px] font-bold text-zinc-400">평균 완료율</p>
                        <p className="mt-1 text-lg font-black text-zinc-900">{patternReport.averageRate}%</p>
                      </div>
                      <div className="rounded-xl bg-zinc-50 p-3 text-center">
                        <p className="text-[10px] font-bold text-zinc-400">분석 로그</p>
                        <p className="mt-1 text-lg font-black text-zinc-900">{patternReport.logCount}개</p>
                      </div>
                    </div>

                    {patternReport.bestPeriods.length > 0 && (
                      <div className="rounded-xl border border-zinc-100 bg-white p-3">
                        <p className="text-[11px] font-bold text-zinc-500">완료가 많은 시간대</p>
                        <div className="mt-2 space-y-2">
                          {patternReport.bestPeriods.slice(0, 3).map((period) => (
                            <div key={period.label} className="flex items-center justify-between text-xs">
                              <span className="font-bold text-zinc-700">{period.label}</span>
                              <span className="font-semibold text-zinc-400">{period.count}개 · {period.minutes}분</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {patternReport.topTags.length > 0 && (
                      <div className="rounded-xl border border-zinc-100 bg-white p-3">
                        <p className="text-[11px] font-bold text-zinc-500">자주 완료한 작업 유형</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {patternReport.topTags.map((tag) => (
                            <span key={tag.label} className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-600">
                              {tag.label} {tag.count}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-zinc-500">인사이트</p>
                      {patternReport.insights.map((insight) => (
                        <p key={insight} className="rounded-xl bg-blue-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-blue-700">
                          {insight}
                        </p>
                      ))}
                    </div>

                    <div className="rounded-xl bg-zinc-900 px-3 py-3 text-xs font-semibold leading-relaxed text-white">
                      {patternReport.recommendation}
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => {
                    setPilotMessage(null);
                    setMagicSuggestions([]);
                    setMagicExplanation(null);
                    setAnalysis(null);
                    setPatternReport(null);
                  }}
                  className="text-[10px] font-bold text-blue-500 hover:underline"
                >
                  지우기
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-xs text-zinc-400 font-medium">오늘 하루를 어떻게 도와드릴까요?</p>
              </div>
            )}
          </div>

          {/* 빠른 액션 */}
          <div className="p-4 border-t border-zinc-50 bg-zinc-50/50 space-y-2">
            <button 
              onClick={() => handleAction("magic-fill")}
              className={`w-full flex items-center justify-between p-2.5 border rounded-xl transition-all group ${
                isPro
                  ? "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800"
                  : "bg-zinc-900 text-white border-zinc-900/80 hover:bg-zinc-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                <span className="text-xs font-bold">Magic Fill 자동 배치</span>
              </div>
              {!isPro ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-black text-white">
                  <Lock className="h-2.5 w-2.5" />
                  PRO
                </span>
              ) : (
                <ChevronRight className="w-3 h-3 text-white/50 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
            <button 
              onClick={() => handleAction("plan")}
              className="w-full flex items-center justify-between p-2.5 bg-white border border-zinc-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all group"
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                <span className="text-xs font-bold">브레인 덤프 분석</span>
              </div>
              {!isPro ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-700 ring-1 ring-amber-200">
                  <Lock className="h-2.5 w-2.5" />
                  PRO
                </span>
              ) : (
                <ChevronRight className="w-3 h-3 text-zinc-300 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
            <button
              onClick={() => handleAction("pattern-report")}
              className="w-full flex items-center justify-between p-2.5 bg-white border border-zinc-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all group"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-bold">패턴 리포트</span>
              </div>
              {!isPro ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-700 ring-1 ring-amber-200">
                  <Lock className="h-2.5 w-2.5" />
                  PRO
                </span>
              ) : (
                <ChevronRight className="w-3 h-3 text-zinc-300 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
            <button 
              onClick={() => handleAction("feedback")}
              className="w-full flex items-center justify-between p-2.5 bg-white border border-zinc-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all group"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold">응원 한 마디</span>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* 메인 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 ${
          isOpen ? "bg-zinc-900 text-white" : "bg-blue-600 text-white"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
      </button>
    </div>
  );
}
