"use client";

import { useState, KeyboardEvent, useRef } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { TopThreeItem as TopThreeItemType } from "@/types";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, Target, Check, Calendar, Timer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";


// ── 개별 Top Three 드래그 아이템 ───────────────────────────
function DraggableTopItem({ item }: { item: TopThreeItemType }) {
  const toggleTopThreeItem = useTimeboxerStore((s) => s.toggleTopThreeItem);
  const updateTopThreeItem = useTimeboxerStore((s) => s.updateTopThreeItem);
  const setAssigningTask = useTimeboxerStore((s) => s.setAssigningTask);
  const assigningTask = useTimeboxerStore((s) => s.assigningTask);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.content);
  const inputRef = useRef<HTMLInputElement>(null);

  // 시간 입력 모달 상태
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

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
    const cycleTag = useTimeboxerStore.getState().cycleTag;
    const newContent = cycleTag(item.content);
    updateTopThreeItem(item.id, { content: newContent });
  };

  const handleManualAssign = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (assigningTask?.id === item.id) {
      setAssigningTask(null);
    } else {
      setAssigningTask({
        id: item.id,
        content: item.content,
        color: item.color,
        type: 'focus'
      });
    }
  };

  const handleTimeModalOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const settings = useTimeboxerStore.getState().settings;
    const timeBlocks = useTimeboxerStore.getState().timeBlocks;
    const selectedDate = useTimeboxerStore.getState().selectedDate;

    // 다음 빈 슬롯 계산 로직 (브레인 덤프와 동일)
    const timeToMin = (t: string) => { const [h,m] = t.split(":").map(Number); return h*60+m; };
    let currentMinutes = settings.startTime * 60;
    if (selectedDate === new Date().toISOString().split('T')[0]) {
      const now = new Date();
      currentMinutes = Math.max(currentMinutes, now.getHours() * 60 + now.getMinutes());
    }
    const remainder = currentMinutes % 30;
    let startMin = currentMinutes + (remainder === 0 ? 0 : 30 - remainder);
    const blocksOnDate = timeBlocks.filter(b => b.date === selectedDate);
    
    let foundStart = "";
    let foundEnd = "";

    while (startMin < settings.endTime * 60) {
      const endMin = startMin + 30;
      const isOverlapping = blocksOnDate.some(b => {
        const bStart = timeToMin(b.startTime);
        const bEnd = timeToMin(b.endTime);
        return (startMin < bEnd && endMin > bStart);
      });
      
      if (!isOverlapping) {
        foundStart = `${String(Math.floor(startMin/60)).padStart(2, "0")}:${String(startMin%60).padStart(2, "0")}`;
        foundEnd = `${String(Math.floor(endMin/60)).padStart(2, "0")}:${String(endMin%60).padStart(2, "0")}`;
        break;
      }
      startMin += 30;
    }

    setStartTime(foundStart || "09:00");
    setEndTime(foundEnd || "09:30");
    setIsTimeModalOpen(true);
  };

  const handleConfirmTime = () => {
    if (!startTime || !endTime) return;
    useTimeboxerStore.getState().addTimeBlock({
      taskId: item.id,
      content: item.content,
      startTime: startTime,
      endTime: endTime,
      date: useTimeboxerStore.getState().selectedDate,
    });
    setIsTimeModalOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-2 py-2.5 rounded-xl border bg-white transition-all duration-150 ${
        item.isCompleted
          ? "border-zinc-100 opacity-60"
          : "border-zinc-200 hover:border-violet-300 hover:shadow-sm"
      }`}
    >
      {/* 드래그 핸들 */}
      <button
        {...listeners}
        {...attributes}
        style={{ touchAction: "none" }}
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
          backgroundColor: useTimeboxerStore.getState().getColorForContent(item.content) || item.color || "#f4f4f5",
          borderColor: (useTimeboxerStore.getState().getColorForContent(item.content) || item.color) ? "transparent" : "#e4e4e7",
        }}
        aria-label="컨텍스트 색상 변경"
        title={`클릭하여 카테고리 변경: ${(useTimeboxerStore.getState().settings.customTags || []).find(p => p.color === (useTimeboxerStore.getState().getColorForContent(item.content) || item.color || "#F4F4F5"))?.tag || "기본"}`}
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

      {/* 완료 뱃지 */}
      {item.isCompleted && (
        <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
      )}

      {/* 액션 버튼 그룹 */}
      <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleManualAssign}
          className={`p-1 rounded-lg transition-all ${
            assigningTask?.id === item.id
              ? "bg-violet-500 text-white shadow-sm scale-110"
              : "text-zinc-400 hover:text-violet-500 hover:bg-violet-50"
          }`}
          title="타임라인에 직접 배치하기"
        >
          <Calendar className="w-4 h-4" />
        </button>
        <button
          onClick={handleTimeModalOpen}
          className="p-1 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
          title="직접 시간 입력하여 배치"
        >
          <Timer className="w-4 h-4" />
        </button>
        <button
          onClick={() => useTimeboxerStore.getState().deleteTopThreeItem(item.id)}
          className="p-1 text-zinc-400 hover:text-red-400 transition-all duration-150"
          aria-label="Top 3 항목 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 시간 입력 모달 */}
      <Dialog open={isTimeModalOpen} onOpenChange={setIsTimeModalOpen}>
        <DialogContent className="sm:max-w-[320px] p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-500" />
              시간 설정
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">시작 시간</label>
              <Input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 text-sm font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">종료 시간</label>
              <Input 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 text-sm font-bold"
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button 
              onClick={handleConfirmTime}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-10 rounded-xl"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

  const canAdd = topThree.length < 3;

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !canAdd) return;
    addTopThreeItem(trimmed);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleAdd();
    }
  };

  const { setNodeRef, isOver } = useDroppable({
    id: "top-three-zone",
  });

  return (
    <div 
      ref={setNodeRef}
      className={`space-y-3 p-1 rounded-2xl transition-colors ${
        isOver ? "bg-violet-50/50 ring-2 ring-violet-200 ring-dashed" : ""
      }`}
    >
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
            <Target className="w-4 h-4 text-violet-600" />
          </div>
          <h2 className="font-semibold text-sm text-zinc-800">Top 3 Focus</h2>
          <span className="text-xs text-zinc-500">{topThree.length}/3</span>
        </div>
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
