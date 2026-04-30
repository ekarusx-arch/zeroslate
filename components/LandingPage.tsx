"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Timer, Zap, Target, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* ── 네비게이션 ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900">ZeroSlate</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-zinc-600 hover:text-blue-600 transition-colors">
              로그인
            </Link>
            <Link href="/login">
              <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-6 text-sm font-bold shadow-xl shadow-zinc-200 transition-all hover:scale-105 active:scale-95">
                무료로 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── 히어로 섹션 ── */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 기반 생산성 엔진 ZeroSlate 출시</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-zinc-900">
            복잡한 하루를 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              0에서부터 새롭게
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 font-medium leading-relaxed">
            머릿속 생각을 쏟아내고, 단 한 번의 드래그로 완벽한 타임라인을 만드세요. <br />
            당신의 뇌는 도구를 고민하는 대신, 실행하는 데에만 집중해야 합니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-10 py-7 text-lg font-bold shadow-2xl shadow-blue-200 transition-all hover:-translate-y-1">
                지금 바로 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-zinc-400 font-medium italic">
              별도의 설치 없이 브라우저에서 바로 사용 가능
            </p>
          </div>

          {/* 앱 미리보기 (CSS 가상 대시보드) */}
          <div className="mt-20 relative mx-auto max-w-4xl p-2 rounded-[32px] bg-gradient-to-b from-zinc-200 to-zinc-100 shadow-2xl overflow-hidden animate-float">
            <div className="bg-white rounded-[24px] border border-white shadow-inner overflow-hidden aspect-[16/10] flex">
              {/* 좌측 패널 모사 */}
              <div className="w-[30%] border-r border-zinc-50 p-4 space-y-4">
                <div className="h-6 w-24 bg-zinc-100 rounded-md" />
                <div className="space-y-2">
                  <div className="h-10 w-full bg-blue-50 rounded-xl" />
                  <div className="h-10 w-full bg-zinc-50 rounded-xl" />
                  <div className="h-10 w-full bg-zinc-50 rounded-xl" />
                </div>
              </div>
              {/* 타임라인 모사 */}
              <div className="flex-1 p-4 flex flex-col gap-4">
                <div className="h-8 w-32 bg-zinc-100 rounded-md" />
                <div className="flex-1 border border-zinc-50 rounded-2xl relative p-4">
                  <div className="absolute top-10 left-4 right-4 h-20 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center px-4">
                    <div className="h-3 w-32 bg-blue-500/20 rounded" />
                  </div>
                  <div className="absolute top-40 left-4 right-4 h-12 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center px-4">
                    <div className="h-3 w-24 bg-violet-500/20 rounded" />
                  </div>
                </div>
              </div>
            </div>
            {/* 장식용 글로우 */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/10 blur-[100px] rounded-full" />
          </div>
        </div>
      </section>

      {/* ── 특징 섹션 ── */}
      <section className="py-32 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 카드 1 */}
            <div className="p-8 rounded-[32px] bg-white border border-zinc-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Brain Dump</h3>
              <p className="text-zinc-500 leading-relaxed font-medium">
                떠오르는 모든 아이디어와 할 일을 쏟아내세요. <br />
                복잡한 머릿속을 비우는 것만으로도 생산성이 시작됩니다.
              </p>
            </div>
            {/* 카드 2 */}
            <div className="p-8 rounded-[32px] bg-white border border-zinc-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Drag & Timeline</h3>
              <p className="text-zinc-500 leading-relaxed font-medium">
                리스트를 타임라인으로 끌어다 놓으세요. <br />
                가시적인 타임라인이 당신의 하루를 더 선명하게 만듭니다.
              </p>
            </div>
            {/* 카드 3 */}
            <div className="p-8 rounded-[32px] bg-white border border-zinc-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Smart Tagging</h3>
              <p className="text-zinc-500 leading-relaxed font-medium">
                특정 키워드에 색상을 매칭하세요. <br />
                직관적인 색상 분류로 일과 삶의 균형을 한눈에 파악합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 섹션 3: 가치 제안 ── */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-extrabold text-zinc-900 leading-tight">
              생각은 단순하게, <br />
              성과는 강력하게.
            </h2>
            <p className="text-lg text-zinc-500 font-medium leading-relaxed">
              ZeroSlate는 단순히 일정을 관리하는 도구가 아닙니다. 당신의 뇌가 오직 현재의 과업에만 몰입할 수 있도록 돕는 보조 기억 장치입니다.
            </p>
            <ul className="space-y-4">
              {[
                "강력한 드래그 앤 드롭 인터페이스",
                "사용자 정의 스마트 태그 시스템",
                "AI 기반 작업 최적화 도우미",
                "실시간 클라우드 동기화",
              ].map((text) => (
                <li key={text} className="flex items-center gap-3 text-zinc-700 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full aspect-square bg-gradient-to-br from-blue-50 to-violet-50 rounded-[64px] border border-blue-100 flex items-center justify-center p-12">
            <div className="relative w-full h-full">
              {/* 추상적인 디자인 요소 */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-3xl shadow-2xl rotate-12 flex items-center justify-center">
                <Timer className="w-12 h-12 text-blue-600" />
              </div>
              <div className="absolute bottom-10 left-0 w-48 h-48 bg-white rounded-3xl shadow-2xl -rotate-6 flex items-center justify-center p-6">
                 <div className="space-y-3 w-full">
                   <div className="h-3 w-full bg-zinc-100 rounded" />
                   <div className="h-3 w-2/3 bg-zinc-100 rounded" />
                   <div className="h-8 w-full bg-blue-500 rounded-lg" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="py-20 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Timer className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-zinc-900">ZeroSlate</span>
          </div>
          <p className="text-zinc-400 text-sm font-medium">
            © 2026 ZeroSlate. All rights reserved. <br />
            Designed for high-performance minds.
          </p>
          <div className="flex justify-center gap-6 text-xs font-bold text-zinc-400 uppercase tracking-widest">
            <Link href="#" className="hover:text-blue-600 transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

      {/* ── 애니메이션 스타일 ── */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
