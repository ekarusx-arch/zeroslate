"use client";

import { Crown, CalendarDays, BarChart3, Archive, Zap, Check } from "lucide-react";
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
  { icon: CalendarDays, text: "구글 / 아웃룩 캘린더 양방향 동기화", desc: "이미 잡힌 일정을 자동으로 타임라인에 가져오세요" },
  { icon: Archive,      text: "과거 기록 무제한 조회",                desc: "Free는 7일 — Pro는 평생 기록을 검색할 수 있습니다" },
  { icon: BarChart3,    text: "고급 생산성 통계 대시보드",             desc: "집중 패턴과 태그별 시간 분석을 한눈에 확인하세요" },
  { icon: Zap,          text: "AI 자동 스케줄링 (Magic Fill)",         desc: "할 일을 입력하면 AI가 하루 일정을 자동으로 짜줍니다" },
];

const FREE_LIMITS = [
  "브레인 덤프 · 타임라인 무제한",
  "스마트 태그 · 커스텀 색상",
  "최근 7일 기록 조회",
  "ZeroPilot AI 도우미 (기본)",
];

export default function UpgradeModal({ open, onClose, featureName }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl w-full p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl">

        {/* ── 헤더 ── */}
        <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 px-8 pt-8 pb-14 text-white">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">ZeroSlate Pro</span>
            </div>
            <DialogTitle className="text-2xl font-extrabold text-white leading-snug">
              {featureName
                ? <>{featureName}은<br />Pro 전용 기능입니다.</>
                : <>더 강력한 도구로<br />업그레이드하세요.</>}
            </DialogTitle>
            <p className="text-white/80 text-sm mt-3 leading-relaxed">
              지금 Pro로 업그레이드하고 모든 프리미엄 기능을<br />
              제한 없이 경험해 보세요.
            </p>
          </DialogHeader>
        </div>

        {/* ── 바디 ── */}
        <div className="bg-white -mt-6 rounded-t-3xl px-8 pt-7 pb-8 space-y-7">

          {/* Pro 기능 리스트 */}
          <div className="space-y-4">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Pro 전용 기능</p>
            {PRO_FEATURES.map(({ icon: Icon, text, desc }) => (
              <div key={text} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4.5 h-4.5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-800">{text}</p>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-zinc-100" />

          {/* Free 플랜 포함 내역 */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Free에도 포함됩니다</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {FREE_LIMITS.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                  <span className="text-xs text-zinc-500">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* 가격 */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-zinc-400 font-bold">₩</span>
                <span className="text-4xl font-black text-zinc-900 tracking-tight">5,900</span>
                <span className="text-base text-zinc-400 font-semibold">/월</span>
              </div>
              <p className="text-xs text-amber-600 font-semibold mt-1">연간 결제 시 ₩4,900/월 (17% 절약)</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              30일 환불 보장
            </span>
          </div>

          {/* CTA 버튼 */}
          <div className="space-y-3">
            <Button
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:brightness-110 transition-all text-white font-black text-base shadow-lg shadow-orange-200"
              onClick={() => {
                alert("결제 시스템 준비 중입니다! 곧 오픈됩니다 🎉");
              }}
            >
              <Crown className="w-4 h-4 mr-2" />
              Pro 플랜으로 시작하기
            </Button>
            <button
              onClick={onClose}
              className="w-full text-xs text-zinc-400 hover:text-zinc-600 font-medium transition-colors py-1"
            >
              나중에 생각할게요
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
