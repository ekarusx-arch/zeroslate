"use client";

import { useState, useEffect, useRef } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Wind, CloudRain, Coffee, CheckCircle2, X } from "lucide-react";

const AMBIENT_SOUNDS = [
  { id: "none", label: "없음", icon: Wind, url: "" },
  { id: "rain", label: "빗소리", icon: CloudRain, url: "https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3" },
  { id: "cafe", label: "카페", icon: Coffee, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
];

export default function FocusModal() {
  const activeFocusId = useTimeboxerStore((s) => s.activeFocusId);
  const setFocusId = useTimeboxerStore((s) => s.setFocusId);
  const timeBlocks = useTimeboxerStore((s) => s.timeBlocks);
  const toggleTimeBlock = useTimeboxerStore((s) => s.toggleTimeBlock);

  const block = timeBlocks.find((b) => b.id === activeFocusId);

  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState("none");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!block) return;

    const calculate = () => {
      const now = new Date();
      const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const [eh, em] = block.endTime.split(":").map(Number);
      const endSec = eh * 3600 + em * 60;
      const [sh, sm] = block.startTime.split(":").map(Number);
      const startSec = sh * 3600 + sm * 60;
      setTotalTime(endSec - startSec);
      return Math.max(0, endSec - currentSec);
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [block]);

  useEffect(() => {
    if (activeSound === "none") {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    const sound = AMBIENT_SOUNDS.find((s) => s.id === activeSound);
    if (sound?.url) {
      if (!audioRef.current) {
        audioRef.current = new Audio(sound.url);
        audioRef.current.loop = true;
      } else {
        audioRef.current.src = sound.url;
      }
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [activeSound, isPlaying]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleComplete = () => {
    if (block) toggleTimeBlock(block.id);
    setFocusId(null);
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Dialog open={!!activeFocusId} onOpenChange={(open) => !open && setFocusId(null)}>
      <DialogContent className="max-w-md w-full bg-[#0d0d0f] border border-white/[0.06] text-white p-0 overflow-hidden shadow-2xl z-[100] rounded-3xl">
        {!block ? (
          <div className="flex items-center justify-center h-80">
            <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col">

            {/* 헤더 */}
            <div className="flex items-center justify-between px-7 pt-7 pb-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Focus Mode
                </span>
              </div>
              <button
                onClick={() => setFocusId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 타이틀 */}
            <div className="px-7 pt-5 pb-8 text-center">
              <h2 className="text-2xl font-bold text-white leading-tight tracking-tight">
                {block.content}
              </h2>
              <p className="mt-1.5 text-sm text-zinc-600">
                {block.startTime} – {block.endTime}
              </p>
              {block.memo && (
                <p className="mt-3 text-sm text-zinc-500 italic leading-relaxed">
                  {block.memo}
                </p>
              )}
            </div>

            {/* 원형 타이머 */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-64 h-64">
                {/* 배경 원 */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 240 240">
                  <circle
                    cx="120" cy="120" r="110"
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="120" cy="120" r="110"
                    fill="none"
                    stroke="url(#timerGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* 타이머 텍스트 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black tabular-nums tracking-tight leading-none">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="mt-2 text-xs font-medium text-zinc-600 uppercase tracking-widest">
                    남은 시간
                  </span>
                </div>
              </div>
            </div>

            {/* 구분선 */}
            <div className="mx-7 mt-6 h-px bg-white/[0.05]" />

            {/* 앰비언트 사운드 */}
            <div className="flex items-center justify-center gap-3 px-7 py-5">
              {AMBIENT_SOUNDS.map((sound) => {
                const Icon = sound.icon;
                const isActive = activeSound === sound.id;
                return (
                  <button
                    key={sound.id}
                    onClick={() => {
                      if (activeSound === sound.id) {
                        setIsPlaying(!isPlaying);
                      } else {
                        setActiveSound(sound.id);
                        setIsPlaying(true);
                      }
                    }}
                    className={`flex-1 flex flex-col items-center gap-2 py-3.5 rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : "border-white/[0.05] bg-white/[0.03] text-zinc-600 hover:text-zinc-400 hover:border-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{sound.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 완료 버튼 */}
            <div className="px-7 pb-7">
              <button
                onClick={handleComplete}
                className="w-full h-14 flex items-center justify-center gap-2.5 rounded-2xl bg-white text-zinc-900 font-bold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                작업 완료하기
              </button>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
