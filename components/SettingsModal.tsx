"use client";

import { useState } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";

const START_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 0); // 0~12시
const END_OPTIONS = Array.from({ length: 9 }, (_, i) => i + 16);  // 16~24시
const STEP_OPTIONS = [15, 30, 60];

export default function SettingsModal() {
  const settings = useTimeboxerStore((s) => s.settings);
  const updateSettings = useTimeboxerStore((s) => s.updateSettings);
  const [open, setOpen] = useState(false);

  const [localStart, setLocalStart] = useState(settings.startTime);
  const [localEnd, setLocalEnd] = useState(settings.endTime);
  const [localStep, setLocalStep] = useState(settings.step);

  const handleOpen = (v: boolean) => {
    if (v) {
      setLocalStart(settings.startTime);
      setLocalEnd(settings.endTime);
      setLocalStep(settings.step);
    }
    setOpen(v);
  };

  const handleSave = () => {
    if (localStart >= localEnd) return;
    updateSettings({ startTime: localStart, endTime: localEnd, step: localStep });
    setOpen(false);
  };

  const isValid = localStart < localEnd;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger
        className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-zinc-200 bg-white text-xs text-zinc-600 hover:bg-zinc-50 font-medium transition-colors"
        aria-label="설정 열기"
      >
        <Settings2 className="w-3.5 h-3.5" />
        설정
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Settings2 className="w-4 h-4 text-zinc-500" />
            타임라인 설정
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 시작 시간 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              타임라인 시작 시각
            </label>
            <div className="flex flex-wrap gap-2">
              {START_OPTIONS.map((h) => (
                <button
                  key={h}
                  onClick={() => setLocalStart(h)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    localStart === h
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-blue-300"
                  }`}
                >
                  {String(h).padStart(2, "0")}:00
                </button>
              ))}
            </div>
          </div>

          {/* 종료 시간 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              타임라인 종료 시각
            </label>
            <div className="flex flex-wrap gap-2">
              {END_OPTIONS.map((h) => (
                <button
                  key={h}
                  onClick={() => setLocalEnd(h)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    localEnd === h
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-blue-300"
                  }`}
                >
                  {String(h).padStart(2, "0")}:00
                </button>
              ))}
            </div>
          </div>

          {/* 슬롯 단위 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              시간 슬롯 단위
            </label>
            <div className="flex gap-2">
              {STEP_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setLocalStep(s)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    localStep === s
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-blue-300"
                  }`}
                >
                  {s}분
                </button>
              ))}
            </div>
          </div>

          {/* 유효성 경고 */}
          {!isValid && (
            <p className="text-xs text-red-500 text-center">
              종료 시각이 시작 시각보다 늦어야 해요.
            </p>
          )}

          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40"
          >
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
