"use client";

import { useMemo } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { BarChart3, Clock, Tag } from "lucide-react";

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatMinutes(min: number) {
  if (min < 60) return `${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

export default function AnalyticsView() {
  const timeBlocks = useTimeboxerStore((s) => s.timeBlocks);

  const stats = useMemo(() => {
    const map = new Map<string, { minutes: number; color: string; count: number }>();
    let totalMinutes = 0;

    timeBlocks.forEach((block) => {
      // 해시태그 추출 (예: #개발, #운동)
      const tags = block.content.match(/#[^\s#]+/g);
      const duration = timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
      totalMinutes += duration;

      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          const existing = map.get(tag) || { minutes: 0, color: block.color, count: 0 };
          map.set(tag, {
            minutes: existing.minutes + duration,
            color: block.color, // 마지막 블록의 색상을 따라가거나 고정
            count: existing.count + 1
          });
        });
      } else {
        const tag = "#기타";
        const existing = map.get(tag) || { minutes: 0, color: "#D4D4D8", count: 0 };
        map.set(tag, {
          minutes: existing.minutes + duration,
          color: existing.color,
          count: existing.count + 1
        });
      }
    });

    const sorted = Array.from(map.entries())
      .map(([tag, data]) => ({
        tag,
        ...data,
        percent: totalMinutes > 0 ? Math.round((data.minutes / totalMinutes) * 100) : 0
      }))
      .sort((a, b) => b.minutes - a.minutes);

    return { items: sorted, totalMinutes };
  }, [timeBlocks]);

  if (timeBlocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <BarChart3 className="w-10 h-10 text-zinc-300 mb-4" />
        <p className="text-sm font-bold text-zinc-800">통계를 낼 데이터가 부족해요</p>
        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
          타임라인에 블록을 추가하고<br />
          <span className="font-bold text-blue-500">#해시태그</span>를 입력해 보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* 총 시간 요약 */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 text-zinc-400 mb-1">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Today Total</span>
        </div>
        <p className="text-3xl font-black">{formatMinutes(stats.totalMinutes)}</p>
        <p className="text-[11px] text-zinc-500 mt-1">총 {timeBlocks.length}개의 타임 블록 분석 결과</p>
      </div>

      {/* 태그 통계 리스트 */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-tight flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            시간 분배 현황
          </h3>
          <span className="text-[10px] font-bold text-zinc-400">비율 (%)</span>
        </div>

        <div className="space-y-4">
          {stats.items.map((item) => (
            <div key={item.tag} className="space-y-2 group">
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-800">{item.tag}</span>
                  <span className="text-[10px] font-medium text-zinc-400">{formatMinutes(item.minutes)}</span>
                </div>
                <span className="text-sm font-black text-zinc-900">{item.percent}%</span>
              </div>
              
              {/* 바 차트 */}
              <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(0,0,0,0.05)]"
                  style={{ 
                    width: `${item.percent}%`, 
                    backgroundColor: item.color,
                    boxShadow: `0 0 12px ${item.color}33`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 팁 인사이트 */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
        <p className="text-xs font-bold text-blue-800 mb-1">💡 통계 활용 팁</p>
        <p className="text-[11px] text-blue-600 leading-relaxed">
          블록 내용에 <span className="font-bold">#</span>으로 태그를 남기면 자동으로 분류됩니다. 
          내가 어떤 종류의 작업에 몰입하고 있는지 확인해보세요!
        </p>
      </div>
    </div>
  );
}
