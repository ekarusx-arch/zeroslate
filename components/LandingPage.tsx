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

      {/* ── 특징 섹션 ── */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          {/* 섹션 헤더 */}
          <div className="text-center mb-16 space-y-4">
            <Badge>
              <Sparkles className="w-3 h-3 text-blue-400" />
              핵심 기능
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight text-white">
              더 적게 고민하고,
              <br />
              더 많이 실행하세요.
            </h2>
            <p className="text-white/40 max-w-md mx-auto">
              당신의 성과를 위해 꼭 필요한 기능만 담았습니다.
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
      <section id="cta" className="relative z-10 py-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl" />
            <h2 className="relative text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              오늘부터 달라지는 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">당신의 하루</span>
            </h2>
          </div>
          <p className="text-white/40 text-lg">
            이미 많은 분들이 ZeroSlate로 명쾌한 하루를 보내고 있습니다.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-base hover:from-blue-500 hover:to-violet-500 transition-all duration-200 hover:-translate-y-0.5 shadow-xl shadow-blue-900/40"
          >
            지금 바로 시작하기
            <ArrowRight className="w-4 h-4" />
          </Link>
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
