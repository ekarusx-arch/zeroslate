"use client";

import { useState } from "react";
import { Plus, Trash2, Repeat, Clock, Edit2, Check, X, Palette } from "lucide-react";
import { PRESET_COLORS, Routine } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RoutinesTabProps {
  routines: Routine[];
  addRoutine: (r: Omit<Routine, "id" | "isActive">) => void;
  deleteRoutine: (id: string) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
}

export default function RoutinesTab({
  routines,
  addRoutine,
  deleteRoutine,
  updateRoutine,
}: RoutinesTabProps) {
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
  const [editColor, setEditColor] = useState("");

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

  return (
    <div className="space-y-6">
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
    </div>
  );
}
