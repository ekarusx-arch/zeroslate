"use client";

import { ListTodo, Timer, BarChart3 } from "lucide-react";

interface MobileNavProps {
  activeTab: "dump" | "timeline" | "stats";
  setActiveTab: (tab: "dump" | "timeline" | "stats") => void;
}

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-zinc-200/50 flex items-center justify-around px-4 z-50 pb-safe">
      <button
        onClick={() => setActiveTab("dump")}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === "dump" ? "text-blue-600 scale-110" : "text-zinc-400"
        }`}
      >
        <ListTodo className="w-5 h-5" />
        <span className="text-[10px] font-bold">할 일</span>
      </button>

      <button
        onClick={() => setActiveTab("timeline")}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === "timeline" ? "text-blue-600 scale-110" : "text-zinc-400"
        }`}
      >
        <Timer className="w-5 h-5" />
        <span className="text-[10px] font-bold">타임라인</span>
      </button>

      <button
        onClick={() => setActiveTab("stats")}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === "stats" ? "text-blue-600 scale-110" : "text-zinc-400"
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span className="text-[10px] font-bold">통계</span>
      </button>
    </nav>
  );
}
