/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PieChart as PieChartIcon, TrendingUp, Calendar, Clock, ArrowUpRight, Sparkles, Share2, Download, Zap, ArrowUp, BrainCircuit, Check, Crown, Lock, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import UpgradeModal from "./UpgradeModal";

interface StatsData {
  pieData: { name: string; value: number; color: string }[];
  barData: { date: string; minutes: number }[];
  totalMinutes: number;
  completedMinutes: number;
}

export default function StatsModal() {
  const { fetchStatsData, userPlan, isUpgradeModalOpen, openUpgradeModal, closeUpgradeModal } = useTimeboxerStore();
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const result = await fetchStatsData();
    setData(result);
    setIsLoading(false);
  };

  const fmt = (min: number) => {
    const h = Math.floor(min / 60), m = min % 60;
    return h === 0 ? `${m}m` : `${h}h${m > 0 ? ` ${m}m` : ""}`;
  };

  const score = data?.totalMinutes ? Math.round((data.completedMinutes / data.totalMinutes) * 100) : 0;

  const handleShare = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try { await navigator.share({ title: "ZeroSlate 리포트", text: `생산성 점수 ${score}점!`, url }); }
      catch { navigator.clipboard.writeText(url).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }); }
    } else {
      navigator.clipboard.writeText(url).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); });
    }
  };

  const handleDownload = () => {
    if (!data?.pieData.length) { alert("내보낼 데이터가 없습니다."); return; }
    const BOM = "\uFEFF";
    let csv = BOM + "카테고리,집중 시간(분),비중(%)\n";
    data.pieData.forEach(r => { csv += `${r.name},${r.value},${Math.round((r.value / data.completedMinutes) * 100)}%\n`; });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `zeroslate_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const isPro = userPlan === "pro";

  return (
    <>
      <Dialog onOpenChange={(open) => { if (open) loadData(); }}>
        {/* 트리거 버튼 - 프리/PRO 동일 */}
        <DialogTrigger render={
          <button className="inline-flex items-center gap-1.5 h-[33px] px-[16px] rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-all shadow-md whitespace-nowrap shrink-0 active:scale-95 group">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:animate-pulse shrink-0" />
            <span>AI 리포트</span>
          </button>
        } />

        <DialogContent className="max-w-[1100px] w-[95vw] max-h-[90vh] overflow-hidden bg-white border-none shadow-[0_32px_80px_-12px_rgba(0,0,0,0.2)] p-0 rounded-[28px] flex flex-col">

          {!isPro ? (
            /* ── 프리 모드: 2컬럼 레이아웃으로 모달 꽉 채움 ── */
            <div className="flex h-full min-h-0" style={{ height: "min(680px, 90vh)" }}>

              {/* 좌측: 브랜드 + 기능 소개 */}
              <div className="flex-1 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-10 flex flex-col justify-between relative overflow-hidden">
                {/* 배경 장식 */}
                <div className="absolute top-[-60px] left-[-60px] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-40px] right-[-40px] w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                  {/* 상단 뱃지 */}
                  <div className="flex items-center gap-2 mb-8">
                    <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/30">
                      Weekly Intelligence
                    </div>
                  </div>

                  {/* 타이틀 */}
                  <DialogTitle className="text-4xl font-black text-white tracking-tighter leading-tight mb-4">
                    Productivity<br /><span className="text-zinc-500">Insights</span>
                  </DialogTitle>
                  <p className="text-sm font-medium text-zinc-400 leading-relaxed mb-10">
                    AI가 당신의 몰입 패턴을 분석하고<br />성장 인사이트를 제공합니다.
                  </p>

                  {/* 기능 리스트 */}
                  <div className="space-y-3">
                    {[
                      { icon: BrainCircuit, label: "AI 맞춤형 생산성 진단 & 코멘트", color: "text-blue-400", bg: "bg-blue-500/10" },
                      { icon: Zap, label: "지난주 대비 성장률 및 트렌드 분석", color: "text-amber-400", bg: "bg-amber-500/10" },
                      { icon: Download, label: "모든 통계 데이터 무제한 내보내기", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                      { icon: TrendingUp, label: "7일간 집중 시간 히스토리 차트", color: "text-violet-400", bg: "bg-violet-500/10" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="text-sm font-semibold text-zinc-300">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 하단 - 잠금 스코어 */}
                <div className="relative z-10 flex items-center gap-4 mt-8">
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10">
                    <Lock className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Total Score</p>
                    <p className="text-2xl font-black text-zinc-600">??</p>
                  </div>
                </div>
              </div>

              {/* 우측: CTA */}
              <div className="w-[380px] shrink-0 bg-white flex flex-col items-center justify-center p-10 gap-8">
                {/* 아이콘 */}
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400/25 blur-2xl rounded-full" />
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-[22px] bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-orange-200">
                    <Crown className="w-9 h-9 text-white" />
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                    PRO로 잠금 해제
                  </h2>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    데이터 기반 인사이트로<br />다음 주의 나를 설계하세요.
                  </p>
                </div>

                {/* 소셜 프루프 */}
                <div className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-center">
                  <p className="text-2xl font-black text-zinc-900">2,400+</p>
                  <p className="text-xs font-semibold text-zinc-400 mt-1">명이 AI 리포트 사용 중</p>
                </div>

                {/* CTA 버튼 */}
                <div className="w-full space-y-3">
                  <button
                    onClick={() => openUpgradeModal("AI 리포트")}
                    className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black text-base hover:bg-zinc-800 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4 text-amber-400" />
                    PRO 플랜 시작하기
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                    <ChevronRight className="w-3 h-3" />
                    <span>7일 무료 체험 · 언제든 해지 가능</span>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* ── PRO 모드 ── */
            <div className="flex flex-col h-full overflow-hidden" style={{ height: "min(680px, 90vh)" }}>
              {/* 툴바 */}
              <div className="absolute top-5 right-14 flex items-center gap-1 z-50 bg-white/80 backdrop-blur-md border border-zinc-100 p-1 rounded-xl shadow-sm">
                <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all text-[11px] font-bold">
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isCopied ? "Copied!" : "Share"}</span>
                </button>
                <div className="w-px h-4 bg-zinc-200" />
                <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all text-[11px] font-bold">
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* PRO 헤더 */}
                <div className="px-12 pt-10 pb-7 border-b border-zinc-50 bg-gradient-to-b from-zinc-50/60 to-white">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-600/20">Weekly Intelligence</div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                          <ArrowUp className="w-3 h-3" /> 12% 성장 중
                        </div>
                      </div>
                      <DialogTitle className="text-4xl font-bold text-zinc-900 tracking-tighter leading-tight">
                        Productivity <span className="text-zinc-300">Insights</span>
                      </DialogTitle>
                      <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                        지난 7일간의 몰입 데이터를 AI가 분석했습니다. 상위 5% 패턴을 유지 중이에요.
                      </p>
                    </div>
                    <div className="relative group mt-4 shrink-0">
                      <div className="absolute inset-0 bg-blue-600/15 blur-2xl" />
                      <div className="relative flex flex-col items-center justify-center w-32 h-32 rounded-full bg-white border-[10px] border-zinc-50 shadow-inner">
                        <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
                          <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="#F8FAFC" strokeWidth="8" />
                          <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="#2563EB" strokeWidth="8" strokeDasharray="100" strokeDashoffset={100 - score} strokeLinecap="round" className="transition-all duration-1000" />
                        </svg>
                        <span className="text-3xl font-black text-zinc-900 tracking-tighter">{score}</span>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Score</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRO 콘텐츠 */}
                <div className="px-12 py-8 space-y-12">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 border-4 border-zinc-100 rounded-full" />
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">Decoding Momentum...</p>
                    </div>
                  ) : data ? (
                    <>
                      {/* 인사이트 그리드 */}
                      <div className="grid grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-zinc-400"><Clock className="w-4 h-4" /><span className="text-[11px] font-bold uppercase tracking-[0.2em]">Focus Volume</span></div>
                          <div className="text-3xl font-bold text-zinc-900">{fmt(data.completedMinutes)}</div>
                          <p className="text-[10px] font-bold text-zinc-400">계획의 {score}% 달성</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-zinc-400"><Zap className="w-4 h-4" /><span className="text-[11px] font-bold uppercase tracking-[0.2em]">Peak Velocity</span></div>
                          <div className="text-3xl font-bold text-zinc-900">3.2h/day</div>
                          <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><ArrowUp className="w-3 h-3" />지난주 +0.5h</p>
                        </div>
                        <div className="col-span-2 p-5 rounded-2xl bg-zinc-900 text-white relative overflow-hidden group">
                          <div className="absolute top-[-20%] right-[-10%] w-28 h-28 bg-blue-500/20 blur-3xl" />
                          <div className="relative z-10 flex items-start gap-4">
                            <div className="p-2 bg-white/10 rounded-xl shrink-0"><BrainCircuit className="w-5 h-5 text-blue-400" /></div>
                            <div>
                              <h4 className="text-[10px] font-black text-white/50 tracking-widest uppercase mb-1">AI Comment</h4>
                              <p className="text-sm font-bold leading-snug">
                                {score >= 80 ? "창의적 에너지가 넘친 한 주입니다. 이 패턴을 유지하세요." : "오전 루틴을 10분만 당겨보세요. 일관성이 핵심입니다."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 차트 */}
                      <div className="grid grid-cols-3 gap-10">
                        <div className="space-y-4">
                          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-2"><PieChartIcon className="w-4 h-4 text-zinc-300" />Activity Split</h3>
                          <div className="h-[220px] bg-zinc-50/50 rounded-3xl border border-zinc-100 flex items-center justify-center">
                            {data.pieData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={data.pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={88} paddingAngle={6} dataKey="value" stroke="none">
                                    {data.pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                  </Pie>
                                  <ChartTooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: "bold" }} formatter={(v: any) => fmt(Number(v || 0))} />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : <div className="text-xs font-bold text-zinc-300">No data</div>}
                          </div>
                        </div>
                        <div className="col-span-2 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-2"><Calendar className="w-4 h-4 text-zinc-300" />Focus Momentum</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400"><div className="w-2 h-2 rounded-full bg-blue-600" />Minutes</div>
                          </div>
                          <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data.barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: "800", fill: "#94A3B8" }} dy={10} />
                                <YAxis hide />
                                <ChartTooltip cursor={{ fill: "#F8FAFC", radius: 10 }} contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: "bold" }} formatter={(v: any) => [`${fmt(Number(v || 0))}`, "Minutes"]} />
                                <Bar dataKey="minutes" fill="#2563EB" radius={[8, 8, 8, 8]} barSize={26} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Tag Deep-Dive */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-4"><h3 className="text-xl font-black text-zinc-900 tracking-tighter">Tag Deep-Dive</h3><div className="h-px flex-1 bg-zinc-100" /></div>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                          {data.pieData.map((tag, idx) => (
                            <div key={tag.name} className="flex items-center justify-between py-2 border-b border-zinc-50 hover:border-zinc-100 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="text-base font-black text-zinc-200 w-5">0{idx + 1}</div>
                                <div>
                                  <span className="text-sm font-bold text-zinc-800 block mb-1">{tag.name}</span>
                                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} /><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Growth +2%</span></div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-black text-zinc-900 block">{fmt(tag.value)}</span>
                                <div className="text-[10px] font-black text-zinc-400">{Math.round((tag.value / data.completedMinutes) * 100)}% share</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}

                  {/* 푸터 */}
                  <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-blue-600"><TrendingUp className="w-4 h-4" /><span className="text-[11px] font-black uppercase tracking-[0.3em]">Rising Momentum</span></div>
                      <div className="w-px h-4 bg-zinc-100 rounded-full" />
                      <p className="text-[10px] font-bold text-zinc-300">© 2026 ZeroSlate Inc.</p>
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
