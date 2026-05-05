"use client";

import { Button } from "@/components/ui/button";

const START_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 0); // 0~12시
const END_OPTIONS = Array.from({ length: 9 }, (_, i) => i + 16);  // 16~24시
const STEP_OPTIONS = [5, 15, 30, 60];

interface TimelineTabProps {
  localStart: number;
  localEnd: number;
  localStep: number;
  setLocalStart: (v: number) => void;
  setLocalEnd: (v: number) => void;
  setLocalStep: (v: number) => void;
  handleSaveSettings: () => void;
}

export default function TimelineTab({
  localStart,
  localEnd,
  localStep,
  setLocalStart,
  setLocalEnd,
  setLocalStep,
  handleSaveSettings,
}: TimelineTabProps) {
  const isValid = localStart < localEnd;

  return (
    <div className="space-y-5">
      {/* 시작 시간 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">타임라인 시작 시각</label>
        <div className="flex flex-wrap gap-2.5">
          {START_OPTIONS.map((h) => (
            <button
              key={h}
              onClick={() => setLocalStart(h)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
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
        <label className="text-sm font-medium text-zinc-700">타임라인 종료 시각</label>
        <div className="flex flex-wrap gap-2.5">
          {END_OPTIONS.map((h) => (
            <button
              key={h}
              onClick={() => setLocalEnd(h)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
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
        <label className="text-sm font-medium text-zinc-700">시간 슬롯 단위</label>
        <div className="flex gap-3">
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

      {!isValid && (
        <p className="text-xs text-red-500 text-center">종료 시각이 시작 시각보다 늦어야 해요.</p>
      )}

      <Button
        onClick={handleSaveSettings}
        disabled={!isValid}
        className="w-full bg-zinc-900 hover:bg-zinc-800 h-11 rounded-xl font-bold mt-10"
      >
        변경사항 적용
      </Button>
    </div>
  );
}
