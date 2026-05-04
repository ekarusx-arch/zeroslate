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
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Calendar, Clock, CheckCircle2 } from "lucide-react";
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

  return (
    <Dialog onOpenChange={(open) => { if (open) loadData(); }}>
      <DialogTrigger
        render={
          <button className="flex items-center gap-1.5 h-[33px] px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-600 text-xs font-bold transition-all active:scale-95 shadow-sm border border-zinc-200/50">
            <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
            통계 리포트
          </button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-zinc-200 shadow-2xl p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2.5 text-zinc-800 font-black tracking-tight">
              <div className="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-200">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              최근 7일 생산성 리포트
            </DialogTitle>
            <div className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-200">
              Insight Dashboard
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-zinc-400 animate-pulse">데이터 분석 중...</p>
          </div>
        ) : data ? (
          <div className="p-6 space-y-8">
            {/* 요약 카드 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-tight">총 계획 시간</span>
                </div>
                <p className="text-2xl font-black text-blue-900 tracking-tighter">{formatMinutes(data.totalMinutes)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-tight">총 몰입 시간</span>
                </div>
                <p className="text-2xl font-black text-emerald-900 tracking-tighter">{formatMinutes(data.completedMinutes)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-violet-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-tight">수행률</span>
                </div>
                <p className="text-2xl font-black text-violet-900 tracking-tighter">
                  {data.totalMinutes > 0 ? Math.round((data.completedMinutes / data.totalMinutes) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* 카테고리별 비중 (Pie Chart) */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-800 flex items-center gap-2 px-1">
                  <PieChartIcon className="w-4 h-4 text-blue-500" />
                  카테고리별 비중
                </h3>
                <div className="h-[240px] w-full bg-zinc-50/50 rounded-2xl border border-zinc-100 p-2">
                  {data.pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <ChartTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => formatMinutes(Number(value || 0))}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs font-bold text-zinc-400">데이터가 없습니다</div>
                  )}
                </div>
              </div>

              {/* 일별 트렌드 (Bar Chart) */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-800 flex items-center gap-2 px-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  일별 몰입 트렌드
                </h3>
                <div className="h-[240px] w-full bg-zinc-50/50 rounded-2xl border border-zinc-100 p-4">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.barData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94A3B8' }}
                        dy={10}
                      />
                      <YAxis hide />
                      <ChartTooltip 
                        cursor={{ fill: '#F1F5F9' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any) => [`${formatMinutes(Number(value || 0))}`, '몰입 시간']}
                      />
                      <Bar 
                        dataKey="minutes" 
                        fill="#3B82F6" 
                        radius={[6, 6, 0, 0]} 
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 하단 범례 및 리스트 */}
            <div className="space-y-4">
               <h3 className="text-sm font-black text-zinc-800 flex items-center gap-2 px-1">
                <Clock className="w-4 h-4 text-blue-500" />
                태그별 상세 분석
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {data.pieData.map((tag) => (
                  <div key={tag.name} className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-xl hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: tag.color }} />
                      <span className="text-xs font-bold text-zinc-700 truncate">{tag.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-zinc-900">{formatMinutes(tag.value)}</span>
                      <div className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                        {Math.round((tag.value / data.completedMinutes) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
                {data.pieData.length === 0 && (
                  <div className="col-span-2 py-8 text-center text-xs font-bold text-zinc-400 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    분석할 데이터가 충분하지 않습니다. 타임 블록을 완료해 보세요!
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="p-6 bg-zinc-50/50 border-t border-zinc-100">
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            * 이 리포트는 최근 7일간의 <b>완료된 타임 블록</b> 데이터를 기반으로 생성되었습니다.<br />
            * 스마트 태그를 사용하면 더욱 정확한 카테고리별 분석이 가능합니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
