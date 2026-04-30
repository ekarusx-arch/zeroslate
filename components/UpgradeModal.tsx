"use client";

import { Crown, Check, X, CalendarDays, BarChart3, Archive, Zap } from "lucide-react";
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
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white border-none shadow-2xl">
        {/* 헤더 그라디언트 */}
        <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 px-6 pt-8 pb-10 text-white">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">ZeroSlate Pro</span>
            </div>
            <DialogTitle className="text-2xl font-extrabold text-white leading-tight">
              {featureName
                ? `${featureName}은 Pro 전용 기능입니다.`
                : "더 강력한 도구로 업그레이드하세요."}
            </DialogTitle>
            <p className="text-white/80 text-sm mt-2 font-medium">
              지금 Pro로 업그레이드하고 모든 프리미엄 기능을 무제한으로 사용하세요.
            </p>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5 -mt-4">
          {/* 플랜 비교 카드 */}
          <div className="grid grid-cols-2 gap-3">
            {/* Free */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Free</p>
              <ul className="space-y-2">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-zinc-600">
                    <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Pro
              </p>
              <p className="text-[10px] text-zinc-500 mb-2 font-medium">Free의 모든 기능 +</p>
              <ul className="space-y-2">
                {PRO_FEATURES.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-1.5 text-xs text-zinc-700 font-medium">
                    <Icon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 가격 */}
          <div className="text-center">
            <p className="text-3xl font-extrabold text-zinc-900">₩5,900
              <span className="text-base font-semibold text-zinc-400"> / 월</span>
            </p>
            <p className="text-xs text-zinc-400 mt-1">연간 결제 시 17% 할인 (₩4,900/월)</p>
          </div>

          {/* CTA 버튼 */}
          <div className="space-y-2 pb-1">
            <Button
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold h-12 rounded-xl text-base shadow-lg shadow-amber-200"
              onClick={() => {
                // TODO: Paddle 결제 연동
                alert("결제 시스템 준비 중입니다! 곧 오픈됩니다 🎉");
              }}
            >
              <Crown className="w-4 h-4 mr-2" />
              Pro로 업그레이드하기
            </Button>
            <button
              onClick={onClose}
              className="w-full text-xs text-zinc-400 hover:text-zinc-600 transition-colors py-1"
            >
              나중에 하기
            </button>
          </div>
        </div>

        {/* 닫기 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
