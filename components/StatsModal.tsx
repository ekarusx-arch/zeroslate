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
  Target,
  ArrowUpRight
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
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-white border border-zinc-200 text-zinc-600 text-xs font-bold transition-all hover:bg-zinc-50 active:scale-95 shadow-sm">
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            통계 리포트
          </button>
        }
      />
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] p-0 rounded-2xl flex flex-col">
        {/* 미니멀 헤더 섹션 */}
        <div className="p-10 pb-6 border-b border-zinc-50 shrink-0">
          <DialogHeader className="flex flex-row items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Performance Insight
              </div>
              <DialogTitle className="text-3xl font-bold text-zinc-900 tracking-tight">
                최근 7일 생산성 리포트
              </DialogTitle>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Weekly Score</span>
              <div className="text-5xl font-black text-zinc-900 tracking-tighter leading-none">
                {score}<span className="text-xl text-zinc-300 ml-1">%</span>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* 메인 콘텐츠 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-10 pt-8 space-y-14">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-8 h-8 border-2 border-zinc-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Analyzing data...</p>
            </div>
          ) : data ? (
            <>
              {/* 요약 지표 - 카드형이 아닌 그리드형으로 여백 강조 */}
              <div className="grid grid-cols-3 gap-12 pb-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Total Focus</span>
                  </div>
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight">
                    {formatMinutes(data.completedMinutes)}
                  </div>
                  <div className="h-1 w-8 bg-blue-600 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Target className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Accuracy</span>
                  </div>
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight">{score}%</div>
                  <div className="h-1 w-8 bg-zinc-100 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Status</span>
                  </div>
                  <div className="text-lg font-bold text-zinc-600 leading-tight">
                    {score >= 70 ? "Excellent Flow" : "Keep Growing"}
                  </div>
                  <div className="text-[10px] font-medium text-zinc-400 mt-1">상위 10%의 생산성입니다.</div>
                </div>
              </div>

              {/* 차트 영역 - 화이트스페이스 극대화 */}
              <div className="grid grid-cols-2 gap-20">
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <PieChartIcon className="w-3.5 h-3.5 text-zinc-300" />
                    Category Allocation
                  </h3>
                  <div className="h-[260px] w-full flex items-center justify-center relative">
                    {data.pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={105}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                          >
                            {data.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <ChartTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontSize: '11px', fontWeight: 'bold', color: '#0F172A' }}
                            formatter={(value: any) => formatMinutes(Number(value || 0))}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-xs font-bold text-zinc-300 italic">No category data</div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-[10px] font-bold text-zinc-400 uppercase">Tags</span>
                       <span className="text-xl font-bold text-zinc-900">{data.pieData.length}</span>
                    </div>
                </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-zinc-300" />
                    Daily Momentum
                  </h3>
                  <div className="h-[260px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F8FAFC" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: '800', fill: '#CBD5E1' }}
                          dy={15}
                        />
                        <YAxis hide />
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <ChartTooltip 
                          cursor={{ fill: '#F8FAFC', radius: 8 }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontSize: '11px', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${formatMinutes(Number(value || 0))}`, 'Focus']}
                        />
                        <Bar 
                          dataKey="minutes" 
                          fill="#3B82F6" 
                          radius={[4, 4, 4, 4]} 
                          barSize={16}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* 상세 정보 - 폰트 위계 강조 */}
              <div className="space-y-8 pb-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em]">Deep Analysis</h3>
                  <span className="text-[10px] font-bold text-zinc-400">Total {data.pieData.length} Categories</span>
                </div>

                <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                  {data.pieData.map((tag) => (
                    <div key={tag.name} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                        <span className="text-sm font-bold text-zinc-700">{tag.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-zinc-900">{formatMinutes(tag.value)}</span>
                        <div className="w-10 text-right text-[10px] font-black text-zinc-300 group-hover:text-blue-600 transition-colors">
                           {Math.round((tag.value / data.completedMinutes) * 100)}%
                        </div>
                        <ArrowUpRight className="w-3 h-3 text-zinc-200 group-hover:text-blue-600 transition-all" />
                      </div>
                    </div>
                  ))}
                  {data.pieData.length === 0 && (
                    <div className="col-span-2 py-12 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-100">
                       <p className="text-[11px] font-bold text-zinc-400">분석을 위한 충분한 데이터가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
          
          <div className="flex items-center justify-between pt-10 border-t border-zinc-50">
             <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">© 2026 ZeroSlate Insight Engine</span>
             <div className="flex gap-4">
                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest cursor-help hover:text-zinc-600">Privacy</span>
                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest cursor-help hover:text-zinc-600">Export PDF</span>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
