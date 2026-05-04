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
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Zap,
  Target,
  Sparkles,
  ChevronRight,
  Trophy
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

interface StatsData {
  pieData: { name: string; value: number; color: string }[];
  barData: { date: string; minutes: number }[];
  totalMinutes: number;
  completedMinutes: number;
}

export default function StatsModal() {
  const fetchStatsData = useTimeboxerStore((s) => s.fetchStatsData);
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <Dialog onOpenChange={(open) => { if (open) loadData(); }}>
      <DialogTrigger
        render={
          <button className="flex items-center gap-2 h-9 px-4 rounded-full bg-zinc-900 text-white text-xs font-bold transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 shadow-lg shadow-zinc-200">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            통계 리포트
          </button>
        }
      />
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden bg-white border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-0 rounded-[40px] flex flex-col">
        {/* 상단 히어로 영역 */}
        <div className="relative p-10 pb-12 bg-[#0A0A0A] overflow-hidden shrink-0">
          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-violet-600/20 blur-[100px] rounded-full" />
          
          <DialogHeader className="relative z-10 space-y-1">
            <div className="flex items-center gap-3">
               <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                7-Day Intelligence
              </div>
            </div>
            <DialogTitle className="text-4xl font-black text-white tracking-tighter pt-2 flex items-center gap-4">
              Your Performance
              <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            </DialogTitle>
          </DialogHeader>

          {/* 메인 스코어 섹션 */}
          <div className="relative z-10 mt-10 flex items-end justify-between gap-8">
            <div className="flex-1 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 rounded-[24px] bg-white/5 backdrop-blur-xl border border-white/10 group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Total Focus</span>
                    </div>
                    <div className="text-2xl font-black text-white">{formatMinutes(data?.completedMinutes || 0)}</div>
                 </div>
                 <div className="p-5 rounded-[24px] bg-white/5 backdrop-blur-xl border border-white/10 group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                      <Target className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Plan Accuracy</span>
                    </div>
                    <div className="text-2xl font-black text-white">{score}%</div>
                 </div>
               </div>
               <div className="flex items-center gap-4 p-5 rounded-[24px] bg-gradient-to-r from-blue-600 to-violet-600 shadow-xl shadow-blue-900/20">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-lg leading-tight">
                      {score >= 80 ? "완벽한 몰입의 한 주!" : score >= 50 ? "꾸준히 성장하고 있어요" : "새로운 도전을 시작해볼까요?"}
                    </p>
                    <p className="text-white/70 text-xs font-medium mt-1">상위 5%의 사용자와 비슷한 생산성입니다.</p>
                  </div>
               </div>
            </div>
            
            <div className="shrink-0 flex flex-col items-center justify-center p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-3xl">
               <div className="relative flex items-center justify-center w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="url(#gradient)" strokeWidth="12" strokeDasharray={364} strokeDashoffset={364 - (364 * score / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-white tracking-tighter">{score}</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Score</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* 하단 화이트 영역 */}
        <div className="flex-1 overflow-y-auto bg-zinc-50/30 p-10 pt-12 space-y-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-[6px] border-zinc-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm font-black text-zinc-400">분석 중입니다...</p>
            </div>
          ) : data ? (
            <>
              {/* 차트 그리드 */}
              <div className="grid grid-cols-2 gap-10">
                {/* 파이 차트 섹션 */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-blue-500" />
                      Category Split
                    </h3>
                  </div>
                  <div className="h-[280px] w-full bg-white rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/40 p-4 flex items-center justify-center relative">
                    {data.pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {data.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <ChartTooltip 
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '13px', fontWeight: '900', padding: '12px 16px' }}
                            formatter={(value: any) => formatMinutes(Number(value || 0))}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300">
                           <PieChartIcon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-zinc-400 italic">No data analyzed yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 막대 차트 섹션 */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-violet-500" />
                      Daily Momentum
                    </h3>
                  </div>
                  <div className="h-[280px] w-full bg-white rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/40 p-6">
                     <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fontWeight: '800', fill: '#94A3B8' }}
                          dy={15}
                        />
                        <YAxis hide />
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <ChartTooltip 
                          cursor={{ fill: '#F8FAFC', radius: 12 }}
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '13px', fontWeight: '900', padding: '12px 16px' }}
                          formatter={(value: any) => [`${formatMinutes(Number(value || 0))}`, 'Focus Time']}
                        />
                        <Bar 
                          dataKey="minutes" 
                          fill="url(#barGradient)" 
                          radius={[10, 10, 10, 10]} 
                          barSize={24}
                        />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* 상세 리스트 섹션 */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-zinc-900 tracking-tighter flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                    Deep Analysis
                  </h3>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {data.pieData.map((tag, idx) => (
                    <div 
                      key={tag.name} 
                      className="group flex items-center justify-between p-6 bg-white border border-zinc-100 rounded-[28px] hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" 
                          style={{ backgroundColor: `${tag.color}15` }}
                        >
                          <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: tag.color }} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Rank {idx + 1}</span>
                           <span className="text-sm font-black text-zinc-800 truncate">{tag.name}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-zinc-900 tracking-tighter">{formatMinutes(tag.value)}</span>
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                           {Math.round((tag.value / data.completedMinutes) * 100)}% share
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.pieData.length === 0 && (
                    <div className="col-span-2 py-16 flex flex-col items-center justify-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[32px] text-center">
                       <Zap className="w-10 h-10 text-zinc-200 mb-4" />
                       <p className="text-zinc-400 font-bold max-w-[200px]">데이터를 쌓고 더 정밀한 분석을 받아보세요</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
          
          <div className="pt-4 flex items-center justify-between border-t border-zinc-100">
             <div className="flex items-center gap-2 text-zinc-400">
                <BarChart3 className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest">AI Intelligence Engine v1.0</span>
             </div>
             <p className="text-[10px] text-zinc-400 font-medium">© 2026 ZeroSlate Productivity Platform</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
