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

import { Plus, Trash2, Repeat, Clock, Edit2, Check, X, Tag, Palette, Lock, Sparkles } from "lucide-react";
import { PRESET_COLORS, Routine, ThemeId } from "@/types";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const START_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 0); // 0~12시
const END_OPTIONS = Array.from({ length: 9 }, (_, i) => i + 16);  // 16~24시
const STEP_OPTIONS = [5, 15, 30, 60];
const THEME_OPTIONS: Array<{
  id: ThemeId;
  label: string;
  description: string;
  emoji: string;
  isPro: boolean;
  swatches: string[];
  gradient: string;
}> = [
  {
    id: "classic",
    label: "Classic",
    description: "기본 작업 화면",
    emoji: "☀️",
    isPro: false,
    swatches: ["#F0F2F7", "#FFFFFF", "#2563EB"],
    gradient: "linear-gradient(135deg, #F0F2F7 0%, #E8ECF4 50%, #dde3ef 100%)",
  },
  {
    id: "glass",
    label: "Glass",
    description: "맑고 가벼운 유리 표면",
    emoji: "🔮",
    isPro: true,
    swatches: ["#EEF5F8", "#FFFFFFAA", "#0EA5E9"],
    gradient: "linear-gradient(135deg, #daeeff 0%, #eef5fb 50%, #f0f8ff 100%)",
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "밤 작업용 다크 스킨",
    emoji: "🌙",
    isPro: true,
    swatches: ["#0C0F14", "#111827", "#60A5FA"],
    gradient: "linear-gradient(135deg, #0c0f14 0%, #111827 50%, #1a2540 100%)",
  },
  {
    id: "paper",
    label: "Paper",
    description: "차분한 노트 질감",
    emoji: "📄",
    isPro: true,
    swatches: ["#F8F6F1", "#FFFDF8", "#B45309"],
    gradient: "linear-gradient(135deg, #f8f4eb 0%, #fffdf8 50%, #fdf6e3 100%)",
  },
  {
    id: "forest",
    label: "Forest",
    description: "눈이 편한 녹색 톤",
    emoji: "🌿",
    isPro: true,
    swatches: ["#F2F7F3", "#FBFDF9", "#15803D"],
    gradient: "linear-gradient(135deg, #e8f4eb 0%, #f2f7f3 50%, #eaf2ec 100%)",
  },
];
const ACCENT_PRESETS = ["#2563EB", "#0EA5E9", "#8B5CF6", "#F97316", "#15803D", "#DC2626"];

export default function SettingsModal() {
  const settings = useTimeboxerStore((s) => s.settings);
  const updateSettings = useTimeboxerStore((s) => s.updateSettings);
  const userPlan = useTimeboxerStore((s) => s.userPlan);
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
  
  // 새 커스텀 태그 상태
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[1].value);
  const [themeNotice, setThemeNotice] = useState<string | null>(null);

  // 루틴 수정 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleOpen = (v: boolean) => {
    if (v) {
      setLocalStart(settings.startTime);
      setLocalEnd(settings.endTime);
      setLocalStep(settings.step);
      setNewTagName("");
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

  const handleAddCustomTag = () => {
    if (userPlan !== "pro") {
      setThemeNotice("스마트 태그 추가와 커스텀 색상은 Pro 플랜에서 사용할 수 있습니다.");
      return;
    }

    if (!newTagName.trim()) return;
    const tag = newTagName.startsWith("#") ? newTagName.trim() : `#${newTagName.trim()}`;
    if (settings.customTags?.some(t => t.tag === tag)) return;

    setThemeNotice(null);
    updateSettings({
      customTags: [...(settings.customTags || []), { tag, color: newTagColor }]
    });
    setNewTagName("");
  };

  const handleDeleteCustomTag = (tag: string) => {
    updateSettings({
      customTags: (settings.customTags || []).filter(t => t.tag !== tag)
    });
  };

  const handleSelectTheme = (theme: ThemeId, isPro: boolean) => {
    if (isPro && userPlan !== "pro") {
      setThemeNotice("Premium 테마는 Pro 플랜에서 사용할 수 있습니다.");
      return;
    }

    setThemeNotice(null);
    updateSettings({ theme });
  };

  const handleSelectAccent = (color: string) => {
    if (userPlan !== "pro") {
      setThemeNotice("커스텀 포인트 컬러는 Pro 플랜에서 사용할 수 있습니다.");
      return;
    }

    setThemeNotice(null);
    updateSettings({ customAccent: color });
  };

  const handleStartEdit = (r: Routine) => {
    setEditingId(r.id);
    setEditContent(r.content);
    setEditStart(r.startTime);
    setEditEnd(r.endTime);
    setEditColor(r.color || PRESET_COLORS[0].value);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateRoutine(editingId, {
      content: editContent,
      startTime: editStart,
      endTime: editEnd,
      color: editColor,
    });
    setEditingId(null);
  };

  const isValid = localStart < localEnd;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger
        className="inline-flex items-center gap-1.5 h-[33px] px-[14px] rounded-lg border border-zinc-200 bg-white text-xs text-zinc-600 hover:bg-zinc-50 font-semibold transition-all active:scale-95 shadow-sm shrink-0 whitespace-nowrap"
        aria-label="설정 열기"
      >
        <Settings2 className="w-3.5 h-3.5" />
        설정
      </DialogTrigger>

      <DialogContent className="max-w-lg h-[680px] flex flex-col p-0 overflow-hidden bg-white border-none shadow-2xl">
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
                <Settings2 className="w-3.5 h-3.5 mr-1" /> 타임라인
              </TabsTrigger>
              <TabsTrigger value="routines" className="flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                <Repeat className="w-3.5 h-3.5 mr-1" /> 루틴
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                <Tag className="w-3.5 h-3.5 mr-1" /> 스마트 태그
              </TabsTrigger>
              <TabsTrigger value="theme" className="flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> 테마
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-4">
            <TabsContent value="timeline" className="mt-0 space-y-6">
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
                  <div className="flex flex-wrap items-center gap-2">
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
                    {/* 커스텀 컬러 피커 */}
                    <div className="relative flex items-center">
                      <input
                        type="color"
                        id="customRoutineColor"
                        value={newRoutineColor}
                        onChange={(e) => setNewRoutineColor(e.target.value)}
                        className="sr-only"
                      />
                      <label
                        htmlFor="customRoutineColor"
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all hover:bg-zinc-100 ${
                          !PRESET_COLORS.some(c => c.value === newRoutineColor) ? "border-blue-500 bg-blue-50 shadow-sm" : "border-zinc-200 bg-white"
                        }`}
                        title="직접 색상 선택"
                      >
                        <Palette className="w-4 h-4" style={{ color: newRoutineColor }} />
                      </label>
                      {!PRESET_COLORS.some(c => c.value === newRoutineColor) && (
                        <span className="ml-2 text-[10px] font-mono font-bold text-blue-600 uppercase">
                          {newRoutineColor}
                        </span>
                      )}
                    </div>
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
                            {/* 수정 시 색상 선택 */}
                            <div className="flex flex-wrap items-center gap-2 py-1">
                              {PRESET_COLORS.map((c) => (
                                <button
                                  key={c.value}
                                  onClick={() => setEditColor(c.value)}
                                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                                    editColor === c.value ? "scale-110 border-zinc-400" : "border-transparent"
                                  }`}
                                  style={{ backgroundColor: c.value }}
                                />
                              ))}
                              <div className="relative flex items-center">
                                <input
                                  type="color"
                                  id={`editRoutineColor-${r.id}`}
                                  value={editColor}
                                  onChange={(e) => setEditColor(e.target.value)}
                                  className="sr-only"
                                />
                                <label
                                  htmlFor={`editRoutineColor-${r.id}`}
                                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all hover:bg-zinc-100 ${
                                    !PRESET_COLORS.some(c => c.value === editColor) ? "border-blue-500 bg-blue-50" : "border-zinc-200 bg-white"
                                  }`}
                                >
                                  <Palette className="w-3 h-3" style={{ color: editColor }} />
                                </label>
                              </div>
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

            <TabsContent value="tags" className="mt-0 space-y-6">
              {/* 커스텀 태그 추가 폼 */}
              <div className={`relative overflow-hidden rounded-xl border p-4 space-y-4 ${
                userPlan === "pro" ? "border-zinc-100 bg-zinc-50" : "border-amber-200 bg-amber-50/40"
              }`}>
                {userPlan !== "pro" && (
                  <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-amber-800">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-xs font-black">스마트 태그 커스터마이징은 Pro 기능입니다.</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-amber-700/80">기본 태그 색상은 계속 사용할 수 있어요.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight">새 스마트 태그</span>
                  </div>
                  {userPlan !== "pro" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-black text-white">
                      <Lock className="h-3 w-3" />
                      PRO
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="예: #공부, #미팅"
                    className="h-10 text-sm bg-white flex-1"
                    readOnly={userPlan !== "pro"}
                    onFocus={() => {
                      if (userPlan !== "pro") {
                        setThemeNotice("스마트 태그 추가와 커스텀 색상은 Pro 플랜에서 사용할 수 있습니다.");
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddCustomTag}
                    disabled={userPlan === "pro" && !newTagName.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 rounded-lg text-sm font-bold shrink-0"
                  >
                    {userPlan === "pro" ? "추가" : <Lock className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">태그 색상</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.filter(c => c.tag !== "").map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          if (userPlan !== "pro") {
                            setThemeNotice("태그 색상 커스터마이징은 Pro 플랜에서 사용할 수 있습니다.");
                            return;
                          }
                          setThemeNotice(null);
                          setNewTagColor(c.value);
                        }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          newTagColor === c.value ? "scale-110 border-zinc-400" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                    {/* 커스텀 컬러 피커 */}
                    <div className="relative flex items-center">
                      <input
                        type="color"
                        id="customTagColor"
                        value={newTagColor}
                        onChange={(e) => {
                          if (userPlan !== "pro") {
                            setThemeNotice("태그 색상 커스터마이징은 Pro 플랜에서 사용할 수 있습니다.");
                            return;
                          }
                          setThemeNotice(null);
                          setNewTagColor(e.target.value);
                        }}
                        className="sr-only"
                      />
                      <label
                        htmlFor="customTagColor"
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all hover:bg-zinc-100 ${
                          !PRESET_COLORS.some(c => c.value === newTagColor) ? "border-blue-500 bg-blue-50 shadow-sm" : "border-zinc-200 bg-white"
                        }`}
                        title="직접 색상 선택"
                      >
                        <Palette className="w-4 h-4" style={{ color: newTagColor }} />
                      </label>
                      {!PRESET_COLORS.some(c => c.value === newTagColor) && (
                        <span className="ml-2 text-[10px] font-mono font-bold text-blue-600 uppercase">
                          {newTagColor}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 커스텀 태그 목록 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight">나의 스마트 태그 ({(settings.customTags || []).length})</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* 기본 태그들 안내 (읽기 전용) */}
                  {PRESET_COLORS.filter(c => c.tag !== "").map((p) => (
                    <div key={p.tag} className="flex items-center justify-between p-2.5 bg-white border border-zinc-100 rounded-lg opacity-60 grayscale-[0.5]">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.value }} />
                        <span className="text-xs font-medium text-zinc-600 truncate">{p.tag}</span>
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">기본</span>
                    </div>
                  ))}

                  {/* 사용자 커스텀 태그들 */}
                  {(settings.customTags || []).map((t) => (
                    <div key={t.tag} className="flex items-center justify-between p-2.5 bg-white border border-blue-100 rounded-lg shadow-sm group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                        <span className="text-xs font-bold text-blue-600 truncate">{t.tag}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCustomTag(t.tag)}
                        className="p-1 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {(!settings.customTags || settings.customTags.length === 0) && (
                  <p className="text-[11px] text-zinc-400 text-center py-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                    {userPlan === "pro"
                      ? "직접 태그를 추가해 보세요! 해당 단어가 포함되면 자동 색상이 적용됩니다."
                      : "Pro에서 직접 태그와 색상을 추가하면 단어에 맞춰 자동 색상이 적용됩니다."}
                  </p>
                )}
              </div>

              {themeNotice && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  {themeNotice}
                </div>
              )}
            </TabsContent>

            <TabsContent value="theme" className="mt-0 space-y-5">
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-800">작업 화면 테마</p>
                <p className="text-xs text-zinc-500">앱 전체 표면과 패널 분위기를 바꿉니다.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEME_OPTIONS.map((theme) => {
                  const isActive = (settings.theme || "classic") === theme.id;
                  const isLocked = theme.isPro && userPlan !== "pro";
                  const isDark = theme.id === "midnight";

                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme.id, theme.isPro)}
                      className={`relative overflow-hidden rounded-2xl border p-3 text-left transition-all group ${
                        isActive
                          ? isDark
                            ? "border-blue-500/50 bg-zinc-900 shadow-lg shadow-blue-900/20"
                            : "border-blue-400 bg-blue-50/70 shadow-sm"
                          : isLocked
                            ? "border-zinc-100 bg-zinc-50/70 opacity-80 hover:opacity-100"
                            : "border-zinc-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                      }`}
                    >
                      {/* 테마 프리뷰 */}
                      <div
                        className="relative mb-3 h-20 rounded-xl overflow-hidden"
                        style={{ background: theme.gradient }}
                      >
                        {/* 다크 테마 스타 효과 */}
                        {isDark && (
                          <>
                            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(96,165,250,0.15) 0%, transparent 60%)" }} />
                            <div className="absolute top-2 right-3 w-1 h-1 rounded-full bg-blue-400/60" />
                            <div className="absolute top-4 right-7 w-0.5 h-0.5 rounded-full bg-blue-300/40" />
                            <div className="absolute top-3 right-10 w-1 h-1 rounded-full bg-violet-400/40" />
                          </>
                        )}
                        {/* 미니 패널 실루엣 */}
                        <div className="absolute inset-2 rounded-lg flex gap-1">
                          <div className="w-8 rounded-md" style={{ background: isDark ? "rgba(17,24,39,0.9)" : "rgba(255,255,255,0.7)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }} />
                          <div className="flex-1 rounded-md" style={{ background: isDark ? "rgba(17,24,39,0.7)" : "rgba(255,255,255,0.5)", border: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}>
                            <div className="m-1.5 h-1.5 rounded-full" style={{ background: theme.swatches[2], opacity: 0.8, width: "40%" }} />
                            <div className="mx-1.5 mt-1 h-1 rounded-full bg-current opacity-10" style={{ width: "60%" }} />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 flex gap-1">
                          {theme.swatches.map((color) => (
                            <span
                              key={color}
                              className="h-5 w-5 rounded-full border-[2px] border-white shadow-md"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-[10px] font-black text-white shadow-lg">
                              <Lock className="h-3 w-3" />
                              PRO 전용
                            </span>
                          </div>
                        )}
                        {isActive && (
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-md">
                              <Check className="h-3 w-3" />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 테마 정보 */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{theme.emoji}</span>
                          <div>
                            <p className={`text-sm font-bold ${isActive && isDark ? "text-white" : "text-zinc-800"}`}>{theme.label}</p>
                            <p className={`text-[11px] font-medium ${isActive && isDark ? "text-zinc-400" : "text-zinc-500"}`}>{theme.description}</p>
                          </div>
                        </div>
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-[10px] font-black text-white shadow-sm">
                            <Lock className="h-2.5 w-2.5" />
                            PRO
                          </span>
                        ) : isActive ? (
                          <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${
                            isDark ? "bg-blue-500" : "bg-blue-500"
                          }`}>
                            <Check className="h-3 w-3 text-white" />
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 배경 분위기 선택 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-800">배경 분위기</p>
                    <p className="mt-0.5 text-xs text-zinc-500">테마 위에 미묘한 색감 글로우를 입힙니다.</p>
                  </div>
                  {userPlan !== "pro" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-[10px] font-black text-white shadow-sm">
                      <Lock className="h-2.5 w-2.5" />
                      PRO
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "none", label: "없음", emoji: "⬜", gradient: "bg-zinc-100", desc: "기본" },
                    { id: "sunset", label: "선셋", emoji: "🌅", gradient: "bg-gradient-to-br from-orange-100 to-pink-100", desc: "따뜻한 노을" },
                    { id: "ocean", label: "오션", emoji: "🌊", gradient: "bg-gradient-to-br from-sky-100 to-cyan-100", desc: "쌩글한 바다" },
                    { id: "aurora", label: "오로라", emoji: "🌌", gradient: "bg-gradient-to-br from-violet-100 to-teal-100", desc: "영롱한 밤" },
                    { id: "rose", label: "로즈", emoji: "🌹", gradient: "bg-gradient-to-br from-rose-100 to-pink-100", desc: "케어프리한 색" },
                    { id: "forest", label: "포레스트", emoji: "🌿", gradient: "bg-gradient-to-br from-green-100 to-lime-100", desc: "신선한 자연" },
                  ].map((mood) => {
                    const isMoodActive = (settings.bgMood || "none") === mood.id;
                    const isLocked = userPlan !== "pro" && mood.id !== "none";
                    return (
                      <button
                        key={mood.id}
                        onClick={() => {
                          if (isLocked) return;
                          updateSettings({ bgMood: mood.id });
                        }}
                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          isMoodActive
                            ? "border-blue-400 bg-blue-50 shadow-sm"
                            : isLocked
                              ? "border-zinc-100 opacity-60 cursor-not-allowed"
                              : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        <div className={`w-full h-10 rounded-lg ${mood.gradient} flex items-center justify-center relative overflow-hidden`}>
                          <span className="text-xl">{mood.emoji}</span>
                          {isLocked && (
                            <div className="absolute top-1 right-1">
                              <Lock className="h-2.5 w-2.5 text-zinc-400" />
                            </div>
                          )}
                          {isMoodActive && (
                            <div className="absolute top-1 right-1">
                              <Check className="h-3 w-3 text-blue-500" />
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-zinc-700">{mood.label}</p>
                        <p className="text-[9px] text-zinc-400 font-medium">{mood.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>


              {themeNotice && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  {themeNotice}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
