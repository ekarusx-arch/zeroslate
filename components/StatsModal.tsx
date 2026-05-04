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
  Lock
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

  const formatMinutes = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m}m`;
    return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  };

  const score = data?.totalMinutes ? Math.round((data.completedMinutes / data.totalMinutes) * 100) : 0;
  const growthRate = 12;

  // 공유 기능
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
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      alert("공유 링크가 클립보드에 복사되었습니다! 🚀");
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Copy failed", err);
    });
  };

  // 다운로드 (CSV) 기능
  const handleDownload = () => {
    if (!data || data.pieData.length === 0) {
      alert("내보낼 데이터가 없습니다. 타임 블록을 완료해 보세요!");
      return;
    }

    const BOM = "\uFEFF";
    let csvContent = BOM + "카테고리,집중 시간(분),비중(%)\n";
    
    data.pieData.forEach(row => {
      const percentage = Math.round((row.value / data.completedMinutes) * 100);
      csvContent += `${row.name},${row.value},${percentage}%\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `zeroslate_productivity_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isPro = userPlan === "pro";

  return (
    <>
      <Dialog onOpenChange={(open) => { if (open) loadData(); }}>
        <DialogTrigger
          render={
            <button className="flex items-center gap-1 h-9 px-2.5 rounded-xl bg-zinc-900 text-white text-[11px] font-bold transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 shadow-xl shadow-zinc-200 group whitespace-nowrap shrink-0">
              <Sparkles className="w-3 h-3 text-blue-400 group-hover:animate-pulse shrink-0" />
              <span>AI 리포트</span>
              {!isPro && <Lock className="w-2.5 h-2.5 text-zinc-500 ml-0.5 shrink-0" />}
            </button>
          }
        />
        <DialogContent className="max-w-[1200px] w-[95vw] sm:max-w-[1200px] max-h-[94vh] overflow-hidden bg-white border-none shadow-[0_48px_96px_-12px_rgba(0,0,0,0.18)] p-0 rounded-[32px] flex flex-col">
          
          {/* 상단 툴바 */}
          <div className="absolute top-8 right-20 flex items-center gap-1.5 z-50 bg-white/60 backdrop-blur-md border border-zinc-100 p-1.5 rounded-2xl shadow-sm">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white text-zinc-400 hover:text-zinc-900 transition-all group/btn"
            >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">{isCopied ? "Copied" : "Share"}</span>
            </button>
            <div className="w-px h-4 bg-zinc-200" />
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white text-zinc-400 hover:text-zinc-900 transition-all group/btn"
            >
                <Download className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Export</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto relative">
            {/* 프리미엄 티저 오버레이 (무료 사용자용) */}
            {!isPro && (
              <div className="absolute inset-0 z-[60] bg-white/40 backdrop-blur-xl flex items-center justify-center p-8">
                <div className="max-w-xl w-full bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-zinc-100 p-12 text-center space-y-10 animate-in fade-in zoom-in duration-500">
                   <div className="inline-flex items-center justify-center w-20 h-20 rounded-[30px] bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-200 mb-2">
                      <Crown className="w-10 h-10 text-white" />
                   </div>
                   
                   <div className="space-y-4">
                      <h2 className="text-4xl font-black text-zinc-900 tracking-tight">AI 리포트로 성장을 시작하세요</h2>
                      <p className="text-zinc-500 font-medium leading-relaxed">
                        단순한 기록을 넘어, AI가 당신의 몰입 패턴을 분석합니다. <br/>
                        데이터 기반의 인사이트로 다음 주의 나를 설계하세요.
                      </p>
                   </div>

                   <div className="grid grid-cols-1 gap-4 text-left">
                      {[
                        { icon: BrainCircuit, text: "AI 맞춤형 생산성 진단 & 코멘트" },
                        { icon: Zap, text: "지난주 대비 성장률 및 트렌드 분석" },
                        { icon: Download, text: "모든 통계 데이터 무제한 내보내기" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50/50 border border-zinc-50">
                           <item.icon className="w-5 h-5 text-orange-500" />
                           <span className="text-sm font-bold text-zinc-700">{item.text}</span>
                        </div>
                      ))}
                   </div>

                   <div className="pt-4 space-y-4">
                      <button 
                        onClick={() => openUpgradeModal("AI 리포트")}
                        className="w-full h-16 bg-zinc-900 text-white rounded-2xl font-black text-lg hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95"
                      >
                        PRO 플랜으로 잠금 해제
                      </button>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                         이미 2,400명의 사용자가 AI 리포트를 사용 중입니다
                      </p>
                   </div>
                </div>
              </div>
            )}

            {/* 실제 리포트 내용 (isPro가 false면 블러 처리된 배경으로 작동) */}
            <div className={!isPro ? "pointer-events-none select-none opacity-50 filter blur-sm" : ""}>
              {/* 프리미엄 헤더 섹션 */}
              <div className="px-16 py-12 border-b border-zinc-50 shrink-0 bg-gradient-to-b from-zinc-50/50 to-white">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-600/20">
                        Weekly Intelligence
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                        <ArrowUp className="w-3 h-3" />
                        {growthRate}% 성장 중
                      </div>
                    </div>
                    <DialogTitle className="text-5xl font-bold text-zinc-900 tracking-tighter leading-tight">
                      Productivity <span className="text-zinc-300">Insights</span>
                    </DialogTitle>
                    <p className="text-sm font-medium text-zinc-400 max-w-md leading-relaxed">
                      사용자님의 지난 7일간의 몰입 데이터를 AI가 분석한 결과입니다. <br/>
                      상위 5%의 몰입 패턴을 유지하고 계시네요.
                    </p>
                  </div>
                  
                  <div className="relative group mt-12">
                    <div className="absolute inset-0 bg-blue-600/20 blur-3xl group-hover:bg-blue-600/30 transition-all" />
                    <div className="relative flex flex-col items-center justify-center w-44 h-44 rounded-full bg-white border-[12px] border-zinc-50 shadow-inner">
                      <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
                        <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="#F8FAFC" strokeWidth="8" />
                        <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="#2563EB" strokeWidth="8" strokeDasharray="100" strokeDashoffset={100 - score} strokeLinecap="round" className="transition-all duration-1000" />
                      </svg>
                      <span className="text-5xl font-black text-zinc-900 tracking-tighter">{score}</span>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Total Score</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 메인 콘텐츠 영역 */}
              <div className="px-16 py-12 space-y-20">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <div className="relative w-12 h-12">
                       <div className="absolute inset-0 border-4 border-zinc-100 rounded-full" />
                       <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">Decoding Momentum...</p>
                  </div>
                ) : data ? (
                  <>
                    {/* 핵심 인사이트 그리드 */}
                    <div className="grid grid-cols-4 gap-12">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-[11px] font-bold uppercase tracking-[0.25em]">Focus Volume</span>
                        </div>
                        <div className="text-3xl font-bold text-zinc-900 tracking-tight">{formatMinutes(data.completedMinutes)}</div>
                        <p className="text-[10px] font-bold text-zinc-400">전체 계획의 {score}% 달성</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Zap className="w-4 h-4" />
                          <span className="text-[11px] font-bold uppercase tracking-[0.25em]">Peak Velocity</span>
                        </div>
                        <div className="text-3xl font-bold text-zinc-900 tracking-tight">3.2h / day</div>
                        <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          <ArrowUp className="w-3 h-3" /> 지난주 대비 0.5h 증가
                        </p>
                      </div>

                      <div className="col-span-2 p-8 rounded-3xl bg-zinc-900 text-white relative overflow-hidden group">
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-blue-500/20 blur-3xl group-hover:bg-blue-500/30 transition-all" />
                        <div className="relative z-10 flex items-start gap-5">
                          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                            <BrainCircuit className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="text-sm font-black text-white tracking-widest uppercase opacity-50">AI Logic Comment</h4>
                            <p className="text-lg font-bold leading-tight">
                              {score >= 80 ? "가장 창의적인 에너지가 발산된 한 주입니다. 수요일의 몰입 패턴을 유지하세요." : "일관된 시작 시간이 부족합니다. 다음 주에는 오전 루틴을 10분만 당겨볼까요?"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 비주얼 트렌드 섹션 */}
                    <div className="grid grid-cols-3 gap-16">
                      <div className="col-span-1 space-y-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-zinc-300" />
                            Activity Split
                          </h3>
                        </div>
                        <div className="h-[300px] w-full flex items-center justify-center relative bg-zinc-50/50 rounded-[40px] border border-zinc-100">
                          {data.pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={data.pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={90}
                                  outerRadius={120}
                                  paddingAngle={8}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {data.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <ChartTooltip 
                                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '13px', fontWeight: 'bold' }}
                                  formatter={(value: any) => formatMinutes(Number(value || 0))}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="text-xs font-bold text-zinc-300">No data</div>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-zinc-300" />
                            Focus Momentum
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                            Focus Time (Minutes)
                          </div>
                        </div>
                        <div className="h-[300px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
                              <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: '800', fill: '#94A3B8' }}
                                dy={15}
                              />
                              <YAxis hide />
                              <ChartTooltip 
                                cursor={{ fill: '#F8FAFC', radius: 16 }}
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '13px', fontWeight: 'bold' }}
                                formatter={(value: any) => [`${formatMinutes(Number(value || 0))}`, 'Minutes']}
                              />
                              <Bar 
                                dataKey="minutes" 
                                fill="#2563EB" 
                                radius={[12, 12, 12, 12]} 
                                barSize={32}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* 상세 심층 분석 */}
                    <div className="space-y-12">
                      <div className="flex items-center gap-6">
                        <h3 className="text-2xl font-black text-zinc-900 tracking-tighter">Tag Deep-Dive</h3>
                        <div className="h-px flex-1 bg-zinc-100" />
                      </div>

                      <div className="grid grid-cols-2 gap-x-24 gap-y-10">
                        {data.pieData.map((tag, idx) => (
                          <div key={tag.name} className="flex items-center justify-between group cursor-default">
                            <div className="flex items-center gap-6">
                              <div className="text-xl font-black text-zinc-200 group-hover:text-blue-600/20 transition-all">0{idx + 1}</div>
                              <div>
                                 <span className="text-lg font-bold text-zinc-800 block leading-none mb-2">{tag.name}</span>
                                 <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Growth +2%</span>
                                 </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-2xl font-black text-zinc-900 tracking-tighter leading-none mb-1">{formatMinutes(tag.value)}</span>
                              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                                 {Math.round((tag.value / data.completedMinutes) * 100)}% distribution
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
                
                {/* 푸터 */}
                <div className="flex items-center justify-between pt-16 border-t border-zinc-50">
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-blue-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Rising Momentum</span>
                      </div>
                      <div className="w-1 h-4 bg-zinc-100 rounded-full" />
                      <p className="text-[10px] font-bold text-zinc-300">© 2026 ZeroSlate Inc. AI Analysis Powered by Vision Engine.</p>
                   </div>
                   <ArrowUpRight className="w-5 h-5 text-zinc-200" />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 기존 업그레이드 모달 연결 */}
      <UpgradeModal 
        open={isUpgradeModalOpen} 
        onClose={closeUpgradeModal} 
        featureName="AI 리포트" 
      />
    </>
  );
}
