/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PieChart as PieChartIcon,
  TrendingUp,
  Calendar,
  Clock,
  ArrowUpRight,
  Sparkles,
  Share2,
  Download,
  Zap,
  ArrowUp,
  BrainCircuit,
  Check,
  Crown,
  Lock,
  ChevronRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import UpgradeModal from "./UpgradeModal";

interface StatsData {
  pieData: { name: string; value: number; color: string }[];
  barData: { date: string; minutes: number }[];
  totalMinutes: number;
  completedMinutes: number;
}

export default function StatsModal() {
  const { fetchStatsData, userPlan, isUpgradeModalOpen, openUpgradeModal, closeUpgradeModal } =
    useTimeboxerStore();
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const result = await fetchStatsData();
    setData(result);
    setIsLoading(false);
  };

  const formatMinutes = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m}m`;
    return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  };

  const score = data?.totalMinutes
    ? Math.round((data.completedMinutes / data.totalMinutes) * 100)
    : 0;
  const growthRate = 12;

  const handleShare = async () => {
    const shareUrl = window.location.origin;
    const shareData = {
      title: "ZeroSlate 생산성 리포트",
      text: `이번 주 제 생산성 점수는 ${score}점입니다! 함께 몰입해봐요.`,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Copy failed", err));
  };

  const handleDownload = () => {
    if (!data || data.pieData.length === 0) {
      alert("내보낼 데이터가 없습니다. 타임 블록을 완료해 보세요!");
      return;
    }
    const BOM = "\uFEFF";
    let csvContent = BOM + "카테고리,집중 시간(분),비중(%)\n";
    data.pieData.forEach((row) => {
      const percentage = Math.round((row.value / data.completedMinutes) * 100);
      csvContent += `${row.name},${row.value},${percentage}%\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `zeroslate_productivity_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isPro = userPlan === "pro";

  return (
    <>
      <Dialog onOpenChange={(open) => { if (open) loadData(); }}>
        {/* ── 트리거 버튼: 프리/PRO 동일 크기 ── */}
        <DialogTrigger
          render={
            <button className="inline-flex items-center gap-1.5 h-[33px] px-[16px] rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-all shadow-md whitespace-nowrap shrink-0 active:scale-95 group">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:animate-pulse shrink-0" />
              <span>AI 리포트</span>
            </button>
          }
        />

        <DialogContent className="max-w-[1100px] w-[95vw] max-h-[92vh] overflow-hidden bg-white border-none shadow-[0_48px_96px_-12px_rgba(0,0,0,0.18)] p-0 rounded-[28px] flex flex-col">

          {/* ── 프리 모드: 페이월 전용 화면 ── */}
          {!isPro ? (
            <div className="flex flex-col h-full min-h-[600px]">
              {/* 상단 헤더 (PRO와 동일) */}
              <div className="px-12 pt-10 pb-8 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/60 to-white">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-600/20">
                        Weekly Intelligence
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                        <ArrowUp className="w-3 h-3" />
                        {growthRate}% 성장 중
                      </div>
                    </div>
                    <DialogTitle className="text-4xl font-bold text-zinc-900 tracking-tighter leading-tight">
                      Productivity <span className="text-zinc-300">Insights</span>
                    </DialogTitle>
                    <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                      AI가 당신의 몰입 패턴을 분석하고 성장 인사이트를 제공합니다.
                    </p>
                  </div>
                  {/* 잠금 상태 스코어 */}
                  <div className="relative mt-6 shrink-0">
                    <div className="absolute inset-0 bg-zinc-200/40 blur-2xl" />
                    <div className="relative flex flex-col items-center justify-center w-32 h-32 rounded-full bg-zinc-50 border-[10px] border-zinc-100">
                      <Lock className="w-8 h-8 text-zinc-300" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Locked</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 페이월 본문 */}
              <div className="flex-1 flex items-center justify-center px-8 py-10 bg-white">
                <div className="max-w-lg w-full text-center space-y-8">
                  {/* 아이콘 */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-400/30 blur-2xl rounded-full" />
                      <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-[24px] bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-orange-200">
                        <Crown className="w-9 h-9 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* 타이틀 */}
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight">
                      AI 리포트로<br />성장을 가속하세요
                    </h2>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      단순한 기록을 넘어 AI가 당신의 몰입 패턴을 분석합니다.<br />
                      데이터 기반의 인사이트로 다음 주의 나를 설계하세요.
                    </p>
                  </div>

                  {/* 기능 리스트 */}
                  <div className="grid grid-cols-1 gap-3 text-left">
                    {[
                      { icon: BrainCircuit, label: "AI 맞춤형 생산성 진단 & 코멘트", color: "text-blue-500", bg: "bg-blue-50" },
                      { icon: Zap, label: "지난주 대비 성장률 및 트렌드 분석", color: "text-amber-500", bg: "bg-amber-50" },
                      { icon: Download, label: "모든 통계 데이터 무제한 내보내기", color: "text-emerald-500", bg: "bg-emerald-50" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-all">
                        <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className="text-sm font-semibold text-zinc-700">{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-300 ml-auto shrink-0" />
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="space-y-3">
                    <button
                      onClick={() => openUpgradeModal("AI 리포트")}
                      className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black text-base hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200/80 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Crown className="w-4 h-4 text-amber-400" />
                      PRO 플랜으로 잠금 해제
                    </button>
                    <p className="text-[11px] font-semibold text-zinc-400">
                      이미 2,400명의 사용자가 AI 리포트를 사용 중입니다
                    </p>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* ── PRO 모드: 풀 리포트 ── */
            <div className="flex flex-col h-full overflow-hidden">
              {/* 툴바 */}
              <div className="absolute top-6 right-16 flex items-center gap-1 z-50 bg-white/70 backdrop-blur-md border border-zinc-100 p-1 rounded-xl shadow-sm">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all text-[11px] font-bold"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isCopied ? "Copied!" : "Share"}</span>
                </button>
                <div className="w-px h-4 bg-zinc-200" />
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all text-[11px] font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* PRO 헤더 */}
                <div className="px-12 pt-10 pb-8 border-b border-zinc-50 bg-gradient-to-b from-zinc-50/60 to-white">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-600/20">
                          Weekly Intelligence
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                          <ArrowUp className="w-3 h-3" />
                          {growthRate}% 성장 중
                        </div>
                      </div>
                      <DialogTitle className="text-4xl font-bold text-zinc-900 tracking-tighter leading-tight">
                        Productivity <span className="text-zinc-300">Insights</span>
                      </DialogTitle>
                      <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                        사용자님의 지난 7일간의 몰입 데이터를 AI가 분석한 결과입니다. <br />
                        상위 5%의 몰입 패턴을 유지하고 계시네요.
                      </p>
                    </div>

                    <div className="relative group mt-6 shrink-0">
                      <div className="absolute inset-0 bg-blue-600/20 blur-3xl group-hover:bg-blue-600/30 transition-all" />
                      <div className="relative flex flex-col items-center justify-center w-36 h-36 rounded-full bg-white border-[10px] border-zinc-50 shadow-inner">
                        <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
                          <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="#F8FAFC" strokeWidth="8" />
                          <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="#2563EB" strokeWidth="8" strokeDasharray="100" strokeDashoffset={100 - score} strokeLinecap="round" className="transition-all duration-1000" />
                        </svg>
                        <span className="text-4xl font-black text-zinc-900 tracking-tighter">{score}</span>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Total Score</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRO 콘텐츠 */}
                <div className="px-12 py-10 space-y-14">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-6">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 border-4 border-zinc-100 rounded-full" />
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">Decoding Momentum...</p>
                    </div>
                  ) : data ? (
                    <>
                      {/* 핵심 인사이트 그리드 */}
                      <div className="grid grid-cols-4 gap-8">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Focus Volume</span>
                          </div>
                          <div className="text-3xl font-bold text-zinc-900 tracking-tight">{formatMinutes(data.completedMinutes)}</div>
                          <p className="text-[10px] font-bold text-zinc-400">전체 계획의 {score}% 달성</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <Zap className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Peak Velocity</span>
                          </div>
                          <div className="text-3xl font-bold text-zinc-900 tracking-tight">3.2h / day</div>
                          <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" /> 지난주 대비 0.5h 증가
                          </p>
                        </div>

                        <div className="col-span-2 p-6 rounded-2xl bg-zinc-900 text-white relative overflow-hidden group">
                          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-blue-500/20 blur-3xl group-hover:bg-blue-500/30 transition-all" />
                          <div className="relative z-10 flex items-start gap-4">
                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md shrink-0">
                              <BrainCircuit className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-[10px] font-black text-white tracking-widest uppercase opacity-50">AI Logic Comment</h4>
                              <p className="text-sm font-bold leading-snug">
                                {score >= 80
                                  ? "가장 창의적인 에너지가 발산된 한 주입니다. 수요일의 몰입 패턴을 유지하세요."
                                  : "일관된 시작 시간이 부족합니다. 다음 주에는 오전 루틴을 10분만 당겨볼까요?"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 차트 섹션 */}
                      <div className="grid grid-cols-3 gap-12">
                        <div className="col-span-1 space-y-6">
                          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-zinc-300" />
                            Activity Split
                          </h3>
                          <div className="h-[260px] w-full flex items-center justify-center bg-zinc-50/50 rounded-3xl border border-zinc-100">
                            {data.pieData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={data.pieData} cx="50%" cy="50%" innerRadius={75} outerRadius={100} paddingAngle={6} dataKey="value" stroke="none">
                                    {data.pieData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <ChartTooltip
                                    contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: "bold" }}
                                    formatter={(value: any) => formatMinutes(Number(value || 0))}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="text-xs font-bold text-zinc-300">No data</div>
                            )}
                          </div>
                        </div>

                        <div className="col-span-2 space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-zinc-300" />
                              Focus Momentum
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                              <div className="w-2 h-2 rounded-full bg-blue-600" />
                              Focus Time (min)
                            </div>
                          </div>
                          <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data.barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: "800", fill: "#94A3B8" }} dy={12} />
                                <YAxis hide />
                                <ChartTooltip
                                  cursor={{ fill: "#F8FAFC", radius: 12 }}
                                  contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: "bold" }}
                                  formatter={(value: any) => [`${formatMinutes(Number(value || 0))}`, "Minutes"]}
                                />
                                <Bar dataKey="minutes" fill="#2563EB" radius={[10, 10, 10, 10]} barSize={28} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Tag Deep-Dive */}
                      <div className="space-y-8">
                        <div className="flex items-center gap-6">
                          <h3 className="text-xl font-black text-zinc-900 tracking-tighter">Tag Deep-Dive</h3>
                          <div className="h-px flex-1 bg-zinc-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                          {data.pieData.map((tag, idx) => (
                            <div key={tag.name} className="flex items-center justify-between group cursor-default py-2 border-b border-zinc-50 hover:border-zinc-100 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="text-lg font-black text-zinc-200 group-hover:text-blue-600/20 transition-all w-6">0{idx + 1}</div>
                                <div>
                                  <span className="text-base font-bold text-zinc-800 block leading-none mb-1.5">{tag.name}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Growth +2%</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xl font-black text-zinc-900 tracking-tighter leading-none mb-1">{formatMinutes(tag.value)}</span>
                                <div className="text-[10px] font-black text-zinc-400 uppercase">
                                  {Math.round((tag.value / data.completedMinutes) * 100)}% share
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}

                  {/* 푸터 */}
                  <div className="flex items-center justify-between pt-8 border-t border-zinc-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Rising Momentum</span>
                      </div>
                      <div className="w-px h-4 bg-zinc-100 rounded-full" />
                      <p className="text-[10px] font-bold text-zinc-300">© 2026 ZeroSlate Inc. AI Analysis Powered by Vision Engine.</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-zinc-200" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <UpgradeModal open={isUpgradeModalOpen} onClose={closeUpgradeModal} featureName="AI 리포트" />
    </>
  );
}
