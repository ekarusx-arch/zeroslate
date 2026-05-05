"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { PlanBadge } from "@/components/ui/ProBadge";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogOut, CalendarDays, Calendar as CalendarIcon, Check, RotateCw, GripVertical, RefreshCw, Timer, UploadCloud, ChevronLeft, ChevronRight } from "lucide-react";
import { getTodayDateKey, useTimeboxerStore } from "@/store/useTimeboxerStore";
import { BrainDumpItem, TopThreeItem } from "@/types";
import TopThreeSection from "@/components/left-panel/TopThreeSection";
import BrainDumpSection from "@/components/left-panel/BrainDumpSection";
import TimelineGrid from "@/components/timeline/TimelineGrid";
import SummaryModal from "@/components/modals/SummaryModal";
import GuideModal from "@/components/modals/GuideModal";
import ArchiveModal from "@/components/modals/ArchiveModal";
import GoalBanner from "@/components/feedback/GoalBanner";
import GoalModal from "@/components/modals/GoalModal";
import SettingsModal from "@/components/modals/SettingsModal";
import MobileNav from "@/components/navigation/MobileNav";
import ArchivePanel from "@/components/right-panel/ArchivePanel";
import FocusModal from "@/components/modals/FocusModal";
import ZeroPilot from "@/components/zeropilot/ZeroPilot";
import LandingPage from "@/components/LandingPage";
import UpgradeModal from "@/components/modals/UpgradeModal";
import CalendarViewModal from "@/components/modals/CalendarViewModal";
import GooglePushFeedback from "@/components/feedback/GooglePushFeedback";
import FocusTimer from "@/components/FocusTimer";
import StatsModal from "@/components/modals/StatsModal";

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
        className="inline-flex items-center gap-1.5 h-[33px] px-[14px] text-xs rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all font-semibold whitespace-nowrap shrink-0 active:scale-95 shadow-sm"
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

// 특정 날짜 라벨 포맷
function getDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
}

type PushFeedback =
  | { type: "success"; message: string; syncedAt: string }
  | { type: "warning"; message: string; syncedAt?: string }
  | { type: "error"; message: string };

// ─────────────────────────────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const settings = useTimeboxerStore((s) => s.settings);
  const isDragging = useTimeboxerStore((s) => s.isDragging);
  const addTimeBlock = useTimeboxerStore((s) => s.addTimeBlock);
  const userPlan = useTimeboxerStore((s) => s.userPlan);
  const googleTokenConnected = useTimeboxerStore((s) => s.googleTokenConnected);
  const setGoogleTokenConnected = useTimeboxerStore((s) => s.setGoogleTokenConnected);
  const syncGoogleCalendar = useTimeboxerStore((s) => s.syncGoogleCalendar);
  const selectedDate = useTimeboxerStore((s) => s.selectedDate);
  const setIsCalendarOpen = useTimeboxerStore((s) => s.setIsCalendarOpen);
  const timeBlocks = useTimeboxerStore((s) => s.timeBlocks);
  const isUpgradeModalOpen = useTimeboxerStore((s) => s.isUpgradeModalOpen);
  const upgradeFeature = useTimeboxerStore((s) => s.upgradeFeature);
  const openUpgradeModal = useTimeboxerStore((s) => s.openUpgradeModal);
  const closeUpgradeModal = useTimeboxerStore((s) => s.closeUpgradeModal);
  
  const addTopThreeItem = useTimeboxerStore((s) => s.addTopThreeItem);
  const deleteBrainDumpItem = useTimeboxerStore((s) => s.deleteBrainDumpItem);
  const addBrainDumpItem = useTimeboxerStore((s) => s.addBrainDumpItem);
  const deleteTopThreeItem = useTimeboxerStore((s) => s.deleteTopThreeItem);
  const topThree = useTimeboxerStore((s) => s.topThree);
  const brainDump = useTimeboxerStore((s) => s.brainDump);
  const [landingGuideOpen, setLandingGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dump" | "timeline" | "stats">("timeline");

  const isTodaySelected = selectedDate === getTodayDateKey();
  const { user, signOut } = useAuth();

  const [calSyncing, setCalSyncing] = useState(false);
  const [googlePushing, setGooglePushing] = useState(false);
  const [pushFeedback, setPushFeedback] = useState<PushFeedback | null>(null);
  
  const changeDate = (days: number) => {
    if (userPlan !== 'pro') {
      openUpgradeModal("미래/과거 계획 세우기");
      return;
    }
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    useTimeboxerStore.getState().setSelectedDate(current.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    useTimeboxerStore.getState().setSelectedDate(getTodayDateKey());
  };

  const googleAuthUrl = user?.id ? `/api/auth/google?userId=${user.id}` : "/api/auth/google";

  useEffect(() => {
    document.documentElement.dataset.zsTheme = settings.theme || "classic";
    if (settings.customAccent) {
      document.documentElement.style.setProperty("--zs-accent", settings.customAccent);
    } else {
      document.documentElement.style.removeProperty("--zs-accent");
    }
    // 배경 분위기 클래스 적용
    const moods = ["sunset", "ocean", "aurora", "rose", "forest"];
    moods.forEach(m => document.documentElement.classList.remove(`zs-bg-mood-${m}`));
    if (settings.bgMood && settings.bgMood !== "none") {
      document.documentElement.classList.add(`zs-bg-mood-${settings.bgMood}`);
    }
  }, [settings.customAccent, settings.theme, settings.bgMood]);

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    const saved = localStorage.getItem(`zeroslate_google_push_${user.id}_${selectedDate}`);
    setPushFeedback(saved ? JSON.parse(saved) : null);
  }, [selectedDate, user]);

  // URL 파라미터로 구글 연동 성공 여부 확인
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true') {
      const userId = useTimeboxerStore.getState().userId || user?.id;
      if (userId) localStorage.setItem(`zeroslate_google_connected_${userId}`, 'true');
      setGoogleTokenConnected(true);
      syncGoogleCalendar({ date: useTimeboxerStore.getState().selectedDate });
      // URL 파라미터 제거
      window.history.replaceState({}, '', '/');
    }
    const error = params.get('error');
    if (error) {
      console.warn('구글 연동 오류:', error);
      window.history.replaceState({}, '', '/');
    }
  }, [setGoogleTokenConnected, syncGoogleCalendar, user]);

  const pushTodayBlocksToGoogle = async () => {
    if (userPlan !== 'pro') {
      openUpgradeModal("Google Calendar로 보내기");
      return;
    }
    if (!googleTokenConnected) {
      window.location.href = googleAuthUrl;
      return;
    }
    if (timeBlocks.length === 0) {
      setPushFeedback({
        type: "warning",
        message: "보낼 타임블록이 없습니다.",
      });
      return;
    }

    setGooglePushing(true);
    setPushFeedback(null);
    try {
      const res = await fetch('/api/calendar/push', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          userId: user?.id || useTimeboxerStore.getState().userId,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          blocks: timeBlocks.map((block) => ({
            id: block.id,
            content: block.content,
            startTime: block.startTime,
            endTime: block.endTime,
            color: block.color,
            memo: block.memo,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.needsReauth || res.status === 401 || res.status === 403) {
          const userId = useTimeboxerStore.getState().userId;
          if (userId) localStorage.removeItem(`zeroslate_google_connected_${userId}`);
          setGoogleTokenConnected(false);
          window.location.href = googleAuthUrl;
          return;
        }
        throw new Error(data?.error || 'google_calendar_push_failed');
      }

      const result = await res.json();
      await syncGoogleCalendar({ date: selectedDate });
      const totalChanged = result.created + result.updated + result.deleted;
      const message = result.failed > 0
        ? `일부만 반영됨 · 성공 ${totalChanged}개 · 실패 ${result.failed}개`
        : `Google 반영 완료 · 생성 ${result.created} · 수정 ${result.updated} · 삭제 ${result.deleted}`;
      const feedback: PushFeedback = {
        type: result.failed > 0 ? "warning" : "success",
        message,
        syncedAt: result.syncedAt || new Date().toISOString(),
      };
      setPushFeedback(feedback);
      const userId = useTimeboxerStore.getState().userId;
      if (userId) {
        localStorage.setItem(`zeroslate_google_push_${userId}_${selectedDate}`, JSON.stringify(feedback));
      }
    } catch (error: unknown) {
      console.error('Google Calendar 내보내기 실패:', error);
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
      setPushFeedback({
        type: "error",
        message: errorMessage === 'google_calendar_push_failed' 
          ? "Google 반영 실패 · 다시 승인 후 시도해주세요."
          : `반영 실패: ${errorMessage}`,
      });
    } finally {
      setGooglePushing(false);
    }
  };

  const handleCalendarSync = async () => {
    if (userPlan !== 'pro') {
      openUpgradeModal("고급 캘린더 동기화");
      return;
    }
    if (!googleTokenConnected) {
      window.location.href = googleAuthUrl;
      return;
    }
    setCalSyncing(true);
    try {
      await syncGoogleCalendar({ date: selectedDate });
    } finally {
      setCalSyncing(false);
    }
  };

  const [activeItem, setActiveItem] = useState<{
    type: "brain-dump" | "top-three";
    label: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 2000,
        tolerance: 15,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const setIsDragging = useTimeboxerStore((s) => s.setIsDragging);

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const data = event.active.data.current;
    if (data?.type === "brain-dump") {
      setActiveItem({ type: "brain-dump", label: (data.item as BrainDumpItem).content });
    } else if (data?.type === "top-three") {
      setActiveItem({ type: "top-three", label: (data.item as TopThreeItem).content });
    }
  };

  // 드래그 종료 (드롭)
  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeData = active.data.current;
    const overData = over.data.current;

    // 아이템 리오더링 처리 (같은 섹션 내에서 아이템 간 이동하는 경우)
    if (activeId !== overId && activeData?.type === overData?.type) {
      if (activeData?.type === "top-three") {
        const oldIndex = topThree.findIndex((i) => i.id === activeId);
        const newIndex = topThree.findIndex((i) => i.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          useTimeboxerStore.getState().reorderTopThree(oldIndex, newIndex);
        }
        return;
      }
      if (activeData?.type === "brain-dump") {
        const oldIndex = brainDump.findIndex((i) => i.id === activeId);
        const newIndex = brainDump.findIndex((i) => i.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          useTimeboxerStore.getState().reorderBrainDump(oldIndex, newIndex);
        }
        return;
      }
    }

    // Top Three 섹션으로 드롭한 경우
    if (overId === "top-three-zone") {
      const data = active.data.current;
      if (data?.type === "brain-dump") {
        const item = data.item as BrainDumpItem;
        if (topThree.length >= 3) {
          alert("Top 3 항목이 이미 가득 찼습니다. 기존 항목을 완료하거나 삭제 후 옮겨주세요.");
          return;
        }
        addTopThreeItem(item.content);
        deleteBrainDumpItem(item.id);
      }
      return;
    }

    // Brain Dump 섹션으로 드롭한 경우 (Top Three에서 내려오는 경우)
    if (overId === "brain-dump-zone") {
      const data = active.data.current;
      if (data?.type === "top-three") {
        const item = data.item as TopThreeItem;
        addBrainDumpItem(item.content);
        deleteTopThreeItem(item.id);
      }
      return;
    }

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

  if (!user) {
    return (
      <>
        <LandingPage onOpenGuide={() => setLandingGuideOpen(true)} />
        <GuideModal open={landingGuideOpen} onOpenChange={setLandingGuideOpen} />
      </>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="zs-app-shell min-h-screen lg:h-screen lg:overflow-hidden flex flex-col">

        <FocusTimer />
        
        {/* ── 헤더 ── */}
        <header className="sticky top-0 z-50 zs-app-header border-b backdrop-blur-xl">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-8 h-[58px] flex items-center justify-between gap-4 sm:gap-6 overflow-x-auto no-scrollbar w-full">
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


            {/* 날짜 내비게이션 */}
            <div className="flex items-center gap-1 bg-white/70 px-1.5 py-1 rounded-xl border border-zinc-200/80 shadow-sm hidden md:flex shrink-0">
              <button
                onClick={() => changeDate(-1)}
                className="p-1.5 hover:bg-zinc-100 rounded-lg transition-all text-zinc-400 hover:text-zinc-700"
                title="이전 날짜"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              
              <button 
                onClick={goToToday}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isTodaySelected 
                    ? "text-blue-600 bg-blue-50 shadow-sm" 
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                {getDateLabel(selectedDate)}
              </button>

              <button
                onClick={() => changeDate(1)}
                className="p-1.5 hover:bg-zinc-100 rounded-lg transition-all text-zinc-400 hover:text-zinc-700"
                title="다음 날짜"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto pr-2">
              {/* 전체 달력 보기 버튼 (Pro 전용) */}
              <button
                onClick={() => {
                  if (userPlan === 'pro') setIsCalendarOpen(true);
                  else {
                    openUpgradeModal("전체 달력 보기");
                  }
                }}
                className="relative inline-flex items-center justify-center w-[33px] h-[33px] rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm shrink-0"
                title="전체 달력 보기"
              >
                <CalendarIcon className="w-4 h-4" />
                {userPlan !== 'pro' && <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full border-2 border-white" />}
              </button>

              {/* 구글 캘린더 연동 버튼 */}
              <button
                onClick={handleCalendarSync}
                className={`inline-flex items-center gap-1.5 h-[33px] px-[10px] sm:px-[14px] rounded-lg border text-xs font-semibold transition-all shrink-0 whitespace-nowrap active:scale-95 ${
                  userPlan === 'pro' && googleTokenConnected
                    ? 'border-blue-100 bg-blue-50/50 text-blue-600 hover:bg-blue-100/70 shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 shadow-sm'
                }`}
                title={userPlan === 'pro' && googleTokenConnected ? 'Google 일정 불러오기와 오늘 작업 보내기' : '고급 캘린더 동기화'}
                disabled={calSyncing}
              >
                {calSyncing ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : userPlan === 'pro' && googleTokenConnected ? (
                  <Check className="w-3.5 h-3.5 text-blue-500" />
                ) : (
                  <CalendarDays className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {userPlan === 'pro' && googleTokenConnected ? '캘린더 동기화' : '캘린더 연동'}
                </span>
                {userPlan !== 'pro' && <PlanBadge plan="pro" />}
              </button>

              <SettingsModal />
              <GuideModal />
              <ArchiveModal />
              <StatsModal />
              <SummaryModal />
              <ResetDialog />
              
              {/* 유저 프로필 & 로그아웃 */}
              {user && (
                <div className="flex items-center gap-1 sm:gap-1.5 pl-2 sm:pl-3 border-l border-zinc-200 ml-0.5 sm:ml-1 shrink-0">
                  <PlanBadge size="sm" plan={userPlan} />
                  <div className="flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 bg-zinc-100/80 hover:bg-zinc-100 rounded-lg shrink-0 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-black text-white">{user.email?.[0]?.toUpperCase()}</span>
                    </div>
                    <span className="text-xs font-medium text-zinc-600 truncate max-w-[130px] hidden sm:block">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="로그아웃"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── 메인 콘텐츠 (3단) ── */}
        <main className="flex-1 max-w-[1500px] mx-auto w-full px-2 sm:px-4 py-4 flex flex-col lg:flex-row gap-4 min-h-0 pb-20 lg:pb-4">

          {/* 좌측 패널 (모바일에서는 dump 탭일 때만 표시) */}
          {/* 좌측 패널 (모바일에서는 dump 탭일 때만 표시) */}
          <aside className={`w-full lg:w-[30%] xl:w-[420px] shrink-0 flex flex-col gap-3 ${activeTab === 'dump' ? 'flex' : 'hidden lg:flex'}`}>
            {/* Top 3 */}
            <div className="panel-card p-3 sm:p-4">
              <TopThreeSection />
            </div>

            {/* Brain Dump */}
            <div className="panel-card p-3 sm:p-4 flex-1 flex flex-col min-h-0 lg:max-h-[calc(100vh-200px)]">
              <BrainDumpSection />
            </div>
          </aside>

          {/* 중앙 타임라인 (모바일에서는 timeline 탭일 때만 표시) */}
          <section className={`flex-1 panel-card overflow-hidden flex flex-col min-h-[520px] lg:min-h-0 lg:min-w-[400px] ${activeTab === 'timeline' ? 'flex' : 'hidden lg:flex'}`}>
            <GoalBanner />
            {/* 타임라인 헤더 */}
            <div className="px-5 py-3.5 border-b border-zinc-100/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 bg-white/50">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-red-400 pulse-dot" />
                <div>
                  <h2 className="text-sm font-bold text-zinc-800">타임라인</h2>
                  <p className="text-[10px] text-zinc-400 font-medium">Left에서 드래그하여 시간을 배치하세요</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {routines.length > 0 && (
                  <button
                    onClick={applyRoutines}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                  >
                    <RefreshCw className="w-3 h-3" />
                    루틴 불러오기
                  </button>
                )}

                <button
                  onClick={pushTodayBlocksToGoogle}
                  disabled={googlePushing}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all active:scale-95 ${
                    googleTokenConnected && userPlan === "pro"
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  } ${googlePushing ? "opacity-70" : ""}`}
                  title="현재 타임라인을 Google Calendar로 보내기"
                >
                  {googlePushing ? (
                    <RotateCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <UploadCloud className="h-3 w-3" />
                  )}
                  Google로 보내기
                  {userPlan !== "pro" && <PlanBadge plan="pro" />}
                </button>
              </div>
            </div>

            {/* 스크롤 영역 */}
            <div id="timeline-scroll-container" className={`overflow-y-auto flex-1 ${isDragging ? "touch-none" : ""}`}>
              <TimelineGrid settings={settings} />
            </div>
          </section>

          {/* 우측 달력(아카이브) 패널 (모바일에서는 stats 탭일 때만 표시) */}
          <aside className={`w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-3 min-h-[400px] ${activeTab === 'stats' ? 'flex' : 'hidden lg:flex'}`}>
            <ArchivePanel />
          </aside>

        </main>
      </div>

      {/* 드래그 오버레이 */}
      <DragOverlay dropAnimation={null}>
        {activeItem && <DragPreview label={activeItem.label} />}
      </DragOverlay>

      <FocusModal />
      <ZeroPilot />
      <GoalModal />
      <CalendarViewModal />
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <UpgradeModal
        open={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        featureName={upgradeFeature}
      />
      <GooglePushFeedback 
        feedback={pushFeedback} 
        onClose={() => {
          setPushFeedback(null);
          if (user?.id) {
            localStorage.removeItem(`zeroslate_google_push_${user.id}_${selectedDate}`);
          }
        }} 
      />
    </DndContext>
  );
}
