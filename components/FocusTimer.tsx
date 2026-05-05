"use client";

import { useEffect, useState } from "react";
import { useTimeboxerStore, getTodayDateKey } from "@/store/useTimeboxerStore";
import { Timer, Check, Play } from "lucide-react";

function timeStringToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function FocusTimer() {
  const timeBlocks = useTimeboxerStore((s) => s.timeBlocks);
  const selectedDate = useTimeboxerStore((s) => s.selectedDate);
  const activeFocusId = useTimeboxerStore((s) => s.activeFocusId);
  const setFocusId = useTimeboxerStore((s) => s.setFocusId);
  const isTodaySelected = selectedDate === getTodayDateKey();

  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // ... (드래그 관련 상태 생략 - 원본 보존)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const toggleTimeBlock = useTimeboxerStore((s) => s.toggleTimeBlock);

  // 위치 정보 로드
  useEffect(() => {
    const savedPos = localStorage.getItem("focus-timer-pos");
    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos));
      } catch (e) {
        console.error("Failed to load position", e);
      }
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    localStorage.setItem("focus-timer-pos", JSON.stringify(position));
  };

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
        return !block.isCompleted && start <= currentMinutes && currentMinutes < end;
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
          setActiveBlockId(activeBlock.id);
          document.title = `(${timeStr}) ${activeBlock.content} - ZeroSlate`;
        } else {
          setTimeLeft(null);
          setActiveTask(null);
          setActiveBlockId(null);
          document.title = "ZeroSlate";
        }
      } else {
        setTimeLeft(null);
        setActiveTask(null);
        setActiveBlockId(null);
        document.title = "ZeroSlate";
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      document.title = "ZeroSlate";
    };
  }, [timeBlocks, isTodaySelected]);

  // 몰입 모드 실행 중이거나 진행 중인 작업이 없으면 숨김
  if (activeFocusId || !timeLeft) return null;

  return (
    <div
      className={`fixed bottom-24 left-4 sm:left-8 z-50 ${
        isDragging ? "" : "animate-in fade-in slide-in-from-left-4 duration-300"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <div className="flex items-center gap-2 sm:gap-4 p-2.5 sm:p-4 bg-white/90 backdrop-blur-md text-zinc-900 rounded-2xl border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] group hover:scale-105 transition-all duration-300 origin-bottom-left max-w-[calc(100vw-2rem)]">
        <div className="relative shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-200 animate-pulse-subtle">
            <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-ping" />
        </div>
        
        <div className="flex flex-col gap-0 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-red-500 whitespace-nowrap">Deep Work</span>
            <span className="w-0.5 h-0.5 rounded-full bg-zinc-300 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 truncate max-w-[80px] sm:max-w-[120px]">{activeTask}</span>
          </div>
          <span className="text-xl sm:text-2xl font-black font-mono tracking-tighter text-zinc-900 leading-tight">
            {timeLeft}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2 shrink-0">
          {/* 몰입 시작 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (activeBlockId) setFocusId(activeBlockId);
            }}
            className="flex items-center gap-1 px-2.5 sm:px-4 h-9 sm:h-11 bg-zinc-900 hover:bg-black text-white rounded-lg sm:rounded-xl shadow-lg transition-all active:scale-95 group/focus"
          >
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current group-hover/focus:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">몰입</span>
          </button>

          {/* 완료 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (activeBlockId) toggleTimeBlock(activeBlockId);
            }}
            className="p-2 sm:p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-90 group/btn"
            title="작업 완료 및 종료"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
