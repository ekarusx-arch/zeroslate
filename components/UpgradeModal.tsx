"use client";

import { Crown, Check, CalendarDays, BarChart3, Archive, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  featureName?: string;
}

const PRO_FEATURES = [
  { icon: CalendarDays, text: "구글 / 아웃룩 캘린더 양방향 동기화" },
  { icon: Archive,      text: "과거 기록 무제한 조회 (Free: 7일)" },
  { icon: BarChart3,    text: "고급 생산성 통계 대시보드" },
  { icon: Zap,          text: "AI 자동 스케줄링 (Magic Fill)" },
];

const FREE_FEATURES = [
  "브레인 덤프 · 타임라인 무제한",
  "스마트 태그 · 커스텀 색상",
  "최근 7일 기록 조회",
  "ZeroPilot AI 도우미 (기본)",
];

export default function UpgradeModal({ open, onClose, featureName }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none shadow-2xl">
        {/* 헤더 그라디언트 */}
        <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 px-10 pt-10 pb-12 text-white text-center sm:text-left">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 bg-white/20 px-2 py-0.5 rounded text-white">ZeroSlate Pro</span>
                <DialogTitle className="text-3xl font-extrabold text-white leading-tight mt-1">
                  {featureName
                    ? `${featureName}은\nPro 전용 기능입니다.`
                    : "더 강력한 도구로\n업그레이드하세요."}
                </DialogTitle>
              </div>
            </div>
            <p className="text-white/90 text-base font-medium max-w-lg leading-relaxed">
              지금 Pro로 업그레이드하고 모든 프리미엄 기능을 제한 없이 사용하세요.<br className="hidden sm:block" />
              당신의 생산성을 다음 단계로 끌어올릴 준비가 되셨나요?
            </p>
          </DialogHeader>
        </div>

        <div className="px-10 py-8 space-y-8 -mt-6 bg-white rounded-t-[2rem]">
          {/* 플랜 비교 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Free */}
            <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 flex flex-col h-full">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-5">Basic Plan</p>
              <ul className="space-y-3.5 flex-1">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-500">
                    <Check className="w-4 h-4 text-zinc-300 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-2 border-amber-200 flex flex-col h-full relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-3">
                <Crown className="w-12 h-12 text-amber-100 opacity-50 rotate-12" />
              </div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Recommended
              </p>
              <h3 className="text-lg font-bold text-zinc-800 mb-4">Pro Plan</h3>
              <ul className="space-y-3.5 flex-1 relative z-10">
                {PRO_FEATURES.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm text-zinc-800 font-semibold">
                    <Icon className="w-4 h-4 text-amber-500 shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 가격 */}
          <div className="text-center space-y-1">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-sm font-bold text-zinc-400">₩</span>
              <span className="text-4xl font-black text-zinc-900 tracking-tight">5,900</span>
              <span className="text-lg font-semibold text-zinc-500">/월</span>
            </div>
            <p className="text-sm text-amber-600 font-bold bg-amber-50 inline-block px-3 py-1 rounded-full">
              연간 결제 시 17% 할인 (월 ₩4,900)
            </p>
          </div>

          {/* CTA 버튼 */}
          <div className="space-y-4 pb-2">
            <Button
              className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:scale-[1.02] transition-transform text-white font-black h-14 rounded-2xl text-lg shadow-xl shadow-orange-200/50 border-none"
              onClick={() => {
                alert("결제 시스템 준비 중입니다! 곧 오픈됩니다 🎉");
              }}
            >
              <Crown className="w-5 h-5 mr-2" />
              Pro 플랜으로 시작하기
            </Button>
            <button
              onClick={onClose}
              className="w-full text-sm text-zinc-400 hover:text-zinc-600 font-medium transition-colors"
            >
              나중에 생각할게요
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
