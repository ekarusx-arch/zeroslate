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
import { HelpCircle, ListChecks, MousePointer2, Trophy } from "lucide-react";

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

        <div className="space-y-3">
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

        <div className="rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-700">
          하루가 끝나면 오늘의 요약에서 기록을 저장하세요. 저장된 날은 기록
          보관소 달력에서 다시 볼 수 있습니다.
        </div>

        <DialogClose render={<Button className="w-full bg-blue-500 hover:bg-blue-600" />}>
          시작하기
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
