"use client";

import { Check, Lock } from "lucide-react";
import { ThemeId, Settings } from "@/types";

const THEME_OPTIONS: Array<{
  id: ThemeId;
  label: string;
  description: string;
  emoji: string;
  isPro: boolean;
  swatches: string[];
  gradient: string;
}> = [
  {
    id: "classic",
    label: "Classic",
    description: "기본 작업 화면",
    emoji: "☀️",
    isPro: false,
    swatches: ["#F0F2F7", "#FFFFFF", "#2563EB"],
    gradient: "linear-gradient(135deg, #F0F2F7 0%, #E8ECF4 50%, #dde3ef 100%)",
  },
  {
    id: "glass",
    label: "Glass",
    description: "맑고 가벼운 유리 표면",
    emoji: "🔮",
    isPro: true,
    swatches: ["#EEF5F8", "#FFFFFFAA", "#0EA5E9"],
    gradient: "linear-gradient(135deg, #daeeff 0%, #eef5fb 50%, #f0f8ff 100%)",
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "밤 작업용 다크 스킨",
    emoji: "🌙",
    isPro: true,
    swatches: ["#0C0F14", "#111827", "#60A5FA"],
    gradient: "linear-gradient(135deg, #0c0f14 0%, #111827 50%, #1a2540 100%)",
  },
  {
    id: "paper",
    label: "Paper",
    description: "차분한 노트 질감",
    emoji: "📄",
    isPro: true,
    swatches: ["#F8F6F1", "#FFFDF8", "#B45309"],
    gradient: "linear-gradient(135deg, #f8f4eb 0%, #fffdf8 50%, #fdf6e3 100%)",
  },
  {
    id: "forest",
    label: "Forest",
    description: "눈이 편한 녹색 톤",
    emoji: "🌿",
    isPro: true,
    swatches: ["#F2F7F3", "#FBFDF9", "#15803D"],
    gradient: "linear-gradient(135deg, #e8f4eb 0%, #f2f7f3 50%, #eaf2ec 100%)",
  },
];

interface ThemeTabProps {
  currentTheme: ThemeId;
  bgMood: string;
  userPlan: string;
  handleSelectTheme: (theme: ThemeId, isPro: boolean) => void;
  updateSettings: (s: Partial<Settings>) => void;
  themeNotice: string | null;
}

export default function ThemeTab({
  currentTheme,
  bgMood,
  userPlan,
  handleSelectTheme,
  updateSettings,
  themeNotice,
}: ThemeTabProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm font-bold text-zinc-800">작업 화면 테마</p>
        <p className="text-xs text-zinc-500">앱 전체 표면과 패널 분위기를 바꿉니다.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEME_OPTIONS.map((theme) => {
          const isActive = (currentTheme || "classic") === theme.id;
          const isLocked = theme.isPro && userPlan !== "pro";
          const isDark = theme.id === "midnight";

          return (
            <button
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id, theme.isPro)}
              className={`relative overflow-hidden rounded-2xl border p-3 text-left transition-all group ${
                isActive
                  ? isDark
                    ? "border-blue-500/50 bg-zinc-900 shadow-lg shadow-blue-900/20"
                    : "border-blue-400 bg-blue-50/70 shadow-sm"
                  : isLocked
                    ? "border-zinc-100 bg-zinc-50/70 opacity-80 hover:opacity-100"
                    : "border-zinc-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"
              }`}
            >
              {/* 테마 프리뷰 */}
              <div
                className="relative mb-3 h-20 rounded-xl overflow-hidden"
                style={{ background: theme.gradient }}
              >
                {isDark && (
                  <>
                    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(96,165,250,0.15) 0%, transparent 60%)" }} />
                    <div className="absolute top-2 right-3 w-1 h-1 rounded-full bg-blue-400/60" />
                    <div className="absolute top-4 right-7 w-0.5 h-0.5 rounded-full bg-blue-300/40" />
                    <div className="absolute top-3 right-10 w-1 h-1 rounded-full bg-violet-400/40" />
                  </>
                )}
                <div className="absolute inset-2 rounded-lg flex gap-1">
                  <div className="w-8 rounded-md" style={{ background: isDark ? "rgba(17,24,39,0.9)" : "rgba(255,255,255,0.7)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }} />
                  <div className="flex-1 rounded-md" style={{ background: isDark ? "rgba(17,24,39,0.7)" : "rgba(255,255,255,0.5)", border: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}>
                    <div className="m-1.5 h-1.5 rounded-full" style={{ background: theme.swatches[2], opacity: 0.8, width: "40%" }} />
                    <div className="mx-1.5 mt-1 h-1 rounded-full bg-current opacity-10" style={{ width: "60%" }} />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {theme.swatches.map((color) => (
                    <span
                      key={color}
                      className="h-5 w-5 rounded-full border-[2px] border-white shadow-md"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-[10px] font-black text-white shadow-lg">
                      <Lock className="h-3 w-3" />
                      PRO 전용
                    </span>
                  </div>
                )}
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-md">
                      <Check className="h-3 w-3" />
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{theme.emoji}</span>
                  <div>
                    <p className={`text-sm font-bold ${isActive && isDark ? "text-white" : "text-zinc-800"}`}>{theme.label}</p>
                    <p className={`text-[11px] font-medium ${isActive && isDark ? "text-zinc-400" : "text-zinc-500"}`}>{theme.description}</p>
                  </div>
                </div>
                {isLocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-[10px] font-black text-white shadow-sm">
                    <Lock className="h-2.5 w-2.5" />
                    PRO
                  </span>
                ) : isActive ? (
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-800">배경 분위기</p>
            <p className="mt-0.5 text-xs text-zinc-500">테마 위에 미묘한 색감 글로우를 입힙니다.</p>
          </div>
          {userPlan !== "pro" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-[10px] font-black text-white shadow-sm">
              <Lock className="h-2.5 w-2.5" />
              PRO
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "none", label: "없음", emoji: "⬜", gradient: "bg-zinc-100", desc: "기본" },
            { id: "sunset", label: "선셋", emoji: "🌅", gradient: "bg-gradient-to-br from-orange-100 to-pink-100", desc: "따뜻한 노을" },
            { id: "ocean", label: "오션", emoji: "🌊", gradient: "bg-gradient-to-br from-sky-100 to-cyan-100", desc: "쌩글한 바다" },
            { id: "aurora", label: "오로라", emoji: "🌌", gradient: "bg-gradient-to-br from-violet-100 to-teal-100", desc: "영롱한 밤" },
            { id: "rose", label: "로즈", emoji: "🌹", gradient: "bg-gradient-to-br from-rose-100 to-pink-100", desc: "케어프리한 색" },
            { id: "forest", label: "포레스트", emoji: "🌿", gradient: "bg-gradient-to-br from-green-100 to-lime-100", desc: "신선한 자연" },
          ].map((mood) => {
            const isMoodActive = (bgMood || "none") === mood.id;
            const isLocked = userPlan !== "pro" && mood.id !== "none";
            return (
              <button
                key={mood.id}
                onClick={() => {
                  if (isLocked) return;
                  updateSettings({ bgMood: mood.id });
                }}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  isMoodActive
                    ? "border-blue-400 bg-blue-50 shadow-sm"
                    : isLocked
                      ? "border-zinc-100 opacity-60 cursor-not-allowed"
                      : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <div className={`w-full h-10 rounded-lg ${mood.gradient} flex items-center justify-center relative overflow-hidden`}>
                  <span className="text-xl">{mood.emoji}</span>
                  {isLocked && (
                    <div className="absolute top-1 right-1">
                      <Lock className="h-2.5 w-2.5 text-zinc-400" />
                    </div>
                  )}
                  {isMoodActive && (
                    <div className="absolute top-1 right-1">
                      <Check className="h-3 w-3 text-blue-500" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-bold text-zinc-700">{mood.label}</p>
                <p className="text-[9px] text-zinc-400 font-medium">{mood.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {themeNotice && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          {themeNotice}
        </div>
      )}
    </div>
  );
}
