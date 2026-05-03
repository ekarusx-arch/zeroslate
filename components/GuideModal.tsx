"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  ListChecks, 
  MousePointer2, 
  Palette, 
  Trophy, 
  Crown, 
  CalendarSync, 
  FastForward,
  CalendarDays,
  Sparkles,
  X
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const guideSteps = [
  {
    title: "Brain Dump",
    body: "머릿속 일을 전부 적고, 완료한 항목은 체크해 정리합니다.",
    icon: ListChecks,
  },
  {
    title: "Top 3 Focus",
    body: "오늘 반드시 처리할 세 가지를 고르고 타임라인에 배치합니다.",
    icon: Trophy,
  },
  {
    title: "Time Blocking",
    body: "왼쪽 항목을 드래그하거나 타임라인을 클릭해 시간을 조정합니다.",
    icon: MousePointer2,
  },
];

const proFeatures = [
  {
    title: "구글 캘린더 양방향 연동",
    body: "구글 일정을 불러오고, 오늘 작업 내용을 구글로 즉시 내보냅니다.",
    icon: CalendarSync,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    title: "스마트 내일로 넘기기",
    body: "미처 끝내지 못한 할 일들을 클릭 한 번으로 내일로 이월합니다.",
    icon: FastForward,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    title: "무제한 과거/미래 계획",
    body: "과거 기록 확인부터 미래 계획까지 자유롭게 날짜를 이동합니다.",
    icon: CalendarDays,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    title: "전체 달력 뷰 (Full View)",
    body: "월간 달력 화면에서 한 달 전체의 일정을 시각적으로 관리합니다.",
    icon: Sparkles,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    title: "몰입(Focus) 모드 타이머",
    body: "중요한 일에만 집중할 수 있는 전용 타이머와 몰입 환경을 제공합니다.",
    icon: Trophy,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    title: "커스텀 테마 & 악센트",
    body: "다양한 테마와 취향에 맞는 콜러로 나만의 워크스페이스를 만듭니다.",
    icon: Palette,
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-100",
  },
  {
    title: "스마트 자동 태깅 시스템",
    body: "해시태그 하나로 색상과 카테고리가 자동으로 관리됩니다.",
    icon: ListChecks,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    title: "성과 분석 리포트",
    body: "하루의 성과를 요약하고 시각화된 리포트로 성장도를 체크합니다.",
    icon: Sparkles,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
];

const colorTags = [
  { tag: "#개발", label: "코딩", color: "bg-[#93C5FD]", textColor: "text-blue-700" },
  { tag: "#음악", label: "창작", color: "bg-[#C4B5FD]", textColor: "text-violet-700" },
  { tag: "#운동", label: "건강", color: "bg-[#6EE7B7]", textColor: "text-emerald-700" },
  { tag: "#휴식", label: "식사", color: "bg-[#FDBA74]", textColor: "text-orange-700" },
  { tag: "#미팅", label: "회의", color: "bg-[#FCA5A5]", textColor: "text-red-700" },
];

export default function GuideModal({ 
  open, 
  onOpenChange 
}: { 
  open?: boolean; 
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!open && (
        <DialogTrigger
          render={
            <button
              className="inline-flex items-center gap-1.5 h-[33px] px-[14px] rounded-lg border border-zinc-200 bg-white text-xs text-zinc-600 hover:bg-zinc-50 font-semibold transition-all active:scale-95 shadow-sm shrink-0 whitespace-nowrap"
              aria-label="사용법 열기"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              사용법
            </button>
          }
        />
      )}
      <DialogContent showCloseButton={false} className="sm:max-w-2xl p-0 border-none shadow-2xl bg-white overflow-hidden rounded-2xl">
        <Tabs defaultValue="basic" className="w-full flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b shrink-0 bg-white">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-zinc-900">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                </div>
                ZeroSlate 사용 가이드
              </DialogTitle>
              <DialogClose
                render={
                  <button className="text-zinc-400 hover:text-zinc-600 transition-colors p-1">
                    <X className="w-5 h-5" />
                  </button>
                }
              />
            </div>
            
            <TabsList className="bg-zinc-100 p-1 rounded-xl w-full gap-1">
              <TabsTrigger 
                value="basic" 
                className="flex-1 text-xs font-bold py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
              >
                기본 가이드
              </TabsTrigger>
              <TabsTrigger 
                value="pro" 
                className="flex-1 text-xs font-bold py-2.5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Crown className="w-3.5 h-3.5" />
                프리미엄 기능
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-zinc-200">
            <TabsContent value="basic" className="mt-0 space-y-3 outline-none focus:ring-0">
              <div className="grid grid-cols-1 gap-2">
                {guideSteps.map((step, index) => {
                  const Icon = step.icon;
                  const colors = [
                    { num: "bg-blue-500", icon: "bg-blue-50 text-blue-600", border: "border-blue-100", hover: "hover:border-blue-200 hover:bg-blue-50/30" },
                    { num: "bg-violet-500", icon: "bg-violet-50 text-violet-600", border: "border-violet-100", hover: "hover:border-violet-200 hover:bg-violet-50/30" },
                    { num: "bg-emerald-500", icon: "bg-emerald-50 text-emerald-600", border: "border-emerald-100", hover: "hover:border-emerald-200 hover:bg-emerald-50/30" },
                  ][index];
                  return (
                    <div key={step.title} className={`flex gap-4 rounded-xl border p-4 transition-all group ${colors.border} ${colors.hover} bg-white shadow-sm`}>
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${colors.num} text-white text-[11px] font-black flex items-center justify-center shrink-0`}>
                          {index + 1}
                        </div>
                        <div className={`w-10 h-10 shrink-0 rounded-xl ${colors.icon} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="pt-0.5">
                        <p className="text-[13px] font-bold text-zinc-800">{step.title}</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{step.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-violet-500" />
                  <p className="text-[13px] font-bold text-zinc-800">자동 색상 태그</p>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {colorTags.map((item) => (
                    <div key={item.tag} className={`flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-lg ${item.color} bg-opacity-10 border border-current border-opacity-20`}>
                      <span className={`text-[11px] font-bold ${item.textColor}`}>{item.tag}</span>
                      <span className="text-[9px] text-zinc-400 font-bold opacity-70">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-zinc-50 rounded-lg">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <p className="text-[10px] text-zinc-400 font-medium">내용에 해시태그를 넣으면 색상이 자동으로 적용됩니다!</p>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50/50 p-3.5 border border-blue-100/40 flex gap-3 items-center">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-[11px] leading-relaxed text-blue-700/80 font-medium">
                  하루가 끝나면 <b>오늘의 요약</b>에서 기록을 저장하세요. 저장된 날은 <b>기록 보관소</b>에서 다시 볼 수 있습니다.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="pro" className="mt-0 space-y-4 outline-none focus:ring-0">
              <div className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-5 relative overflow-hidden shadow-xl">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl" />
                <Crown className="absolute right-4 top-4 w-20 h-20 text-amber-400/10" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 mb-3">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Premium</span>
                  </div>
                  <h3 className="text-[16px] font-black text-white mb-1">ZeroSlate PRO</h3>
                  <p className="text-[12px] text-zinc-400 leading-relaxed">생산성의 천장을 부수는 8가지 프리미엄 기능을 만나보세요.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {proFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className={`flex flex-col gap-3 rounded-xl border p-4 bg-white transition-all hover:shadow-md group ${feature.border}`}>
                      <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-[12.5px] font-bold text-zinc-800 leading-tight">{feature.title}</p>
                        <p className="mt-1 text-[10.5px] leading-relaxed text-zinc-500">{feature.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-bold text-zinc-800">지금 PRO로 업그레이드하세요</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">무료로 시작하고 언제든지 업그레이드</p>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[12px] font-bold shrink-0 shadow-sm">
                  <Crown className="w-3.5 h-3.5" />
                  업그레이드
                </div>
              </div>
            </TabsContent>
          </div>

          {/* Footer */}
          <div className="p-5 pt-3 border-t shrink-0 bg-white">
            <DialogClose
              render={
                <Button className="w-full h-12 bg-zinc-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98]">
                  가이드 닫고 시작하기
                </Button>
              }
            />
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
