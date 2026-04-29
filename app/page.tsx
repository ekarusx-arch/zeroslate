"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useAuth } from "@/components/AuthProvider";
import { LogOut, User as UserIcon } from "lucide-react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { BrainDumpItem, TopThreeItem } from "@/types";
import TopThreeSection from "@/components/left-panel/TopThreeSection";
import BrainDumpSection from "@/components/left-panel/BrainDumpSection";
import TimelineGrid from "@/components/timeline/TimelineGrid";
import SummaryModal from "@/components/SummaryModal";
import GuideModal from "@/components/GuideModal";
import ArchiveModal from "@/components/ArchiveModal";
import SettingsModal from "@/components/SettingsModal";
import ArchivePanel from "@/components/right-panel/ArchivePanel";
import FocusModal from "@/components/FocusModal";


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
import { GripVertical, RefreshCw, Timer } from "lucide-react";

// 드래그 오버레이용 미니 카드
function DragPreview({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-blue-300 bg-white shadow-xl drag-overlay text-sm text-zinc-700 max-w-[200px]">
      <GripVertical className="w-4 h-4 text-zinc-400 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

// 알림 대화상자 (Shadcn 기반 리셋 확인)
function ResetDialog() {
  const resetAll = useTimeboxerStore((s) => s.resetAll);
  return (
    <AlertDialog>
      <AlertDialogTrigger
        id="reset-button"
        className="inline-flex items-center gap-2 h-8 px-3 text-xs rounded-md border border-zinc-200 bg-white text-zinc-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors font-medium"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        초기화
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>정말 초기화할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            모든 브레인 덤프, Top 3, 타임 블록이 삭제됩니다. 이 작업은 되돌릴 수 없어요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={resetAll}
            className="bg-red-500 hover:bg-red-600"
          >
            초기화하기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// 오늘 날짜 포맷
function getTodayLabel() {
  const now = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;
}

// ─────────────────────────────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const settings = useTimeboxerStore((s) => s.settings);
  const addTimeBlock = useTimeboxerStore((s) => s.addTimeBlock);
  const { user, signOut } = useAuth();

  const [activeItem, setActiveItem] = useState<{
    type: "brain-dump" | "top-three";
    label: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === "brain-dump") {
      setActiveItem({ type: "brain-dump", label: (data.item as BrainDumpItem).content });
    } else if (data?.type === "top-three") {
      setActiveItem({ type: "top-three", label: (data.item as TopThreeItem).content });
    }
  };

  // 드래그 종료 (드롭)
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);
    if (!overId.startsWith("slot-")) return;

    // slot-${hour}-${minute}
    const parts = overId.split("-");
    const hour = parseInt(parts[1]);
    const minute = parseInt(parts[2]);
    const startMin = hour * 60 + minute;
    const endMin = Math.min(startMin + 60, settings.endTime * 60); // 기본 1시간

    const data = active.data.current;
    if (!data) return;

    const formatTime = (m: number) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    };

    if (data.type === "brain-dump") {
      const item = data.item as BrainDumpItem;
      addTimeBlock({
        taskId: item.id,
        content: item.content,
        startTime: formatTime(startMin),
        endTime: formatTime(endMin),
        color: item.color || "bg-zinc-200",
      });
    } else if (data.type === "top-three") {
      const item = data.item as TopThreeItem;
      if (item.isAssigned) return;

      addTimeBlock({
        taskId: item.id,
        content: item.content,
        startTime: formatTime(startMin),
        endTime: formatTime(endMin),
        color: item.color || "bg-zinc-200",
      });
    }
  };

  const routines = useTimeboxerStore((s) => s.routines);
  const applyRoutines = useTimeboxerStore((s) => s.applyRoutines);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-[#F7F8FA]">

        {/* ── 헤더 ── */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-zinc-200">
          <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
            {/* 로고 */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-sm">
                <Timer className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-zinc-900 leading-none">ZeroSlate</h1>
                <p className="text-[10px] text-zinc-500 leading-none mt-0.5">오늘을 0에서부터 새롭게</p>
              </div>
            </div>

            {/* 날짜 */}
            <p className="text-sm text-zinc-500 font-medium hidden sm:block">
              📅 {getTodayLabel()}
            </p>

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <SettingsModal />
              <GuideModal />
              <ArchiveModal />
              <SummaryModal />
              <ResetDialog />
              
              {/* 유저 프로필 & 로그아웃 */}
              {user && (
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-zinc-200">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-100 rounded-md">
                    <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-xs font-medium text-zinc-700 hidden md:inline-block max-w-[120px] truncate">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="로그아웃"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── 메인 콘텐츠 (3단) ── */}
        <main className="flex-1 max-w-[1500px] mx-auto w-full px-3 sm:px-4 py-4 flex flex-col lg:flex-row gap-4 min-h-0">

          {/* 좌측 패널 */}
          <aside className="w-full lg:w-[30%] xl:w-[420px] shrink-0 flex flex-col gap-3">
            {/* Top 3 */}
            <div className="panel-card p-4">
              <TopThreeSection />
            </div>

            {/* Brain Dump */}
            <div className="panel-card p-4 flex-1 flex flex-col min-h-0 lg:max-h-[calc(100vh-200px)]">
              <BrainDumpSection />
            </div>
          </aside>

          {/* 중앙 타임라인 */}
          <section className="flex-1 panel-card overflow-hidden flex flex-col min-h-[520px] lg:min-h-0 lg:min-w-[400px]">
            {/* 타임라인 헤더 */}
            <div className="px-4 py-3 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 shrink-0">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 pulse-dot" />
                  타임라인
                </h2>
                <p className="text-[10px] text-zinc-500">
                  클릭 & 드래그로 블록 생성 · 왼쪽에서 드래그하여 배치
                </p>
              </div>
              
              {routines.length > 0 && (
                <button
                  onClick={applyRoutines}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                >
                  <RefreshCw className="w-3 h-3" />
                  루틴 불러오기
                </button>
              )}
            </div>

            {/* 스크롤 영역 */}
            <div className="overflow-y-auto flex-1">
              <TimelineGrid settings={settings} />
            </div>
          </section>

          {/* 우측 달력(아카이브) 패널 */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-3 min-h-[400px]">
            <ArchivePanel />
          </aside>

        </main>
      </div>

      {/* 드래그 오버레이 */}
      <DragOverlay dropAnimation={null}>
        {activeItem && <DragPreview label={activeItem.label} />}
      </DragOverlay>

      <FocusModal />
    </DndContext>
  );
}
