"use client";

import { useState, useEffect, useRef } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { 
  Wind, 
  CloudRain, 
  Coffee, 
  CheckCircle2, 
  Minimize2
} from "lucide-react";

const AMBIENT_SOUNDS = [
  { id: "none", label: "끄기", icon: Wind, url: "" },
  { id: "rain", label: "빗소리", icon: CloudRain, url: "https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3" },
  { id: "cafe", label: "카페", icon: Coffee, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }, // Placeholder
];

export default function FocusModal() {
  const activeFocusId = useTimeboxerStore((s) => s.activeFocusId);
  const setFocusId = useTimeboxerStore((s) => s.setFocusId);
  const timeBlocks = useTimeboxerStore((s) => s.timeBlocks);
  const toggleTimeBlock = useTimeboxerStore((s) => s.toggleTimeBlock);

  const block = timeBlocks.find((b) => b.id === activeFocusId);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState("none");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 타이머 초기화 및 실행
  useEffect(() => {
    if (!block) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      
      const [eh, em] = block.endTime.split(":").map(Number);
      const endMin = eh * 60 + em;
      
      const diff = (endMin - currentMin) * 60 - now.getSeconds();
      return Math.max(0, diff);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [block]);

  // 오디오 제어
  useEffect(() => {
    if (activeSound === "none") {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    const sound = AMBIENT_SOUNDS.find(s => s.id === activeSound);
    if (sound && sound.url) {
      if (!audioRef.current) {
        audioRef.current = new Audio(sound.url);
        audioRef.current.loop = true;
      } else {
        audioRef.current.src = sound.url;
      }
      
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
    }
  }, [activeSound, isPlaying]);


  const formatSeconds = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleComplete = () => {
    if (block) {
      toggleTimeBlock(block.id);
    }
    setFocusId(null);
  };

  return (
    <Dialog open={!!activeFocusId} onOpenChange={(open) => !open && setFocusId(null)}>
      <DialogContent className="max-w-3xl aspect-[4/5] bg-zinc-950 border-zinc-800/50 text-white p-0 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] z-[100] rounded-[40px]">
        {!block ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-zinc-500 font-medium">몰입 준비 중...</p>
          </div>
        ) : (
          <div className="relative h-full flex flex-col items-center justify-between p-12 py-16 overflow-hidden">
            {/* 배경 오로라 효과 */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(30,30,30,0)_0%,rgba(9,9,11,1)_80%)]" />
            </div>

            {/* 닫기 버튼 */}
            <div className="absolute top-8 right-8 z-50">
              <button 
                onClick={() => setFocusId(null)}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all backdrop-blur-md border border-white/5"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* 상단 섹션 */}
            <div className="relative z-10 flex flex-col items-center space-y-6 w-full">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-100/80">Focusing Now</span>
              </div>
              
              <div className="text-center space-y-3">
                <h2 className="text-4xl font-black tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                  {block.content}
                </h2>
                {block.memo && (
                  <p className="text-zinc-500 text-sm font-medium max-w-sm mx-auto leading-relaxed italic">
                    &quot; {block.memo} &quot;
                  </p>
                )}
              </div>
            </div>

            {/* 메인 타이머 섹션 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative group">
                {/* 타이머 빛 번짐 */}
                <div className="absolute -inset-10 bg-blue-500/10 rounded-full blur-[60px] group-hover:bg-blue-500/20 transition-all duration-1000" />
                <p className="text-[160px] font-black tabular-nums tracking-[-0.05em] leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  {formatSeconds(timeLeft)}
                </p>
              </div>
            </div>

            {/* 하단 컨트롤 섹션 */}
            <div className="relative z-10 w-full max-w-sm space-y-10">
              {/* 앰비언트 사운드 선택 */}
              <div className="flex justify-center gap-6">
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
                      className="flex flex-col items-center gap-3 group"
                    >
                      <div className={`p-4 rounded-[24px] border transition-all duration-500 ${
                        isActive 
                        ? "border-blue-500/50 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110" 
                        : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
                      }`}>
                        <Icon className={`w-6 h-6 transition-colors duration-500 ${isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? "text-blue-400" : "text-zinc-600"}`}>
                        {sound.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 완료 버튼 */}
              <button
                onClick={handleComplete}
                className="w-full h-16 bg-white text-black hover:bg-zinc-200 rounded-[24px] font-black text-lg gap-3 flex items-center justify-center transition-all active:scale-[0.98] shadow-[0_20px_40px_rgba(255,255,255,0.1)] group"
              >
                <CheckCircle2 className="w-6 h-6 transition-transform group-hover:scale-110" />
                완료하고 돌아가기
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
