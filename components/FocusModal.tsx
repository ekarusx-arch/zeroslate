"use client";

import { useState, useEffect, useRef } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[100]">
        {!block ? (
          <div className="p-20 text-center text-zinc-500">정보를 불러오는 중...</div>
        ) : (
          <>
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={() => setFocusId(null)}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>

        <div className="p-12 flex flex-col items-center text-center space-y-10">
          {/* 헤더 */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Focusing Now
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{block.content}</h2>
            {block.memo && (
              <p className="text-zinc-400 text-sm max-w-md mx-auto line-clamp-2">
                {block.memo}
              </p>
            )}
          </div>

          {/* 타이머 */}
          <div className="relative group">
            <div className="absolute -inset-8 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
            <p className="text-[120px] font-black tabular-nums tracking-tighter leading-none relative">
              {formatSeconds(timeLeft)}
            </p>
          </div>

          {/* 하단 컨트롤 */}
          <div className="w-full max-w-sm space-y-8 relative">
            {/* 백색소음 선택 */}
            <div className="flex justify-center gap-4">
              {AMBIENT_SOUNDS.map((sound) => {
                const Icon = sound.icon;
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
                    className={`flex flex-col items-center gap-2 transition-all ${
                      activeSound === sound.id ? "text-blue-400 scale-110" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <div className={`p-3 rounded-2xl border ${
                      activeSound === sound.id ? "border-blue-500/50 bg-blue-500/10" : "border-zinc-800 bg-zinc-900"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{sound.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 메인 버튼 */}
            <div className="flex gap-3">
              <Button
                onClick={handleComplete}
                className="flex-1 h-14 bg-white text-black hover:bg-zinc-200 rounded-2xl font-bold text-base gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                작업 완료
              </Button>
            </div>
          </div>
        </div>

        {/* 배경 효과 */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-[-1]">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px]" />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
