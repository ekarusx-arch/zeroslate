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
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target,
  ArrowUpRight,
  Info
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
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-zinc-900 text-white text-xs font-bold transition-all hover:bg-zinc-800 active:scale-95 shadow-lg shadow-zinc-200">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            통계 리포트
          </button>
        }
      />
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-hidden bg-white border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] p-0 rounded-3xl flex flex-col">
        {/* 헤더 섹션 - 수평 밸런스 강조 */}
        <div className="px-12 py-10 border-b border-zinc-50 shrink-0 bg-zinc-50/30">
          <div className="flex items-start justify-between gap-12">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]" />
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">AI Intelligence Engine</span>
              </div>
              <DialogTitle className="text-4xl font-bold text-zinc-900 tracking-tight leading-tight">
                최근 7일 생산성 리포트
              </DialogTitle>
              <p className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Info className="w-4 h-4" />
                데이터 기반의 주간 퍼포먼스 분석 결과입니다.
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-1 px-8 py-5 bg-white rounded-2xl shadow-sm border border-zinc-100 min-w-[200px]">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Weekly Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-zinc-900 tracking-tighter leading-none">{score}</span>
                <span className="text-2xl font-bold text-zinc-200 tracking-tighter">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto px-12 py-12 space-y-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-5">
              <div className="w-10 h-10 border-[3px] border-zinc-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Analyzing your momentum...</p>
            </div>
          ) : data ? (
            <>
              {/* 핵심 지표 - 완벽한 수평 정렬 그리드 */}
              <div className="grid grid-cols-3 gap-16">
                <div className="relative pl-6 border-l-2 border-blue-600 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Total Focus</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-zinc-900 tracking-tight">{formatMinutes(data.completedMinutes)}</span>
                    <span className="text-xs font-bold text-zinc-300">/ {formatMinutes(data.totalMinutes)} planned</span>
                  </div>
                </div>
                
                <div className="relative pl-6 border-l-2 border-zinc-100 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Target className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Accuracy</span>
                  </div>
                  <div className="text-4xl font-bold text-zinc-900 tracking-tight">{score}%</div>
                </div>

                <div className="relative pl-6 border-l-2 border-zinc-100 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Status</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-zinc-800 leading-tight">
                      {score >= 70 ? "Excellent Flow" : score >= 40 ? "Steady Growth" : "Need Momentum"}
                    </div>
                    <p className="text-[11px] font-bold text-zinc-400 mt-1 uppercase tracking-tight">상위 10%의 생산성 그룹</p>
                  </div>
                </div>
              </div>

              {/* 차트 섹션 - 너비 확장 활용 */}
              <div className="grid grid-cols-5 gap-16 items-start">
                {/* 파이 차트 (2/5 비중) */}
                <div className="col-span-2 space-y-8">
                  <div className="flex items-center gap-3 border-b border-zinc-50 pb-4">
                    <PieChartIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Category Split</h3>
                  </div>
                  <div className="h-[320px] w-full bg-zinc-50/30 rounded-3xl p-6 relative flex items-center justify-center">
                    {data.pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={90}
                            outerRadius={120}
                            paddingAngle={6}
                            dataKey="value"
                            stroke="none"
                          >
                            {data.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                            formatter={(value: any) => formatMinutes(Number(value || 0))}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-300">
                        <PieChartIcon className="w-8 h-8 opacity-20" />
                        <span className="text-xs font-bold italic">No data analyzed</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Categories</span>
                       <span className="text-3xl font-black text-zinc-900">{data.pieData.length}</span>
                    </div>
                  </div>
                </div>

                {/* 막대 차트 (3/5 비중) */}
                <div className="col-span-3 space-y-8">
                  <div className="flex items-center gap-3 border-b border-zinc-50 pb-4">
                    <Calendar className="w-5 h-5 text-violet-500" />
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Daily Momentum</h3>
                  </div>
                  <div className="h-[320px] w-full bg-white border border-zinc-100 rounded-3xl p-8 shadow-sm">
                     <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F8FAFC" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fontWeight: '800', fill: '#CBD5E1' }}
                          dy={15}
                        />
                        <YAxis hide />
                        <ChartTooltip 
                          cursor={{ fill: '#F8FAFC', radius: 10 }}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${formatMinutes(Number(value || 0))}`, 'Focus']}
                        />
                        <Bar 
                          dataKey="minutes" 
                          fill="#2563EB" 
                          radius={[6, 6, 6, 6]} 
                          barSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* 상세 정보 리스트 - 가독성 극대화 */}
              <div className="space-y-8 pb-8">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
                   <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-zinc-900" />
                    <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Category Breakdown</h3>
                   </div>
                   <div className="px-4 py-1.5 bg-zinc-100 rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      Detailed Metrics
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-x-20 gap-y-8">
                  {data.pieData.map((tag) => (
                    <div key={tag.name} className="flex items-center justify-between group py-2">
                      <div className="flex items-center gap-5">
                        <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ backgroundColor: tag.color }} />
                        <div>
                           <span className="text-sm font-bold text-zinc-900 block leading-none mb-1">{tag.name}</span>
                           <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Productivity Tag</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                           <span className="text-lg font-black text-zinc-900 tracking-tighter block leading-none">{formatMinutes(tag.value)}</span>
                           <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                              {Math.round((tag.value / data.completedMinutes) * 100)}% Share
                           </span>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-zinc-200 group-hover:text-blue-600 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </div>
                    </div>
                  ))}
                  {data.pieData.length === 0 && (
                    <div className="col-span-2 py-20 flex flex-col items-center justify-center bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-100">
                       <TrendingUp className="w-12 h-12 text-zinc-100 mb-4" />
                       <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Build your history for deep analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
          
          {/* 푸터 섹션 */}
          <div className="flex items-center justify-between pt-12 border-t border-zinc-100 text-zinc-300">
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">ZeroSlate Intelligence</span>
                <div className="w-1 h-1 rounded-full bg-zinc-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Version 2.4.0</span>
             </div>
             <div className="flex gap-8">
                <button className="text-[10px] font-black uppercase tracking-widest hover:text-zinc-900 transition-colors">Export Analytics</button>
                <button className="text-[10px] font-black uppercase tracking-widest hover:text-zinc-900 transition-colors">Data Privacy</button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
