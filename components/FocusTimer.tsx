"use client";

import { useEffect, useState } from "react";
import { useTimeboxerStore, getTodayDateKey } from "@/store/useTimeboxerStore";
import { Timer } from "lucide-react";

function timeStringToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function FocusTimer() {
  const timeBlocks = useTimeboxerStore((s) => s.timeBlocks);
  const selectedDate = useTimeboxerStore((s) => s.selectedDate);
  const isTodaySelected = selectedDate === getTodayDateKey();

  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<string | null>(null);

  useEffect(() => {
    if (!isTodaySelected) {
      setTimeLeft(null);
      setActiveTask(null);
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();

      const activeBlock = timeBlocks.find((block) => {
        const start = timeStringToMinutes(block.startTime);
        const end = timeStringToMinutes(block.endTime);
        return start <= currentMinutes && currentMinutes < end;
      });

      if (activeBlock) {
        const endMinutes = timeStringToMinutes(activeBlock.endTime);
        const totalSecondsLeft = (endMinutes - currentMinutes) * 60 - currentSeconds;

        if (totalSecondsLeft > 0) {
          const m = Math.floor(totalSecondsLeft / 60);
          const s = totalSecondsLeft % 60;
          const timeStr = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
          setTimeLeft(timeStr);
          setActiveTask(activeBlock.content);
          document.title = `(${timeStr}) ${activeBlock.content} - ZeroSlate`;
        } else {
          setTimeLeft(null);
          setActiveTask(null);
          document.title = "ZeroSlate";
        }
      } else {
        setTimeLeft(null);
        setActiveTask(null);
        document.title = "ZeroSlate";
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      document.title = "ZeroSlate";
    };
  }, [timeBlocks, isTodaySelected]);

  if (!timeLeft) return null;

  return (
    <div className="fixed bottom-24 left-8 z-50 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-md text-zinc-900 rounded-2xl border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] group hover:scale-105 transition-all duration-300">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-200 animate-pulse-subtle">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
        </div>
        
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Deep Work</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" />
            <span className="text-[11px] font-bold text-zinc-500 truncate max-w-[120px]">{activeTask}</span>
          </div>
          <span className="text-2xl font-black font-mono tracking-tighter text-zinc-900 leading-none">
            {timeLeft}
          </span>
        </div>
      </div>
    </div>
  );
}
