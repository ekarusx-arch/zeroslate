"use client";

import Link from "next/link";
import { ArrowRight, Brain, CalendarDays, Sparkles, Timer, Zap, CalendarSync, FastForward, Palette, Crown, ListChecks } from "lucide-react";

// ─── 유틸리티 컴포넌트 ───────────────────────────────────────────

function Noise() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`}
    />
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-zinc-300 bg-white/5 border border-white/10 backdrop-blur-sm">
      {children}
    </span>
  );
}

function StatBar() {
  const stats = [
    { label: "일평균 절약 시간", value: "47분" },
    { label: "사용자 만족도", value: "98%" },
    { label: "완료율 향상", value: "3.2×" },
    { label: "완전 무료 시작", value: "0원" },
  ];
  return (
    <div className="relative z-10 border-y border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-2xl font-black text-white tracking-tight">{value}</div>
            <div className="text-[11px] text-white/40 font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowStep({ step, title, desc, color }: { step: string; title: string; desc: string; color: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${color}`}>{step}</div>
      <div>
        <h3 className="text-base font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── 앱 미리보기 UI ──────────────────────────────────────────────

function AppPreview() {
  return (
    <div className="relative w-full max-w-4xl mx-auto mt-16 select-none">
      {/* 반사광 효과 */}
      <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-b from-transparent to-blue-500/5 pointer-events-none" />

      {/* 외부 프레임 */}
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_32px_80px_-16px_rgba(0,0,0,0.8)]">
        {/* 맥OS 스타일 상단 바 */}
        <div className="flex items-center gap-2 px-4 h-10 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          <div className="flex-1 mx-4 h-5 rounded-md bg-white/5 flex items-center justify-center">
            <span className="text-[10px] text-white/20 font-mono">zeroslate.app</span>
          </div>
        </div>

        {/* 앱 콘텐츠 */}
        <div className="flex h-72">
          {/* 좌측 패널 */}
          <div className="w-56 border-r border-white/[0.06] p-4 flex flex-col gap-3">
            <div className="h-4 w-20 rounded bg-white/10" />
            <div className="space-y-2">
              {["#개발", "#디자인", "#미팅"].map((tag, i) => (
                <div key={tag} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${["bg-blue-400", "bg-violet-400", "bg-emerald-400"][i]}`} />
                  <div className="flex-1 h-2.5 rounded bg-white/10" />
                </div>
              ))}
            </div>
            <div className="h-px bg-white/[0.06] my-1" />
            <div className="h-3.5 w-14 rounded bg-white/5" />
            {[0.9, 0.7, 0.8].map((op, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-white/[0.04]">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="flex-1 h-2 rounded" style={{ background: `rgba(255,255,255,${op * 0.06})` }} />
              </div>
            ))}
          </div>

          {/* 타임라인 */}
          <div className="flex-1 p-4 relative overflow-hidden">
            <div className="h-3.5 w-24 rounded bg-white/10 mb-4" />
            {/* 시간 축 */}
            <div className="relative space-y-0">
              {["09:00", "10:00", "11:00", "12:00", "13:00"].map((t, i) => (
                <div key={t} className="flex items-start gap-3 h-10">
                  <span className="text-[9px] text-white/20 font-mono shrink-0 pt-1">{t}</span>
                  <div className="flex-1 border-t border-white/[0.05] pt-1">
                    {i === 0 && (
                      <div className="h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center px-3">
                        <div className="h-2 w-28 rounded bg-blue-400/40" />
                      </div>
                    )}
                    {i === 1 && (
                      <div className="h-16 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center px-3">
                        <div className="h-2 w-20 rounded bg-violet-400/40" />
                      </div>
                    )}
                    {i === 3 && (
                      <div className="h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center px-3">
                        <div className="h-2 w-16 rounded bg-emerald-400/40" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* 현재 시간 라인 */}
              <div className="absolute left-12 right-0 top-[62px] h-px bg-red-400/60 flex items-center">
                <div className="absolute -left-1.5 w-2.5 h-2.5 rounded-full bg-red-400 border border-black/50" />
              </div>
            </div>
          </div>

          {/* 우측 패널 */}
          <div className="w-48 border-l border-white/[0.06] p-4 space-y-3">
            <div className="h-3.5 w-16 rounded bg-white/10" />
            <div className="aspect-square w-full rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className={`aspect-square rounded-sm text-[6px] flex items-center justify-center ${i === 14 ? "bg-blue-500" : "bg-white/5"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 반사 */}
      <div className="h-16 mx-8 rounded-b-2xl bg-gradient-to-b from-white/[0.03] to-transparent border-x border-white/5" />
    </div>
  );
}

// ─── 특징 카드 ───────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    title: "Brain Dump",
    desc: "머릿속 생각을 모두 쏟아내세요. 정리하려 하지 말고, 그냥 흘러가게 두세요.",
    plan: "free"
  },
  {
    icon: CalendarDays,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    title: "타임박싱",
    desc: "드래그 한 번으로 할 일을 타임라인에 배치. 하루가 구체적인 계획이 됩니다.",
    plan: "free"
  },
  {
    icon: CalendarSync,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    title: "구글 캘린더 동기화",
    desc: "양방향 실시간 동기화로 외부 일정과 ZeroSlate 계획을 하나로 통합하세요.",
    plan: "pro"
  },
  {
    icon: FastForward,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    title: "스마트 내일로 넘기기",
    desc: "미처 끝내지 못한 일들을 클릭 한 번으로 내일 타임라인에 즉시 이월합니다.",
    plan: "pro"
  },
  {
    icon: Sparkles,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    title: "AI 성과 분석 리포트",
    desc: "나의 시간 사용 패턴을 AI가 분석하여 주간/월간 성장 보고서를 생성합니다.",
    plan: "pro"
  },
  {
    icon: Timer,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    title: "몰입(Focus) 타이머",
    desc: "오직 하나의 작업에만 집중할 수 있는 전용 타이머와 몰입 환경을 제공합니다.",
    plan: "pro"
  },
  {
    icon: Palette,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    title: "커스텀 테마 & 컬러",
    desc: "나만의 취향이 담긴 테마와 악센트 컬러로 워크스페이스를 아름답게 꾸미세요.",
    plan: "pro"
  },
  {
    icon: ListChecks,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    title: "자동 태깅 시스템",
    desc: "해시태그 하나로 작업 카테고리와 색상이 자동으로 관리되어 정리가 빨라집니다.",
    plan: "pro"
  }
];

// ─── 메인 랜딩 페이지 ─────────────────────────────────────────────

export default function LandingPage({ onOpenGuide }: { onOpenGuide?: () => void }) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">
      <Noise />

      {/* 배경 글로우 오브 */}
      <GlowOrb className="w-[800px] h-[600px] bg-blue-600/20 top-[-200px] left-1/2 -translate-x-1/2" />
      <GlowOrb className="w-[400px] h-[400px] bg-violet-600/15 top-[400px] right-[-100px]" />
      <GlowOrb className="w-[300px] h-[300px] bg-blue-600/10 bottom-[100px] left-[-50px]" />

      {/* ── 네비게이션 ── */}
      <header className="relative z-20 sticky top-0 border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Timer className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">ZeroSlate</span>
          </div>

          {/* 네비 링크 */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              기능
            </button>
            <button
              onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              소개
            </button>
            <button
              onClick={() => document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              시작하기
            </button>
          </nav>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/50 hover:text-white transition-colors duration-200 hidden sm:block"
            >
              로그인
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-zinc-100 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              무료로 시작하기
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── 히어로 섹션 ── */}
      <section id="hero" className="relative z-10 pt-24 pb-8 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-7">
          {/* 배지 */}
          <div className="flex justify-center">
            <Badge>
              <Zap className="w-3 h-3 text-yellow-400" />
              AI 기반 생산성 엔진 ZeroSlate
            </Badge>
          </div>

          {/* 헤드라인 */}
          <h1 className="text-5xl md:text-[72px] font-extrabold tracking-tight leading-[1.05] text-white">
            복잡한 뇌를 비우고,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400">
              현재에만 집중하세요.
            </span>
          </h1>

          {/* 서브 카피 */}
          <p className="max-w-xl mx-auto text-lg text-white/50 leading-relaxed font-medium">
            생각을 가볍게 쏟아내고, 타임라인에 바로 배치하세요.
            <br className="hidden md:block" />
            불필요한 고민은 ZeroSlate가 대신 정리합니다.
          </p>

          {/* 가이드 유도 문구 상세화 및 강화 */}
          <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <button 
              onClick={onOpenGuide}
              className="group inline-flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-all duration-300 bg-white/[0.03] hover:bg-white/[0.08] px-5 py-2.5 rounded-full border border-white/5 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-sm"
            >
              <div className="relative">
                <Sparkles className="w-4 h-4 text-blue-400 group-hover:scale-125 transition-transform" />
                <div className="absolute inset-0 bg-blue-400/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-medium">복잡한 하루를 0순위로 만드는 법? <span className="text-blue-400 group-hover:text-blue-300 transition-colors">8가지 핵심 기능</span>을 확인해 보세요</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
            </button>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-bold text-base hover:bg-zinc-100 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              지금 무료로 시작하기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-sm text-white/30">
              별도 설치 없이 · 바로 사용 가능
            </span>
          </div>
        </div>

        {/* 앱 미리보기 */}
        <AppPreview />
      </section>

      {/* 통계 바 */}
      <StatBar />

      {/* 워크플로우 섹션 */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <Badge><Sparkles className="w-3 h-3 text-violet-400" />이렇게 쓰세요</Badge>
              <h2 className="text-3xl font-extrabold text-white leading-tight">3단계로 완성되는<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">완벽한 하루</span></h2>
              <div className="space-y-5">
                <WorkflowStep step="1" title="Brain Dump — 쏟아내기" desc="머릿속 모든 생각을 검열 없이 적어두세요. 뇌의 RAM을 비워야 집중할 수 있습니다." color="bg-blue-500/20 text-blue-400" />
                <WorkflowStep step="2" title="Top 3 — 우선순위 정하기" desc="오늘 반드시 끝낼 3가지를 선택하세요. 선택과 집중이 성과를 만듭니다." color="bg-violet-500/20 text-violet-400" />
                <WorkflowStep step="3" title="Time Box — 시간 배정하기" desc="드래그 한 번으로 타임라인에 배치하세요. 계획이 구체적일수록 실행됩니다." color="bg-emerald-500/20 text-emerald-400" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-violet-600/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
                {[
                  { tag: "#개발", time: "09:00 - 11:00", color: "bg-blue-500/20 border-blue-500/30 text-blue-300" },
                  { tag: "#미팅", time: "11:00 - 12:00", color: "bg-red-500/20 border-red-500/30 text-red-300" },
                  { tag: "#운동", time: "18:00 - 19:00", color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" },
                ].map(({ tag, time, color }) => (
                  <div key={tag} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${color}`}>
                    <span className="font-bold text-sm">{tag}</span>
                    <span className="text-xs opacity-70 font-mono">{time}</span>
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <span className="text-xs text-white/30">← 드래그로 배치됨</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 특징 섹션 ── */}
      <section id="features" className="relative z-10 py-32 px-6">
        <GlowOrb className="w-[500px] h-[500px] bg-amber-600/10 top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-6xl mx-auto">
          {/* 섹션 헤더 */}
          <div className="text-center mb-16 space-y-4">
            <Badge>
              <Crown className="w-3 h-3 text-amber-400" />
              FREE + PRO 기능
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight text-white">
              무료로 시작하고,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">PRO로 도약하세요.</span>
            </h2>
            <p className="text-white/40 max-w-md mx-auto">
              기본 기능은 영원히 무료입니다. PRO는 당신의 성장을 가속화합니다.
            </p>
          </div>

          {/* 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, color, bg, border, title, desc, plan }) => (
              <div
                key={title}
                className={`group relative p-6 rounded-2xl border bg-white/[0.02] backdrop-blur-sm transition-all duration-300 overflow-hidden ${
                  plan === 'pro' 
                    ? 'border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/[0.04]' 
                    : 'border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.04]'
                }`}
              >
                {/* PRO 배지 */}
                {plan === 'pro' && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <Crown className="w-2.5 h-2.5 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Pro</span>
                  </div>
                )}

                {/* 아이콘 */}
                <div className={`w-12 h-12 rounded-xl ${bg} border ${border} flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>

                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-white/50 text-[13px] leading-relaxed font-medium">{desc}</p>

                {/* 호버 시 그라디언트 오버레이 */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                  plan === 'pro' 
                    ? 'bg-gradient-to-br from-amber-500/[0.02] to-transparent' 
                    : 'bg-gradient-to-br from-white/[0.02] to-transparent'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA 배너 ── */}
      <section id="cta" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/10">
            {/* 배경 그라디언트 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-600/15 to-transparent" />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
            <div className="relative z-10 p-12 md:p-16 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white/70 mb-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                지금 바로 무료로 시작할 수 있습니다
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                오늘의 당신,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-violet-300 to-pink-300">더 잘할 수 있어요.</span>
              </h2>
              <p className="text-white/50 text-lg max-w-lg mx-auto">
                뇌를 비우고, 집중하고, 실행하세요.
                ZeroSlate가 당신의 하루를 설계합니다.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-black font-black text-base hover:bg-zinc-100 transition-all duration-200 hover:-translate-y-1 shadow-[0_0_60px_rgba(255,255,255,0.15)] active:scale-95"
                >
                  무료로 시작하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-white/30 text-sm">별도 설치 없이 · 바로 시작</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
              <Timer className="w-3.5 h-3.5 text-white/60" />
            </div>
            <span className="text-sm font-bold text-white/60">ZeroSlate</span>
          </div>
          <p className="text-xs text-white/25">
            © 2026 ZeroSlate. 고효율을 추구하는 당신을 위해 제작되었습니다.
          </p>
          <div className="flex gap-5">
            {["개인정보처리방침", "이용약관", "문의"].map((t) => (
              <a key={t} href="#" className="text-xs text-white/25 hover:text-white/60 transition-colors">
                {t}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
