"use client";

import { Crown, CalendarDays, BarChart3, Zap, Check, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
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
  { icon: Tag,          text: "스마트 태그 & 커스텀 색상",             desc: "내 작업 분류에 맞춰 태그와 컬러를 직접 설정하세요" },
  { icon: Zap,          text: "ZeroPilot AI 자동화",                  desc: "분석, 패턴 리포트, Magic Fill로 하루 계획을 빠르게 만듭니다" },
  { icon: BarChart3,    text: "무제한 아카이브 + 고급 통계",           desc: "평생 기록과 태그별 시간 분석을 한눈에 확인하세요" },
];

const FREE_LIMITS = [
  "브레인 덤프 · 타임라인 무제한",
  "기본 태그 색상",
  "최근 7일 기록 조회",
  "ZeroPilot 응원 한 마디",
];

export default function UpgradeModal({ open, onClose, featureName }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="!w-[min(94vw,920px)] !max-w-[min(94vw,920px)] sm:!max-w-[min(94vw,920px)] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl">

        <div className="grid max-h-[88vh] overflow-y-auto lg:grid-cols-[0.9fr_1.1fr]">
          {/* ── 헤더 ── */}
          <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 px-8 py-8 text-white lg:flex lg:min-h-[620px] lg:flex-col lg:justify-between lg:px-10 lg:py-10">
            <DialogHeader>
              <div>
                <div className="flex items-center gap-2 mb-7">
                  <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Crown className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.22em] opacity-85">ZeroSlate Pro</span>
                </div>
                <DialogTitle className="text-3xl font-black text-white leading-tight tracking-tight lg:text-4xl">
                  {featureName
                    ? <>{featureName}<br />Pro 전용 기능입니다.</>
                    : <>더 강력한 도구로<br />업그레이드하세요.</>}
                </DialogTitle>
                <p className="text-white/85 text-sm mt-5 leading-relaxed">
                  자동화, 전체 기록, 고급 통계를 한 화면에서 연결해<br className="hidden lg:block" />
                  하루 계획과 회고를 더 가볍게 만드세요.
                </p>
              </div>
            </DialogHeader>

            <div className="mt-8 hidden rounded-3xl border border-white/20 bg-white/12 p-5 text-white/90 backdrop-blur-sm lg:block">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">Included</p>
              <p className="mt-3 text-sm font-bold leading-relaxed">
                캘린더 자동화, 스마트 태그, ZeroPilot AI, 무제한 아카이브를 한 번에 해제합니다.
              </p>
            </div>
          </div>

          {/* ── 바디 ── */}
          <div className="bg-white px-7 py-7 space-y-7 lg:px-9 lg:py-9">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Pro 전용 기능</p>
                <p className="mt-1 text-xs font-semibold text-zinc-500">자주 쓰는 기능부터 바로 체감되도록 구성했습니다.</p>
              </div>
              <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-700">
                PREMIUM
              </span>
            </div>

            {/* Pro 기능 리스트 */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {PRO_FEATURES.map(({ icon: Icon, text, desc }) => (
                <div key={text} className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-zinc-900">{text}</p>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-zinc-100" />

            {/* Free 플랜 포함 내역 */}
            <div className="space-y-3">
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Free에도 포함됩니다</p>
              <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                {FREE_LIMITS.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                    <span className="text-xs font-medium text-zinc-500">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* 가격 */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-zinc-400 font-bold">₩</span>
                  <span className="text-5xl font-black text-zinc-900 tracking-tight">5,900</span>
                  <span className="text-base text-zinc-400 font-semibold">/월</span>
                </div>
                <p className="text-xs text-amber-600 font-bold mt-1">연간 결제 시 ₩4,900/월 (17% 절약)</p>
              </div>
              <span className="w-fit text-[10px] bg-emerald-50 text-emerald-600 font-black px-3 py-1.5 rounded-full border border-emerald-200">
                30일 환불 보장
              </span>
            </div>

            {/* CTA 버튼 */}
            <div className="space-y-3">
              <Button
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:brightness-110 transition-all text-white font-black text-base shadow-lg shadow-orange-200"
                onClick={() => {
                  const setUserPlan = useTimeboxerStore.getState().setUserPlan;
                  setUserPlan('pro');
                  // Pro 업그레이드 후 바로 구글 로그인 시도
                  window.location.href = "/api/auth/google";
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
