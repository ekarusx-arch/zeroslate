"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, ListChecks, MousePointer2, Palette, Trophy } from "lucide-react";

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
    body: "왼쪽 항목을 드래그하거나 타임라인을 클릭해 블록을 만들고 시간을 조정합니다.",
    icon: MousePointer2,
  },
];

const colorTags = [
  { tag: "#개발", label: "코딩/개발", color: "bg-[#93C5FD]", textColor: "text-blue-700" },
  { tag: "#음악", label: "작곡/기획", color: "bg-[#C4B5FD]", textColor: "text-violet-700" },
  { tag: "#운동", label: "건강/스포츠", color: "bg-[#6EE7B7]", textColor: "text-emerald-700" },
  { tag: "#휴식", label: "식사/리프레시", color: "bg-[#FDBA74]", textColor: "text-orange-700" },
  { tag: "#미팅", label: "연락/회의", color: "bg-[#FCA5A5]", textColor: "text-red-700" },
];

export default function GuideModal() {
  return (
    <Dialog>
      <DialogTrigger
        className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-zinc-200 bg-white text-xs text-zinc-600 hover:bg-zinc-50 font-medium transition-colors"
        aria-label="사용법 열기"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        사용법
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            ZeroSlate 사용법
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2.5">
            {guideSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="flex gap-3 rounded-lg border border-zinc-100 bg-zinc-50/70 p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-blue-600 shadow-sm">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-zinc-100 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-violet-500" />
              <p className="text-sm font-bold text-zinc-800">자동 색상 태그</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {colorTags.map((item) => (
                <div 
                  key={item.tag} 
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg ${item.color} bg-opacity-20 border border-current border-opacity-10`}
                >
                  <span className={`text-[11px] font-bold ${item.textColor}`}>{item.tag}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-zinc-400 text-center">
              내용에 해시태그를 포함하면 색상이 자동으로 적용됩니다!
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-3 text-[11px] leading-relaxed text-blue-700">
          하루가 끝나면 <b>오늘의 요약</b>에서 기록을 저장하세요. 저장된 날은 <b>기록 보관소</b> 달력에서 다시 볼 수 있습니다.
        </div>

        <DialogClose render={<Button className="w-full bg-blue-500 hover:bg-blue-600" />}>
          시작하기
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
