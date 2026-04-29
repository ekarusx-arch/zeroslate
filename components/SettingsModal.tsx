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

import { Plus, Trash2, Repeat, Clock, Edit2, Check, X } from "lucide-react";
import { PRESET_COLORS, Routine } from "@/types";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const START_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 0); // 0~12시
const END_OPTIONS = Array.from({ length: 9 }, (_, i) => i + 16);  // 16~24시
const STEP_OPTIONS = [15, 30, 60];

export default function SettingsModal() {
  const settings = useTimeboxerStore((s) => s.settings);
  const updateSettings = useTimeboxerStore((s) => s.updateSettings);
  const routines = useTimeboxerStore((s) => s.routines);
  const addRoutine = useTimeboxerStore((s) => s.addRoutine);
  const deleteRoutine = useTimeboxerStore((s) => s.deleteRoutine);
  const updateRoutine = useTimeboxerStore((s) => s.updateRoutine);

  const [open, setOpen] = useState(false);

  // 타임라인 설정 상태
  const [localStart, setLocalStart] = useState(settings.startTime);
  const [localEnd, setLocalEnd] = useState(settings.endTime);
  const [localStep, setLocalStep] = useState(settings.step);

  // 새 루틴 추가 상태
  const [newRoutineContent, setNewRoutineContent] = useState("");
  const [newRoutineStart, setNewRoutineStart] = useState("09:00");
  const [newRoutineEnd, setNewRoutineEnd] = useState("10:00");
  const [newRoutineColor, setNewRoutineColor] = useState(PRESET_COLORS[0].value);
  
  // 루틴 수정 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  const handleOpen = (v: boolean) => {
    if (v) {
      setLocalStart(settings.startTime);
      setLocalEnd(settings.endTime);
      setLocalStep(settings.step);
    }
    setOpen(v);
  };

  const handleSaveSettings = () => {
    if (localStart >= localEnd) return;
    updateSettings({ startTime: localStart, endTime: localEnd, step: localStep });
  };

  const handleAddRoutine = () => {
    if (!newRoutineContent.trim()) return;
    addRoutine({
      content: newRoutineContent,
      startTime: newRoutineStart,
      endTime: newRoutineEnd,
      color: newRoutineColor,
    });
    setNewRoutineContent("");
  };

  const handleStartEdit = (r: Routine) => {
    setEditingId(r.id);
    setEditContent(r.content);
    setEditStart(r.startTime);
    setEditEnd(r.endTime);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateRoutine(editingId, {
      content: editContent,
      startTime: editStart,
      endTime: editEnd,
    });
    setEditingId(null);
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

      <DialogContent className="max-w-md h-[650px] flex flex-col p-0 overflow-hidden bg-white border-none shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Settings2 className="w-4 h-4 text-zinc-500" />
            앱 설정
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="timeline" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 border-b border-zinc-100 bg-zinc-50/30">
            <TabsList className="w-full bg-zinc-200/50 p-1 rounded-xl h-11 mt-4 mb-3">
              <TabsTrigger value="timeline" className="flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                <Settings2 className="w-3.5 h-3.5 mr-2" /> 타임라인
              </TabsTrigger>
              <TabsTrigger value="routines" className="flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                <Repeat className="w-3.5 h-3.5 mr-2" /> 반복 루틴
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-4">
            <TabsContent value="timeline" className="mt-0 space-y-6">
              <div className="space-y-5">
                {/* 시작 시간 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">타임라인 시작 시각</label>
                  <div className="flex flex-wrap gap-1.5">
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
                  <div className="flex flex-wrap gap-1.5">
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

                {!isValid && (
                  <p className="text-xs text-red-500 text-center">종료 시각이 시작 시각보다 늦어야 해요.</p>
                )}

                <Button
                  onClick={handleSaveSettings}
                  disabled={!isValid}
                  className="w-full bg-zinc-900 hover:bg-zinc-800"
                >
                  변경사항 적용
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="routines" className="mt-0 space-y-6">
              {/* 루틴 추가 폼 */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Plus className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight">루틴 추가</span>
                </div>
                
                <Input
                  value={newRoutineContent}
                  onChange={(e) => setNewRoutineContent(e.target.value)}
                  placeholder="예: 아침 운동, 점심 시간..."
                  className="h-10 text-sm bg-white"
                />
                
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">시작</label>
                    <Input
                      type="time"
                      value={newRoutineStart}
                      onChange={(e) => setNewRoutineStart(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">종료</label>
                    <Input
                      type="time"
                      value={newRoutineEnd}
                      onChange={(e) => setNewRoutineEnd(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">색상</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setNewRoutineColor(c.value)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          newRoutineColor === c.value ? "scale-110 border-zinc-400" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleAddRoutine}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-lg text-sm font-semibold"
                >
                  루틴 추가하기
                </Button>
              </div>

              {/* 루틴 목록 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Repeat className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight">나의 루틴 목록 ({routines.length})</span>
                </div>
                
                {routines.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-zinc-100 rounded-xl">
                    <p className="text-xs text-zinc-400">매일 반복되는 일정을 등록해보세요!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {routines.map((r) => (
                      <div 
                        key={r.id} 
                        className="flex flex-col p-3 bg-white border border-zinc-100 rounded-xl hover:border-zinc-200 transition-colors gap-3"
                      >
                        {editingId === r.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="h-9 text-sm"
                            />
                            <div className="flex gap-2">
                              <Input
                                type="time"
                                value={editStart}
                                onChange={(e) => setEditStart(e.target.value)}
                                className="h-8 text-xs"
                              />
                              <Input
                                type="time"
                                value={editEnd}
                                onChange={(e) => setEditEnd(e.target.value)}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleSaveEdit} size="sm" className="flex-1 h-8 bg-zinc-900 text-xs">
                                <Check className="w-3 h-3 mr-1" /> 저장
                              </Button>
                              <Button onClick={() => setEditingId(null)} variant="ghost" size="sm" className="flex-1 h-8 text-xs">
                                <X className="w-3 h-3 mr-1" /> 취소
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: r.color }} />
                              <div>
                                <p className="text-sm font-semibold text-zinc-800">{r.content}</p>
                                <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {r.startTime} – {r.endTime}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateRoutine(r.id, { isActive: !r.isActive })}
                                className={`w-8 h-4 rounded-full relative transition-colors mr-1 ${r.isActive ? "bg-blue-500" : "bg-zinc-200"}`}
                              >
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${r.isActive ? "left-4.5" : "left-0.5"}`} />
                              </button>
                              <button
                                onClick={() => handleStartEdit(r)}
                                className="p-1.5 text-zinc-400 hover:text-blue-500 transition-colors"
                                title="수정"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteRoutine(r.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                                title="삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
