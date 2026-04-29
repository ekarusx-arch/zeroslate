"use client";

import { useState } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { 
  Sparkles, 
  X, 
  Zap, 
  BrainCircuit,
  Loader2,
  ChevronRight
} from "lucide-react";

export default function ZeroPilot() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    isPilotLoading, 
    pilotMessage, 
    setPilotLoading, 
    setPilotMessage,
    brainDump,
  } = useTimeboxerStore();

  const handleAction = async (type: string, data?: unknown) => {
    setPilotLoading(true);
    setIsOpen(true);
    try {
      const res = await fetch("/api/zeropilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: data || { items: brainDump } })
      });
      const result = await res.json();
      
      if (type === "plan" && result.suggestions) {
        setPilotMessage(result.message);
        // 제안된 일정들을 저장해두었다가 사용자가 승인하면 추가하도록 구현 가능
        // 여기서는 예시로 메시지만 표시
      } else if (type === "refine") {
        setPilotMessage(`추천 명칭: ${result.refined}`);
      } else {
        setPilotMessage(result.message);
      }
    } catch (_e) {
      setPilotMessage("앗, 연결에 문제가 생겼어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setPilotLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Pilot 대화창 */}
      {isOpen && (
        <div className="w-80 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-zinc-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">
          {/* 헤더 */}
          <div className="p-4 bg-zinc-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500 rounded-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-black tracking-tight">ZeroPilot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 p-4 min-h-[120px] flex flex-col justify-center">
            {isPilotLoading ? (
              <div className="flex flex-col items-center gap-3 text-zinc-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <p className="text-xs font-bold animate-pulse">생각 중...</p>
              </div>
            ) : pilotMessage ? (
              <div className="space-y-3">
                <p className="text-sm text-zinc-700 leading-relaxed font-medium">{pilotMessage}</p>
                <button 
                  onClick={() => setPilotMessage(null)}
                  className="text-[10px] font-bold text-blue-500 hover:underline"
                >
                  지우기
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-xs text-zinc-400 font-medium">오늘 하루를 어떻게 도와드릴까요?</p>
              </div>
            )}
          </div>

          {/* 빠른 액션 */}
          <div className="p-4 border-t border-zinc-50 bg-zinc-50/50 space-y-2">
            <button 
              onClick={() => handleAction("plan")}
              className="w-full flex items-center justify-between p-2.5 bg-white border border-zinc-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all group"
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                <span className="text-xs font-bold">브레인 덤프 분석</span>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-300 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => handleAction("feedback", { progress: 50 })}
              className="w-full flex items-center justify-between p-2.5 bg-white border border-zinc-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all group"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold">응원 한 마디</span>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* 메인 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 ${
          isOpen ? "bg-zinc-900 text-white" : "bg-blue-600 text-white"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
      </button>
    </div>
  );
}
