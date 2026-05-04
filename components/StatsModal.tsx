/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  TrendingUp, Clock, ArrowUpRight, Sparkles,
  Zap, ArrowUp, BrainCircuit, Crown, Lock,
  PieChart as PieChartIcon, Calendar,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer,
} from "recharts";
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

  const isPro = userPlan === "pro";

  const ReportHeader = () => (
    <div className="px-4 sm:px-10 pt-6 sm:pt-10 pb-5 sm:pb-8 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/60 to-white shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-2.5 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-[0.15em] border border-blue-600/20 whitespace-nowrap">
              Weekly Intelligence
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 whitespace-nowrap">
              <ArrowUp className="w-3 h-3 shrink-0" /> 12% 성장 중
            </div>
          </div>
          <DialogTitle className="text-2xl sm:text-4xl font-bold text-zinc-900 tracking-tighter leading-tight">
            Productivity <span className="text-zinc-300">Insights</span>
          </DialogTitle>
          <p className="text-xs sm:text-sm font-medium text-zinc-400 leading-relaxed">
            {isPro
              ? "지난 7일간의 몰입 데이터를 AI가 분석했습니다."
              : "AI가 당신의 몰입 패턴을 분석하고 성장 인사이트를 제공합니다."}
          </p>
        </div>

        {/* 스코어 원형 - 모바일에서 숨김 */}
        <div className="relative shrink-0 mt-2 hidden sm:block">
          {isPro ? (
            <>
              <div className="absolute inset-0 bg-blue-600/15 blur-2xl" />
              <div className="relative flex flex-col items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white border-[10px] border-zinc-50 shadow-inner">
                <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
                  <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="#F8FAFC" strokeWidth="8" />
                  <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="#2563EB" strokeWidth="8"
                    strokeDasharray="100" strokeDashoffset={100 - score} strokeLinecap="round"
                    className="transition-all duration-1000" />
                </svg>
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tighter">{score}</span>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Score</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-zinc-50 border-[10px] border-zinc-100">
              <Lock className="w-6 h-6 text-zinc-300" />
              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mt-1">Locked</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Dialog onOpenChange={(open) => { if (open) loadData(); }}>
        {/* 트리거 버튼 - 프리/PRO 동일 크기 */}
        <DialogTrigger render={
          <button className="inline-flex items-center gap-1.5 h-[33px] px-[16px] rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-all shadow-md whitespace-nowrap shrink-0 active:scale-95 group">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:animate-pulse shrink-0" />
            <span>AI 리포트</span>
          </button>
        } />

        <DialogContent className="w-full sm:!w-[min(95vw,1100px)] sm:!max-w-[1100px] max-h-[92vh] overflow-hidden bg-white border-none shadow-[0_32px_80px_-12px_rgba(0,0,0,0.2)] p-0 rounded-t-[24px] sm:rounded-[28px] flex flex-col">

          {/* ── 공통 헤더 ── */}
          <ReportHeader />

          {!isPro ? (
            /* ── 프리 모드: 헤더 아래 페이월 ── */
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col items-center justify-center px-12 py-12 gap-8">

                {/* 잠금 안내 */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-200 mb-2">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">이 리포트는 PRO 전용입니다</h2>
                  <p className="text-sm text-zinc-500">PRO로 업그레이드하면 AI 분석 결과를 즉시 확인할 수 있습니다.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                  {[
                    { icon: BrainCircuit, label: "AI 맞춤형\n생산성 진단", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
                    { icon: Zap, label: "지난주 대비\n성장률 분석", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
                    { icon: Download, label: "통계 데이터\n무제한 내보내기", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
                  ].map((item, idx) => (
                    <div key={idx} className={`flex flex-col items-center gap-3 p-5 rounded-2xl ${item.bg} border ${item.border} text-center`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                      <span className="text-xs font-bold text-zinc-700 whitespace-pre-line leading-relaxed">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="w-full max-w-sm space-y-3 text-center">
                  <button
                    onClick={() => openUpgradeModal("AI 리포트")}
                    className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black text-base hover:bg-zinc-800 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4 text-amber-400" />
                    PRO 플랜으로 잠금 해제
                  </button>
                  <p className="text-xs font-semibold text-zinc-400">
                    이미 <span className="text-zinc-600 font-black">2,400+</span>명이 AI 리포트를 사용 중입니다
                  </p>
                </div>
              </div>
            </div>

          ) : (
            /* ── PRO 모드 ── */
            <>

              <div className="flex-1 overflow-y-auto">
                <div className="px-4 sm:px-10 py-5 sm:py-8 space-y-8 sm:space-y-12">
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
                      {/* 인사이트 그리드: 모바일 2열, PC 4열 */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-zinc-400"><Clock className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-[0.15em]">Focus Volume</span></div>
                          <div className="text-2xl sm:text-3xl font-bold text-zinc-900">{fmt(data.completedMinutes)}</div>
                          <p className="text-[10px] font-bold text-zinc-400">계획의 {score}% 달성</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-zinc-400"><Zap className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-[0.15em]">Peak Velocity</span></div>
                          <div className="text-2xl sm:text-3xl font-bold text-zinc-900">3.2h/day</div>
                          <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><ArrowUp className="w-3 h-3" />지난주 +0.5h</p>
                        </div>
                        <div className="col-span-2 p-4 sm:p-5 rounded-2xl bg-zinc-900 text-white relative overflow-hidden">
                          <div className="absolute top-[-20%] right-[-10%] w-28 h-28 bg-blue-500/20 blur-3xl" />
                          <div className="relative z-10 flex items-start gap-3">
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

                      {/* 차트: 모바일 1열 세로, PC 3열 가로 */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
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
                        <div className="flex items-center gap-4"><h3 className="text-base sm:text-xl font-black text-zinc-900 tracking-tighter">Tag Deep-Dive</h3><div className="h-px flex-1 bg-zinc-100" /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                          {data.pieData.map((tag, idx) => (
                            <div key={tag.name} className="flex items-center justify-between py-2.5 border-b border-zinc-50">
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
            </>
          )}
        </DialogContent>
      </Dialog>

      <UpgradeModal open={isUpgradeModalOpen} onClose={closeUpgradeModal} featureName="AI 리포트" />
    </>
  );
}
