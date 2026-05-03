"use client";

import { useState, KeyboardEvent, useRef } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { BrainDumpItem as BrainDumpItemType } from "@/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Plus,
  Zap,
  CheckCircle2,
  RotateCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PRESET_COLORS } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


// ── 개별 Brain Dump 드래그 아이템 ───────────────────────────
function DraggableBrainItem({ item }: { item: BrainDumpItemType }) {
  const toggleBrainDumpItem = useTimeboxerStore((s) => s.toggleBrainDumpItem);
  const deleteBrainDumpItem = useTimeboxerStore((s) => s.deleteBrainDumpItem);
  const updateBrainDumpItem = useTimeboxerStore((s) => s.updateBrainDumpItem);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.content);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
      data: {
        type: "brain-dump",
        item,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
  };

  const handleEditCommit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.content) {
      updateBrainDumpItem(item.id, { content: trimmed });
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
    
    const currentTagIndex = allTags.findIndex(p => p.tag && item.content.includes(p.tag));
    const currentColorIndex = allTags.findIndex(p => p.value.toLowerCase() === (item.color || "#F4F4F5").toLowerCase());
    const currentIndex = currentTagIndex >= 0 ? currentTagIndex : currentColorIndex;
    const nextIndex = (currentIndex + 1) % allTags.length;
    updateBrainDumpItem(item.id, { color: allTags[nextIndex].value });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white transition-all duration-150 ${
        item.isCompleted
          ? "border-zinc-100 opacity-60"
          : "border-zinc-200 hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      {/* 드래그 핸들 */}
      <button
        {...listeners}
        {...attributes}
        className="text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing shrink-0"
        aria-label="드래그"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* 컨텍스트 컬러 도트 */}
      <button
        onClick={handleColorCycle}
        className="shrink-0 w-3 h-3 rounded-full border shadow-sm transition-all cursor-pointer hover:ring-2 hover:ring-blue-200 active:scale-90"
        style={{
          backgroundColor: item.color || "#f4f4f5",
          borderColor: item.color ? "transparent" : "#e4e4e7",
        }}
        aria-label="컨텍스트 색상 변경"
        title={`클릭하여 카테고리 변경: ${[...PRESET_COLORS, ...(useTimeboxerStore.getState().settings.customTags || []).map(ct => ({ label: ct.tag, value: ct.color }))].find(p => p.value === (item.color || "#F4F4F5"))?.label || "기본"}`}
      />

      {/* 체크박스 */}
      <Checkbox
        id={`brain-${item.id}`}
        checked={item.isCompleted}
        onCheckedChange={() => toggleBrainDumpItem(item.id)}
        className="shrink-0 border-zinc-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
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
          maxLength={100}
          className="flex-1 text-sm bg-transparent border-b border-blue-300 outline-none leading-snug text-zinc-700"
        />
      ) : (
        <span
          className={`flex-1 text-sm leading-snug cursor-text ${
            item.isCompleted ? "line-through text-zinc-400" : "text-zinc-700"
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

      {/* 삭제 버튼 */}
      <button
        onClick={() => deleteBrainDumpItem(item.id)}
        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 text-zinc-400 hover:text-red-400 transition-all duration-150 shrink-0"
        aria-label="브레인 덤프 항목 삭제"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Brain Dump 섹션 전체
// ─────────────────────────────────────────────────────────────────────
export default function BrainDumpSection() {
  const [inputValue, setInputValue] = useState("");
  const brainDump = useTimeboxerStore((s) => s.brainDump);
  const addBrainDumpItem = useTimeboxerStore((s) => s.addBrainDumpItem);
  const userPlan = useTimeboxerStore((s) => s.userPlan);
  const openUpgradeModal = useTimeboxerStore((s) => s.openUpgradeModal);
  const carryOverToTomorrow = useTimeboxerStore((s) => s.carryOverToTomorrow);

  const completedCount = brainDump.filter((i) => i.isCompleted).length;
  const pendingItems = brainDump.filter((i) => !i.isCompleted);
  const completedItems = brainDump.filter((i) => i.isCompleted);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    addBrainDumpItem(trimmed);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleAdd();
    }
  };

  return (
    <div className="space-y-3 flex flex-col flex-1 min-h-0">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="font-semibold text-sm text-zinc-800">Brain Dump</h2>
          <span className="text-xs text-zinc-500">{brainDump.length}개</span>
        </div>
        {completedCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedCount}개 완료
          </span>
        )}
      </div>

      {/* 입력창 */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="머릿속 생각을 자유롭게 쏟아내세요..."
          className="input-clean h-9 text-sm border border-zinc-200 rounded-lg px-3"
          maxLength={100}
        />
        <Button
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          size="sm"
          className="h-9 w-9 p-0 bg-blue-500 hover:bg-blue-600 shrink-0"
          aria-label="브레인 덤프 항목 추가"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* 내일로 넘기기 버튼 (AlertDialog 사용으로 안정성 강화) */}
      {pendingItems.length > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-bold hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm"
            >
              <RotateCw className="w-3 h-3" />
              미완료 일과 내일로 넘기기
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>내일로 넘기기</AlertDialogTitle>
              <AlertDialogDescription>
                완료하지 못한 {pendingItems.length}개의 항목을 내일 브레인 덤프로 이동할까요?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (userPlan !== 'pro') {
                  openUpgradeModal("미완료 일과 내일로 넘기기");
                  return;
                }
                carryOverToTomorrow();
              }}>
                이동하기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* 아이템 리스트 */}
      <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5">
        {brainDump.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🧠</p>
            <p className="text-xs text-zinc-500">
              지금 머릿속에 있는 모든 것을 적어보세요
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              완료 후 타임라인으로 드래그하세요
            </p>
          </div>
        )}

        {/* 미완료 아이템 */}
        {pendingItems.map((item) => (
          <DraggableBrainItem key={item.id} item={item} />
        ))}

        {/* 완료 아이템 구분선 */}
        {completedItems.length > 0 && pendingItems.length > 0 && (
          <div className="flex items-center gap-2 py-1">
            <div className="h-px flex-1 bg-zinc-100" />
            <span className="text-xs text-zinc-500">완료됨</span>
            <div className="h-px flex-1 bg-zinc-100" />
          </div>
        )}

        {/* 완료 아이템 */}
        {completedItems.map((item) => (
          <DraggableBrainItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
