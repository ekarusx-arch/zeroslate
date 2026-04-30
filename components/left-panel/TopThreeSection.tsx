"use client";

import { useState, KeyboardEvent, useRef } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { TopThreeItem as TopThreeItemType } from "@/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, AlertTriangle, Plus, Target, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PRESET_COLORS } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";


// ── 개별 Top Three 드래그 아이템 ───────────────────────────
function DraggableTopItem({ item }: { item: TopThreeItemType }) {
  const deleteTopThreeItem = useTimeboxerStore((s) => s.deleteTopThreeItem);
  const toggleTopThreeItem = useTimeboxerStore((s) => s.toggleTopThreeItem);
  const updateTopThreeItem = useTimeboxerStore((s) => s.updateTopThreeItem);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.content);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
      data: {
        type: "top-three",
        item,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const handleEditCommit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.content) {
      updateTopThreeItem(item.id, { content: trimmed });
    } else {
      setEditValue(item.content);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleEditCommit();
    if (e.key === "Escape") {
      setEditValue(item.content);
      setIsEditing(false);
    }
  };

  const handleColorCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const settings = useTimeboxerStore.getState().settings;
    const allTags = [...PRESET_COLORS, ...(settings.customTags || []).map(ct => ({ label: ct.tag, value: ct.color, tag: ct.tag }))];
    
    const currentIndex = allTags.findIndex(p => p.value === (item.color || "#F4F4F5"));
    const nextIndex = (currentIndex + 1) % allTags.length;
    updateTopThreeItem(item.id, { color: allTags[nextIndex].value });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white transition-all duration-150 ${
        item.isCompleted
          ? "border-zinc-100 opacity-60"
          : "border-zinc-200 hover:border-violet-300 hover:shadow-sm"
      }`}
    >
      {/* 드래그 핸들 */}
      <button
        {...listeners}
        {...attributes}
        className="text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing shrink-0"
        aria-label="Top 3 항목 드래그"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* 컨텍스트 컬러 도트 */}
      <button
        onClick={handleColorCycle}
        className="shrink-0 w-3 h-3 rounded-full border shadow-sm transition-all cursor-pointer hover:ring-2 hover:ring-zinc-200 active:scale-90"
        style={{
          backgroundColor: item.color || "#f4f4f5",
          borderColor: item.color ? "transparent" : "#e4e4e7",
        }}
        aria-label="컨텍스트 색상 변경"
        title={`클릭하여 카테고리 변경: ${[...PRESET_COLORS, ...(useTimeboxerStore.getState().settings.customTags || []).map(ct => ({ label: ct.tag, value: ct.color }))].find(p => p.value === (item.color || "#F4F4F5"))?.label || "기본"}`}
      />

      {/* 완료 체크박스 */}
      <Checkbox
        id={`top-${item.id}`}
        checked={item.isCompleted}
        onCheckedChange={() => toggleTopThreeItem(item.id)}
        className="shrink-0 border-zinc-300 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
        aria-label={`${item.content} 완료 토글`}
      />

      {/* 내용 (더블클릭 편집) */}
      {isEditing ? (
        <input
          ref={inputRef}
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEditCommit}
          onKeyDown={handleEditKeyDown}
          maxLength={60}
          className="flex-1 text-sm text-zinc-700 bg-transparent border-b border-violet-300 outline-none leading-snug"
        />
      ) : (
        <span
          className={`flex-1 text-sm text-zinc-700 leading-snug cursor-text ${
            item.isCompleted ? "line-through text-zinc-400" : ""
          }`}
          onDoubleClick={() => {
            setEditValue(item.content);
            setIsEditing(true);
          }}
          title="더블클릭해서 편집"
        >
          {item.content}
        </span>
      )}

      {/* 미배정 경고 */}
      {!item.isAssigned && !item.isCompleted && (
        <Tooltip>
          <TooltipTrigger className="badge-warn" aria-label="타임라인 미배정">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </TooltipTrigger>
          <TooltipContent>타임라인에 아직 배치되지 않았어요!</TooltipContent>
        </Tooltip>
      )}

      {/* 배정 완료 표시 */}
      {item.isAssigned && !item.isCompleted && (
        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
      )}

      {/* 완료 뱃지 */}
      {item.isCompleted && (
        <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
      )}

      {/* 삭제 버튼 */}
      <button
        onClick={() => deleteTopThreeItem(item.id)}
        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 text-zinc-400 hover:text-red-400 transition-all duration-150"
        aria-label="Top 3 항목 삭제"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Top Three 섹션 전체
// ─────────────────────────────────────────────────────────────────────
export default function TopThreeSection() {
  const [inputValue, setInputValue] = useState("");
  const topThree = useTimeboxerStore((s) => s.topThree);
  const addTopThreeItem = useTimeboxerStore((s) => s.addTopThreeItem);

  const unassigned = topThree.filter((t) => !t.isAssigned && !t.isCompleted).length;
  const canAdd = topThree.length < 3;

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !canAdd) return;
    addTopThreeItem(trimmed);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="space-y-3">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
            <Target className="w-4 h-4 text-violet-600" />
          </div>
          <h2 className="font-semibold text-sm text-zinc-800">Top 3 Focus</h2>
          <span className="text-xs text-zinc-500">{topThree.length}/3</span>
        </div>
        {unassigned > 0 && (
          <Badge variant="outline" className="border-amber-300 text-amber-600 bg-amber-50 text-xs gap-1">
            <AlertTriangle className="w-3 h-3" />
            {unassigned}개 미배정
          </Badge>
        )}
      </div>

      {/* 아이템 리스트 */}
      <div className="space-y-2 min-h-[56px]">
        {topThree.length === 0 && (
          <p className="text-xs text-zinc-500 italic text-center py-4">
            오늘 가장 중요한 3가지를 입력하세요 ✨
          </p>
        )}
        {topThree.map((item) => (
          <DraggableTopItem key={item.id} item={item} />
        ))}
      </div>

      {/* 입력창 */}
      {canAdd && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${topThree.length + 1}번째 핵심 과업 입력...`}
            className="input-clean h-9 text-sm border border-zinc-200 rounded-lg px-3"
            maxLength={60}
          />
          <Button
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            size="sm"
            className="h-9 w-9 p-0 bg-violet-500 hover:bg-violet-600 shrink-0"
            aria-label="Top 3 항목 추가"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {!canAdd && (
        <p className="text-xs text-center text-zinc-500">
          최대 3개까지 입력 가능해요. 완료하면 삭제 후 추가하세요.
        </p>
      )}
    </div>
  );
}
