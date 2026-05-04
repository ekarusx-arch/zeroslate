import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  BrainDumpItem,
  DailyLog,
  GoogleCalendarEvent,
  Settings,
  TimeBlock,
  TopThreeItem,
  PRESET_COLORS,
  Routine,
  UserPlan,
  Goal,
  GoalType,
} from "@/types";

// ── 헬퍼 ──────────────────────────────────────────────────────────────
function syncTopThreeAssigned(topThree: TopThreeItem[], timeBlocks: TimeBlock[]) {
  const assignedIds = new Set(
    timeBlocks.map((block) => block.taskId).filter(Boolean)
  );
  return topThree.map((item) => ({
    ...item,
    isAssigned: assignedIds.has(item.id),
  }));
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey() {
  return getTodayKey();
}

function getBlockMinutes(block: TimeBlock) {
  const [startHour, startMinute] = block.startTime.split(":").map(Number);
  const [endHour, endMinute] = block.endTime.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getLocalDateRange(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return {
    timeMin: new Date(year, month - 1, day).toISOString(),
    timeMax: new Date(year, month - 1, day + 1).toISOString(),
  };
}

function getDateKeyTime(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function mergeGoogleCalendarEvents(
  current: GoogleCalendarEvent[],
  incoming: GoogleCalendarEvent[],
  range?: { timeMin?: string; timeMax?: string }
) {
  if (!range?.timeMin || !range?.timeMax) return incoming;

  const rangeStart = new Date(range.timeMin).getTime();
  const rangeEnd = new Date(range.timeMax).getTime();
  const outsideRange = current.filter((event) => {
    const eventTime = getDateKeyTime(event.date);
    return eventTime < rangeStart || eventTime >= rangeEnd;
  });

  const merged = new Map<string, GoogleCalendarEvent>();
  for (const event of [...outsideRange, ...incoming]) {
    merged.set(event.id, event);
  }

  return Array.from(merged.values()).sort((a, b) => {
    return `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`);
  });
}

function hasOverlap(newStart: string, newEnd: string, existing: TimeBlock[], excludeId?: string) {
  const ns = timeToMinutes(newStart);
  const ne = timeToMinutes(newEnd);
  return existing.some((b) => {
    if (b.id === excludeId) return false;
    const bs = timeToMinutes(b.startTime);
    const be = timeToMinutes(b.endTime);
    return ns < be && ne > bs;
  });
}

function createDailyLog(state: Pick<TimeboxerState, "brainDump" | "topThree" | "timeBlocks">): DailyLog {
  const completedBlocks = state.timeBlocks.filter((b) => b.isCompleted);
  const completedBrainDump = state.brainDump.filter((i) => i.isCompleted);
  const assignedTop = state.topThree.filter((t) => t.isAssigned).length;
  const totalPlannedMinutes = state.timeBlocks.reduce((sum, block) => sum + getBlockMinutes(block), 0);
  const completedMinutes = completedBlocks.reduce((sum, block) => sum + getBlockMinutes(block), 0);

  return {
    date: getTodayKey(),
    savedAt: new Date().toISOString(),
    completedBlocks,
    completedBrainDump,
    topThree: state.topThree,
    totalBlocks: state.timeBlocks.length,
    totalTasks: state.brainDump.length, // ← 추가
    totalPlannedMinutes,
    completedMinutes,
    topCompletionRate: state.topThree.length > 0 ? Math.round((assignedTop / state.topThree.length) * 100) : 0,
    blockCompletionRate: state.timeBlocks.length > 0 ? Math.round((completedBlocks.length / state.timeBlocks.length) * 100) : 0,
  };
}

// ── 타입 ──────────────────────────────────────────────────────────────
interface TimeboxerState {
  settings: Settings;
  brainDump: BrainDumpItem[];
  topThree: TopThreeItem[];
  timeBlocks: TimeBlock[];
  routines: Routine[];
  dailyLogs: DailyLog[];
  colorIndex: number;
  userId: string | null;
  selectedDate: string; // YYYY-MM-DD 형식

  // ── 유료화 ─────────────────────────────────────────────────────────
  userPlan: UserPlan;
  setUserPlan: (plan: UserPlan) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (open: boolean) => void;
  isUpgradeModalOpen: boolean;
  upgradeFeature: string;
  openUpgradeModal: (feature: string) => void;
  closeUpgradeModal: () => void;
  setSelectedDate: (date: string) => void;

  // ── 구글 캘린더 ─────────────────────────────────────────────────────
  googleCalendarEvents: GoogleCalendarEvent[];
  googleTokenConnected: boolean;
  setGoogleCalendarEvents: (events: GoogleCalendarEvent[]) => void;
  setGoogleTokenConnected: (connected: boolean) => void;
  syncGoogleCalendar: (range?: { date?: string; timeMin?: string; timeMax?: string }) => Promise<void>;

  initialize: () => Promise<void>;
  updateSettings: (s: Partial<Settings>) => void;

  addBrainDumpItem: (content: string) => void;
  updateBrainDumpItem: (id: string, updates: Partial<BrainDumpItem>) => void;
  toggleBrainDumpItem: (id: string) => void;
  deleteBrainDumpItem: (id: string) => void;

  addTopThreeItem: (content: string) => void;
  updateTopThreeItem: (id: string, updates: Partial<TopThreeItem>) => void;
  deleteTopThreeItem: (id: string) => void;
  setTopThreeAssigned: (id: string, assigned: boolean) => void;
  toggleTopThreeItem: (id: string) => void;
  restoreLog: (date: string) => Promise<void>;

  addTimeBlock: (block: Omit<TimeBlock, "id" | "isCompleted" | "color"> & { color?: string }) => void;
  updateTimeBlock: (id: string, patch: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  toggleTimeBlock: (id: string) => void;

  activeFocusId: string | null;
  setFocusId: (id: string | null) => void;

  // ── 장기 목표 (Goals) ──────────────────────────────────────────────
  goals: Goal[];

  // 모바일/PC 스케줄링 배치 모드
  assigningTask: { id: string; content: string; color?: string; type: 'focus' | 'braindump' } | null;
  setAssigningTask: (task: { id: string; content: string; color?: string; type: 'focus' | 'braindump' } | null) => void;
  selectedSlotTime: { hour: number; minute: number } | null;
  setSelectedSlotTime: (time: { hour: number; minute: number } | null) => void;
  fetchGoals: () => Promise<void>;
  addGoal: (title: string, type: GoalType, color?: string) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;

  isPilotLoading: boolean;
  pilotMessage: string | null;
  setPilotLoading: (loading: boolean) => void;
  setPilotMessage: (msg: string | null) => void;

  addRoutine: (routine: Omit<Routine, "id" | "isActive">) => void;
  updateRoutine: (id: string, patch: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  applyRoutines: () => void;

  saveTodayLog: () => void;
  carryOver: () => void;
  carryOverToTomorrow: () => Promise<void>;
  resetAll: () => void;
  fetchDateData: (date: string) => Promise<void>;
  getColorForContent: (content: string) => string | undefined;
  cycleTag: (content: string) => string;
  fetchStatsData: () => Promise<{
    pieData: { name: string; value: number; color: string }[];
    barData: { date: string; minutes: number }[];
    totalMinutes: number;
    completedMinutes: number;
  }>;
}

const defaultSettings: Settings = {
  startTime: 5,
  endTime: 24,
  step: 30,
  customTags: [
    { tag: "#개발", color: "#93C5FD" },
    { tag: "#운동", color: "#6EE7B7" },
    { tag: "#중요", color: "#FCA5A5" },
    { tag: "#기획", color: "#FDBA74" },
    { tag: "#작곡", color: "#C4B5FD" },
    { tag: "#휴식", color: "#FCD34D" },
    { tag: "#기타", color: "#F9A8D4" },
  ],
  theme: "classic",
  customAccent: "#2563EB",
};

const PRO_ACCESS_EMAILS = new Set([
  "ekarusx@gmail.com",
  "ekarusx@naver.com",
  "zeroslate.official@gmail.com",
  "nahyeon.kim@mahanaim.com",
  "graciasbass@goodnews.or.kr"
]);

function getPlanForEmail(email?: string | null): UserPlan {
  return email && PRO_ACCESS_EMAILS.has(email.toLowerCase()) ? "pro" : "free";
}

function getColorForContent(content: string, customTags: any[] = []) {
  if (!Array.isArray(customTags)) return undefined;
  // 태그 리스트 순서대로 확인 (위쪽에 있을수록 우선순위 높음)
  for (const ct of customTags) {
    if (ct.tag && content.includes(ct.tag)) {
      return ct.color;
    }
  }
  return undefined;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeKnownTags(content: string, tags: Array<{ tag?: string }>) {
  let nextContent = content;
  for (const item of tags) {
    if (!item.tag) continue;
    nextContent = nextContent.replace(new RegExp(`\\s*${escapeRegExp(item.tag)}\\s*`, "g"), " ");
  }
  return nextContent.replace(/\s+/g, " ").trim();
}

// ── Store (Supabase 동기화 버전) ──────────────────────────────────────
export const useTimeboxerStore = create<TimeboxerState>()((set, get) => ({
  settings: defaultSettings,
  brainDump: [],
  topThree: [],
  timeBlocks: [],
  routines: [],
  dailyLogs: [],
  activeFocusId: null,
  isPilotLoading: false,
  pilotMessage: null,
  colorIndex: 0,
  userId: null,
  selectedDate: getTodayKey(),
  goals: [],

  assigningTask: null,
  setAssigningTask: (task) => set({ assigningTask: task }),
  selectedSlotTime: null,
  setSelectedSlotTime: (time) => set({ selectedSlotTime: time }),

  // 유료화 초기 상태
  userPlan: 'free' as UserPlan,
  isCalendarOpen: false,
  setIsCalendarOpen: (open) => set({ isCalendarOpen: open }),
  isUpgradeModalOpen: false,
  upgradeFeature: "",
  openUpgradeModal: (feature) => set({ isUpgradeModalOpen: true, upgradeFeature: feature }),
  closeUpgradeModal: () => set({ isUpgradeModalOpen: false }),
  setSelectedDate: (date) => {
    set({ selectedDate: date });
    const state = get();
    if (state.googleTokenConnected) {
      state.syncGoogleCalendar({ date });
    }
    state.fetchDateData(date);
  },
  setUserPlan: (plan) => {
    const { userId } = get();
    if (userId) {
      localStorage.setItem(`zeroslate_plan_${userId}`, plan);
    }
    set({ userPlan: plan });
  },

  // 구글 캘린더 초기 상태
  googleCalendarEvents: [],
  googleTokenConnected: false,
  setGoogleCalendarEvents: (events) => set({ googleCalendarEvents: events }),
  setGoogleTokenConnected: (connected) => {
    const { userId } = get();
    if (userId) {
      const key = `zeroslate_google_connected_${userId}`;
      if (connected) {
        localStorage.setItem(key, "true");
      } else {
        localStorage.removeItem(key);
      }
    }
    set({ googleTokenConnected: connected });
  },
  syncGoogleCalendar: async (range) => {
    try {
      const params = new URLSearchParams();
      let { userId } = get();
      // After OAuth redirect, initialize() may not have set store userId yet; session still has uid.
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id ?? null;
      }
      if (userId) params.set("userId", userId);
      
      const resolvedRange = range?.date ? getLocalDateRange(range.date) : range;
      if (resolvedRange?.timeMin) params.set("timeMin", resolvedRange.timeMin);
      if (resolvedRange?.timeMax) params.set("timeMax", resolvedRange.timeMax);

      const res = await fetch(
        `/api/calendar/sync${params.toString() ? `?${params.toString()}` : ""}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const { events, timeMin, timeMax } = await res.json();
        console.log("✅ Google Calendar Synced:", events);
        set((state) => ({
          googleCalendarEvents: mergeGoogleCalendarEvents(
            state.googleCalendarEvents,
            events || [],
            { timeMin: timeMin || resolvedRange?.timeMin, timeMax: timeMax || resolvedRange?.timeMax }
          ),
        }));
      } else {
        const data = await res.json().catch(() => ({}));
        if (data?.needsReauth || res.status === 401 || res.status === 403) {
          get().setGoogleTokenConnected(false);
        }
      }
    } catch (err) {
      console.error('캘린더 동기화 실패:', err);
    }
  },
  fetchDateData: async (date) => {
    const { userId } = get();
    if (!userId) return;

    // 데이터를 가져오기 전에 현재 상태를 비워줌 (데이터 혼선 방지)
    set({ brainDump: [], topThree: [], timeBlocks: [] });

    const [bd, tt, tb] = await Promise.all([
      supabase.from("brain_dumps").select("*").eq("user_id", userId).eq("date", date),
      supabase.from("top_three").select("*").eq("user_id", userId).eq("date", date),
      supabase.from("time_blocks").select("*").eq("user_id", userId).eq("date", date),
    ]);

    if (bd.error) console.error("fetchDateData brain_dumps error:", bd.error);
    if (tt.error) console.error("fetchDateData top_three error:", tt.error);
    if (tb.error) console.error("fetchDateData time_blocks error:", tb.error);

    set({
      brainDump: (bd.data || []).map(r => ({ id: r.id, content: r.content, isCompleted: r.is_completed, color: r.color, createdAt: r.created_at, date: r.date })),
      topThree: (tt.data || []).map(r => ({ id: r.id, content: r.content, isAssigned: r.is_assigned, isCompleted: r.is_completed, color: r.color, date: r.date })),
      timeBlocks: (tb.data || []).map(r => ({ id: r.id, taskId: r.task_id, content: r.content, startTime: r.start_time, endTime: r.end_time, color: r.color, isCompleted: r.is_completed, memo: r.memo, date: r.date })),
    });
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;
    const accountPlan = getPlanForEmail(session.user.email);
    const targetDate = get().selectedDate;
    
    // 1. 로컬 스토리지에서 우선 로드 (즉각적인 UI 반영)
    const localSettings = localStorage.getItem(`zeroslate_settings_${userId}`);
    const localRoutines = localStorage.getItem(`zeroslate_routines_${userId}`);
    
    if (localSettings) set({ settings: JSON.parse(localSettings) });
    if (localRoutines) set({ routines: JSON.parse(localRoutines) });

    // 2. Supabase에서 공통 설정 및 선택된 날짜 데이터 불러오기
    const [bd, tt, tb, dl, rt, st, gs] = await Promise.all([
      supabase.from("brain_dumps").select("*").eq("user_id", userId).eq("date", targetDate),
      supabase.from("top_three").select("*").eq("user_id", userId).eq("date", targetDate),
      supabase.from("time_blocks").select("*").eq("user_id", userId).eq("date", targetDate),
      supabase.from("daily_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("routines").select("*").eq("user_id", userId),
      supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: false })
    ]);

    // DB 설정이 있다면 로컬보다 최우선함
    const finalSettings = {
      ...defaultSettings,
      ...(localSettings ? JSON.parse(localSettings) : {}),
    };

    if (st.data) {
      finalSettings.startTime = st.data.start_time;
      finalSettings.endTime = st.data.end_time;
      finalSettings.step = st.data.step;
      // DB에 태그 데이터가 명시적으로 있다면 (null이 아니라면) 덮어씀
      if (st.data.custom_tags !== null) {
        finalSettings.customTags = st.data.custom_tags;
      }
    }

    // 완전히 처음 사용하는 사용자(DB도 없고 로컬도 없는 경우)만 기본 태그 적용
    if (!st.data && !localSettings && (!finalSettings.customTags || finalSettings.customTags.length === 0)) {
      finalSettings.customTags = [
        { tag: "#개발", color: "#93C5FD" },
        { tag: "#운동", color: "#6EE7B7" },
        { tag: "#중요", color: "#FCA5A5" },
        { tag: "#기획", color: "#FDBA74" },
        { tag: "#작곡", color: "#C4B5FD" },
        { tag: "#휴식", color: "#FCD34D" },
        { tag: "#기타", color: "#F9A8D4" },
      ];
    }
    if (!finalSettings.theme) finalSettings.theme = "classic";

    const finalRoutines = rt.data && rt.data.length > 0 ? (rt.data || []).map(r => ({ 
      id: r.id, 
      content: r.content, 
      startTime: r.start_time, 
      endTime: r.end_time, 
      color: r.color, 
      isActive: r.is_active 
    })) : (localRoutines ? JSON.parse(localRoutines) : []);

    if (bd.error) console.error("initialize brain_dumps error:", bd.error);
    if (tt.error) console.error("initialize top_three error:", tt.error);
    if (tb.error) console.error("initialize time_blocks error:", tb.error);
    if (gs.error) console.error("initialize goals error:", gs.error);

    set({
      userId,
      userPlan: accountPlan,
      settings: finalSettings,
      routines: finalRoutines,
      brainDump: (bd.data || []).map(r => ({ id: r.id, content: r.content, isCompleted: r.is_completed, color: r.color, createdAt: r.created_at, date: r.date })),
      topThree: (tt.data || []).map(r => ({ id: r.id, content: r.content, isAssigned: r.is_assigned, isCompleted: r.is_completed, color: r.color, date: r.date })),
      timeBlocks: (tb.data || []).map(r => ({ id: r.id, taskId: r.task_id, content: r.content, startTime: r.start_time, endTime: r.end_time, color: r.color, isCompleted: r.is_completed, memo: r.memo, date: r.date })),
      dailyLogs: (dl.data || []).map(r => r.raw_data as DailyLog).filter(Boolean),
      goals: (gs.data || []).map(r => ({ id: r.id, title: r.title, type: r.type, isCompleted: r.is_completed, color: r.color, createdAt: r.created_at })),
    });

    // 구글 캘린더 연동 상태 체크
    const localGoogleConnected = localStorage.getItem(`zeroslate_google_connected_${userId}`);
    const googleStatus = await fetch(`/api/calendar/status?userId=${userId}`, {
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => res.json())
      .catch(() => ({ connected: false }));

    if (localGoogleConnected === 'true' || googleStatus.connected) {
      localStorage.setItem(`zeroslate_google_connected_${userId}`, "true");
      set({ googleTokenConnected: true });
      get().syncGoogleCalendar();
    } else {
      set({ googleTokenConnected: false });
    }

    // 유료 플랜 상태 최종 확정 (로컬 기록이 pro면 pro 유지)
    const localPlan = localStorage.getItem(`zeroslate_plan_${userId}`);
    if (accountPlan === "pro" || localPlan === 'pro' || (get().userPlan === 'pro')) {
      set({ userPlan: 'pro' });
      localStorage.setItem(`zeroslate_plan_${userId}`, "pro");
    } else {
      set({ userPlan: 'free' });
    }
  },

  getColorForContent: (content) => {
    const { settings } = get();
    return getColorForContent(content, settings.customTags);
  },

  cycleTag: (content) => {
    const { settings } = get();
    const tags = settings.customTags || [];
    if (tags.length === 0) return content;

    // 1. 현재 어떤 태그가 있는지 확인
    const currentTagIndex = tags.findIndex(t => content.includes(t.tag));
    
    let nextContent = content;
    if (currentTagIndex === -1) {
      // 태그가 없으면 첫 번째 태그 추가
      nextContent = `${content} ${tags[0].tag}`.trim();
    } else {
      // 태그가 있으면 다음 태그로 교체
      const nextIndex = (currentTagIndex + 1) % (tags.length + 1);
      
      // 마지막 인덱스(tags.length)인 경우 태그 제거 (순환의 끝)
      if (nextIndex === tags.length) {
        nextContent = removeKnownTags(content, tags);
      } else {
        const currentTag = tags[currentTagIndex].tag;
        const nextTag = tags[nextIndex].tag;
        // 기존 태그를 새 태그로 교체
        nextContent = content.replace(currentTag, nextTag);
      }
    }
    return nextContent.trim();
  },

  fetchStatsData: async () => {
    const { userId, settings } = get();
    
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    let blocks: any[] = [];
    if (userId) {
      const { data, error } = await supabase
        .from("time_blocks")
        .select("*")
        .eq("user_id", userId)
        .in("date", last7Days);
      
      if (!error && data) blocks = data;
    }

    const tagStats: Record<string, { minutes: number; color: string }> = {};
    const dailyStats: Record<string, number> = {};
    last7Days.forEach(d => dailyStats[d] = 0);

    let totalMinutes = 0;
    let completedMinutes = 0;

    // 실제 데이터 집계
    if (blocks.length > 0) {
      blocks.forEach(b => {
        const [sh, sm] = b.start_time.split(":").map(Number);
        const [eh, em] = b.end_time.split(":").map(Number);
        const diff = (eh * 60 + em) - (sh * 60 + sm);
        
        if (diff <= 0) return;

        totalMinutes += diff;
        if (b.is_completed) {
          completedMinutes += diff;
          dailyStats[b.date] += diff;

          const color = getColorForContent(b.content, settings.customTags);
          const tag = (settings.customTags || []).find(t => t.color === color)?.tag || "기타";
          
          if (!tagStats[tag]) {
            tagStats[tag] = { minutes: 0, color: color || "#CBD5E1" };
          }
          tagStats[tag].minutes += diff;
        }
      });
    }

    // 데이터가 하나도 없을 경우 데모 데이터 생성 (사용자 체험용)
    if (totalMinutes === 0) {
      const demoTags = [
        { name: "업무", color: "#3B82F6", min: 120, max: 240 },
        { name: "자기계발", color: "#8B5CF6", min: 60, max: 120 },
        { name: "운동", color: "#10B981", min: 45, max: 60 },
        { name: "독서", color: "#F59E0B", min: 30, max: 90 },
      ];

      totalMinutes = 2100; // 약 35시간
      completedMinutes = 1750; // 약 29시간

      demoTags.forEach(t => {
        tagStats[t.name] = { minutes: Math.floor(Math.random() * (t.max - t.min) + t.min) * 5, color: t.color };
      });

      last7Days.forEach(d => {
        dailyStats[d] = Math.floor(Math.random() * 150 + 180);
      });
    }

    const pieData = Object.entries(tagStats).map(([name, data]) => ({
      name,
      value: data.minutes,
      color: data.color
    })).sort((a, b) => b.value - a.value);

    const barData = last7Days.map(date => ({
      date: date.split("-").slice(1).join("/"), // MM/DD 형식
      minutes: dailyStats[date]
    }));

    return { pieData, barData, totalMinutes, completedMinutes };
  },

  updateSettings: async (s) => {
    const { userId, settings } = get();
    const newSettings = { ...settings, ...s };
    set({ settings: newSettings });

    if (userId) {
      // 로컬 스토리지 저장 (백업)
      localStorage.setItem(`zeroslate_settings_${userId}`, JSON.stringify(newSettings));
      
      // DB 저장
      await supabase.from("user_settings").upsert({
        user_id: userId,
        start_time: newSettings.startTime,
        end_time: newSettings.endTime,
        step: newSettings.step,
        custom_tags: newSettings.customTags,
        updated_at: new Date().toISOString()
      });
    }
  },

  addBrainDumpItem: async (content) => {
    const { userId, selectedDate, settings } = get();
    if (!userId) return;
    
    try {
      const color = getColorForContent(content, settings.customTags);
      const id = crypto.randomUUID();
      const newItem: BrainDumpItem = { 
        id, 
        content, 
        isCompleted: false, 
        createdAt: new Date().toISOString(), 
        color, 
        date: selectedDate 
      };
      
      set((state) => ({ brainDump: [...state.brainDump, newItem] }));
      const { error } = await supabase.from("brain_dumps").insert({ 
        id, 
        user_id: userId, 
        content, 
        is_completed: false, 
        created_at: newItem.createdAt, 
        color, 
        date: selectedDate 
      });
      if (error) console.error("Supabase BrainDump Insert Error:", error);
    } catch (err) {
      console.error("Failed to add brain dump item:", err);
    }
  },

  updateBrainDumpItem: async (id, updates) => {
    const state = get();
    const item = state.brainDump.find(i => i.id === id);
    if (!item) return;

    let finalUpdates = { ...updates };

    // 1. 색상이 변경되었다면 해시태그도 연동
    if (updates.color !== undefined) {
      const allTags = state.settings.customTags.map(ct => ({ tag: ct.tag, value: ct.color }));
      const newPreset = allTags.find(p => p.value === updates.color);
      let newContent = updates.content ?? item.content;
      newContent = removeKnownTags(newContent, allTags);
      if (newPreset?.tag) {
        newContent = `${newContent} ${newPreset.tag}`.trim();
      }
      finalUpdates.content = newContent;
    } 
    // 2. 내용만 변경되었다면 텍스트에서 태그 감지하여 색상 업데이트
    else if (updates.content !== undefined) {
      const detectedColor = getColorForContent(updates.content, state.settings.customTags);
      if (detectedColor) {
        finalUpdates.color = detectedColor;
      }
    }

    set((state) => ({
      brainDump: state.brainDump.map((i) => i.id === id ? { ...i, ...finalUpdates } : i),
      timeBlocks: state.timeBlocks.map((b) => b.taskId === id ? { ...b, color: finalUpdates.color ?? b.color, content: finalUpdates.content ?? b.content } : b)
    }));

    const dbUpdates: any = {};
    if (finalUpdates.content !== undefined) dbUpdates.content = finalUpdates.content;
    if (finalUpdates.color !== undefined) dbUpdates.color = finalUpdates.color;
    
    if (Object.keys(dbUpdates).length > 0) {
      await Promise.all([
        supabase.from("brain_dumps").update(dbUpdates).eq("id", id),
        supabase.from("time_blocks").update(dbUpdates).eq("task_id", id)
      ]);
    }
  },

  toggleBrainDumpItem: async (id) => {
    const state = get();
    const item = state.brainDump.find((i) => i.id === id);
    if (!item) return;
    const newStatus = !item.isCompleted;
    
    set((s) => ({
      brainDump: s.brainDump.map((i) => i.id === id ? { ...i, isCompleted: newStatus } : i),
      timeBlocks: s.timeBlocks.map((b) => b.taskId === id ? { ...b, isCompleted: newStatus } : b)
    }));
    
    await Promise.all([
      supabase.from("brain_dumps").update({ is_completed: newStatus }).eq("id", id),
      supabase.from("time_blocks").update({ is_completed: newStatus }).eq("task_id", id)
    ]);
  },

  deleteBrainDumpItem: async (id) => {
    set((state) => ({
      brainDump: state.brainDump.filter((i) => i.id !== id),
      timeBlocks: state.timeBlocks.filter((b) => b.taskId !== id),
    }));
    await Promise.all([
      supabase.from("time_blocks").delete().eq("task_id", id),
      supabase.from("brain_dumps").delete().eq("id", id)
    ]);
  },

  // ── Top Three ──
  addTopThreeItem: async (content) => {
    const { userId, selectedDate, settings } = get();
    if (!userId) return;

    try {
      const color = getColorForContent(content, settings.customTags);
      const id = crypto.randomUUID();
      const newItem: TopThreeItem = { 
        id, 
        content, 
        isAssigned: false, 
        isCompleted: false, 
        color, 
        date: selectedDate 
      };
      
      set((state) => ({ topThree: [...state.topThree, newItem] }));
      const { error } = await supabase.from("top_three").insert({ 
        id, 
        user_id: userId, 
        content, 
        is_assigned: false, 
        is_completed: false, 
        color, 
        date: selectedDate 
      });
      if (error) console.error("Supabase TopThree Insert Error:", error);
    } catch (err) {
      console.error("Failed to add top three item:", err);
    }
  },

  updateTopThreeItem: async (id, updates) => {
    const state = get();
    const item = state.topThree.find(i => i.id === id);
    if (!item) return;

    let finalUpdates = { ...updates };

    // 1. 색상이 변경되었다면 해시태그도 연동
    if (updates.color !== undefined) {
      const allTags = state.settings.customTags.map(ct => ({ tag: ct.tag, value: ct.color }));
      const newPreset = allTags.find(p => p.value === updates.color);
      let newContent = updates.content ?? item.content;
      newContent = removeKnownTags(newContent, allTags);
      if (newPreset?.tag) {
        newContent = `${newContent} ${newPreset.tag}`.trim();
      }
      finalUpdates.content = newContent;
    }
    // 2. 내용만 변경되었다면 텍스트에서 태그 감지하여 색상 업데이트
    else if (updates.content !== undefined) {
      const detectedColor = getColorForContent(updates.content, state.settings.customTags);
      if (detectedColor) {
        finalUpdates.color = detectedColor;
      }
    }

    set((state) => ({
      topThree: state.topThree.map((i) => i.id === id ? { ...i, ...finalUpdates } : i),
      timeBlocks: state.timeBlocks.map((b) => b.taskId === id ? { ...b, color: finalUpdates.color ?? b.color, content: finalUpdates.content ?? b.content } : b)
    }));

    const dbUpdates: any = {};
    if (finalUpdates.content !== undefined) dbUpdates.content = finalUpdates.content;
    if (finalUpdates.color !== undefined) dbUpdates.color = finalUpdates.color;
    
    if (Object.keys(dbUpdates).length > 0) {
      await Promise.all([
        supabase.from("top_three").update(dbUpdates).eq("id", id),
        supabase.from("time_blocks").update(dbUpdates).eq("task_id", id)
      ]);
    }
  },

  deleteTopThreeItem: async (id) => {
    set((state) => ({
      topThree: state.topThree.filter((i) => i.id !== id),
      timeBlocks: state.timeBlocks.filter((b) => b.taskId !== id),
    }));
    await Promise.all([
      supabase.from("time_blocks").delete().eq("task_id", id),
      supabase.from("top_three").delete().eq("id", id)
    ]);
  },

  setTopThreeAssigned: async (id, assigned) => {
    set((state) => ({ topThree: state.topThree.map((i) => i.id === id ? { ...i, isAssigned: assigned } : i) }));
    await supabase.from("top_three").update({ is_assigned: assigned }).eq("id", id);
  },

  toggleTopThreeItem: async (id) => {
    const state = get();
    const item = state.topThree.find((i) => i.id === id);
    if (!item) return;
    const newStatus = !item.isCompleted;
    
    set((s) => ({
      topThree: s.topThree.map((i) => i.id === id ? { ...i, isCompleted: newStatus } : i),
      timeBlocks: s.timeBlocks.map((b) => b.taskId === id ? { ...b, isCompleted: newStatus } : b)
    }));
    
    await Promise.all([
      supabase.from("top_three").update({ is_completed: newStatus }).eq("id", id),
      supabase.from("time_blocks").update({ is_completed: newStatus }).eq("task_id", id)
    ]);
  },

  // ── Time Blocks ──
  addTimeBlock: async (block) => {
    const state = get();
    const { userId } = state;
    if (!userId) return;
    
    if (block.taskId && state.timeBlocks.some((b) => b.taskId === block.taskId && !state.brainDump.find(bd => bd.id === block.taskId))) {
      // Prevent duplicate TopThree
      const isTopThree = state.topThree.some(t => t.id === block.taskId);
      if (isTopThree) return;
    }

    if (hasOverlap(block.startTime, block.endTime, state.timeBlocks)) return;

    let color = block.color;
    if (!color) {
      color = getColorForContent(block.content, state.settings.customTags);
    }
    if (!color) {
      color = PRESET_COLORS[state.colorIndex % PRESET_COLORS.length].value;
    }

    const id = crypto.randomUUID();
    const date = state.selectedDate;
    const newBlock: TimeBlock = { ...block, id, color, isCompleted: false, memo: "", date };
    
    const newBlocks = [...state.timeBlocks, newBlock];
    const newTopThree = syncTopThreeAssigned(state.topThree, newBlocks);
    
    set({ timeBlocks: newBlocks, topThree: newTopThree, colorIndex: state.colorIndex + 1 });
    
    await supabase.from("time_blocks").insert({
      id, user_id: userId, task_id: block.taskId, content: block.content, start_time: block.startTime, end_time: block.endTime, color, is_completed: false, memo: "", date
    });
    
    // Update assigned status in DB if it changed
    if (block.taskId) {
      const topItem = newTopThree.find(t => t.id === block.taskId);
      if (topItem && topItem.isAssigned) {
        await supabase.from("top_three").update({ is_assigned: true }).eq("id", block.taskId);
      }
    }
  },

  updateTimeBlock: async (id, patch) => {
    const state = get();
    if (patch.startTime !== undefined || patch.endTime !== undefined) {
      const target = state.timeBlocks.find((b) => b.id === id);
      if (target) {
        const newStart = patch.startTime ?? target.startTime;
        const newEnd = patch.endTime ?? target.endTime;
        if (hasOverlap(newStart, newEnd, state.timeBlocks, id)) return;
      }
    }
    
    let finalPatch = { ...patch };

    // 1. 내용 변경 시 태그 감지 및 색상 업데이트
    if (patch.content !== undefined && patch.color === undefined) {
      const detectedColor = getColorForContent(patch.content, state.settings.customTags);
      if (detectedColor) {
        finalPatch.color = detectedColor;
      }
    }
    // 2. 색상 변경 시 내용에 태그 자동 추가
    else if (patch.color !== undefined) {
      const allTags = state.settings.customTags.map(ct => ({ tag: ct.tag, value: ct.color }));
      const newPreset = allTags.find(p => p.value === patch.color);
      let newContent = patch.content ?? state.timeBlocks.find(b => b.id === id)?.content ?? "";
      newContent = removeKnownTags(newContent, allTags);
      if (newPreset?.tag) {
        newContent = `${newContent} ${newPreset.tag}`.trim();
      }
      finalPatch.content = newContent;
    }
    
    set((s) => ({ 
      timeBlocks: s.timeBlocks.map((b) => b.id === id ? { ...b, ...finalPatch } : b) 
    }));
    
    const dbUpdates: any = {};
    if (finalPatch.startTime) dbUpdates.start_time = finalPatch.startTime;
    if (finalPatch.endTime) dbUpdates.end_time = finalPatch.endTime;
    if (finalPatch.content) dbUpdates.content = finalPatch.content;
    if (finalPatch.color) dbUpdates.color = finalPatch.color;
    if (finalPatch.memo !== undefined) dbUpdates.memo = finalPatch.memo;
    
    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from("time_blocks").update(dbUpdates).eq("id", id);
      
      // 3. 연결된 원본 할 일(Brain Dump / Top Three)도 함께 업데이트
      const targetBlock = state.timeBlocks.find(b => b.id === id);
      if (targetBlock?.taskId) {
        const taskId = targetBlock.taskId;
        const bdItem = state.brainDump.find(i => i.id === taskId);
        const topItem = state.topThree.find(i => i.id === taskId);
        
        if (bdItem) {
          await get().updateBrainDumpItem(taskId, { 
            content: finalPatch.content ?? targetBlock.content,
            color: finalPatch.color ?? targetBlock.color
          });
        } else if (topItem) {
          await get().updateTopThreeItem(taskId, {
            content: finalPatch.content ?? targetBlock.content,
            color: finalPatch.color ?? targetBlock.color
          });
        }
      }
    }
  },

  deleteTimeBlock: async (id) => {
    const state = get();
    const targetBlock = state.timeBlocks.find(b => b.id === id);
    const newBlocks = state.timeBlocks.filter((b) => b.id !== id);
    const newTopThree = syncTopThreeAssigned(state.topThree, newBlocks);
    
    set({ timeBlocks: newBlocks, topThree: newTopThree });
    await supabase.from("time_blocks").delete().eq("id", id);
    
    if (targetBlock?.taskId) {
      const topItem = newTopThree.find(t => t.id === targetBlock.taskId);
      if (topItem && !topItem.isAssigned) {
        await supabase.from("top_three").update({ is_assigned: false }).eq("id", targetBlock.taskId);
      }
    }
  },

  toggleTimeBlock: async (id) => {
    const state = get();
    const targetBlock = state.timeBlocks.find((b) => b.id === id);
    if (!targetBlock) return;
    
    const newStatus = !targetBlock.isCompleted;
    const newBlocks = state.timeBlocks.map((b) => b.id === id ? { ...b, isCompleted: newStatus } : b);
    
    let dbPromises = [supabase.from("time_blocks").update({ is_completed: newStatus }).eq("id", id)];
    
    let newBrainDump = state.brainDump;
    let newTopThree = state.topThree;

    if (targetBlock.taskId) {
      const taskId = targetBlock.taskId;
      const allBlocksOfTask = newBlocks.filter((b) => b.taskId === taskId);
      const allCompleted = allBlocksOfTask.length > 0 && allBlocksOfTask.every((b) => b.isCompleted);

      newBrainDump = state.brainDump.map((item) => item.id === taskId ? { ...item, isCompleted: allCompleted } : item);
      newTopThree = state.topThree.map((item) => item.id === taskId ? { ...item, isCompleted: allCompleted } : item);
      
      dbPromises.push(supabase.from("brain_dumps").update({ is_completed: allCompleted }).eq("id", taskId) as any);
      dbPromises.push(supabase.from("top_three").update({ is_completed: allCompleted }).eq("id", taskId) as any);
    }

    set({ timeBlocks: newBlocks, brainDump: newBrainDump, topThree: newTopThree });
    await Promise.all(dbPromises);
  },

  setFocusId: (id) => set({ activeFocusId: id }),

  setPilotLoading: (loading) => set({ isPilotLoading: loading }),
  setPilotMessage: (msg) => set({ pilotMessage: msg }),

  // ── Routines ──
  addRoutine: async (routine) => {
    const { userId, routines } = get();
    if (!userId) return;
    const id = crypto.randomUUID();
    const newRoutine: Routine = { ...routine, id, isActive: true };
    const newRoutines = [...routines, newRoutine];
    
    set({ routines: newRoutines });
    localStorage.setItem(`zeroslate_routines_${userId}`, JSON.stringify(newRoutines));
    
    await supabase.from("routines").insert({
      id, user_id: userId, content: routine.content, start_time: routine.startTime, end_time: routine.endTime, color: routine.color, is_active: true
    });
  },

  updateRoutine: async (id, patch) => {
    const { userId, routines } = get();
    const newRoutines = routines.map((r) => r.id === id ? { ...r, ...patch } : r);
    
    set({ routines: newRoutines });
    if (userId) {
      localStorage.setItem(`zeroslate_routines_${userId}`, JSON.stringify(newRoutines));
    }

    const dbUpdates: any = {};
    if (patch.content) dbUpdates.content = patch.content;
    if (patch.startTime) dbUpdates.start_time = patch.startTime;
    if (patch.endTime) dbUpdates.end_time = patch.endTime;
    if (patch.color) dbUpdates.color = patch.color;
    if (patch.isActive !== undefined) dbUpdates.is_active = patch.isActive;

    if (Object.keys(dbUpdates).length > 0 && userId) {
      await supabase.from("routines").update(dbUpdates).eq("id", id);
    }
  },

  deleteRoutine: async (id) => {
    const { userId, routines } = get();
    const newRoutines = routines.filter((r) => r.id !== id);
    
    set({ routines: newRoutines });
    if (userId) {
      localStorage.setItem(`zeroslate_routines_${userId}`, JSON.stringify(newRoutines));
      await supabase.from("routines").delete().eq("id", id);
    }
  },

  applyRoutines: async () => {
    const state = get();
    const { userId, routines, timeBlocks } = state;
    if (!userId) return;

    const activeRoutines = routines.filter(r => r.isActive);
    const blocksToAdd: TimeBlock[] = [];

    for (const r of activeRoutines) {
      if (!hasOverlap(r.startTime, r.endTime, [...timeBlocks, ...blocksToAdd])) {
        blocksToAdd.push({
          id: crypto.randomUUID(),
          taskId: null,
          content: r.content,
          startTime: r.startTime,
          endTime: r.endTime,
          color: r.color,
          isCompleted: false,
          memo: ""
        });
      }
    }

    if (blocksToAdd.length === 0) return;

    const newBlocks = [...timeBlocks, ...blocksToAdd];
    set({ timeBlocks: newBlocks });

    await supabase.from("time_blocks").insert(blocksToAdd.map(b => ({
      id: b.id,
      user_id: userId,
      task_id: b.taskId,
      content: b.content,
      start_time: b.startTime,
      end_time: b.endTime,
      color: b.color,
      is_completed: b.isCompleted,
      memo: b.memo
    })));
  },

  saveTodayLog: async () => {
    const state = get();
    const { userId, dailyLogs, timeBlocks, brainDump } = state;
    if (!userId) return;
    
    // 데이터가 아예 없는 경우(0개)는 실수로 간주하고 마감 저장 방지
    if (timeBlocks.length === 0 && brainDump.length === 0) {
      console.log("저장할 데이터가 없어 로그 생성을 건너뜁니다.");
      return;
    }

    const log = createDailyLog(state);
    
    // 이미 오늘 날짜의 로그가 있고, 그 기록이 현재보다 더 "알찬" 기록이라면 덮어쓰지 않음
    const existingLocal = dailyLogs.find(l => l.date === log.date);
    if (existingLocal && existingLocal.totalBlocks > log.totalBlocks) {
      console.log("이미 더 상세한 기록이 존재하여 덮어쓰지 않습니다.");
      return;
    }

    set((s) => ({ dailyLogs: [log, ...s.dailyLogs.filter((item) => item.date !== log.date)] }));
    
    // DB 조회 및 저장
    const { data: existing } = await supabase
      .from("daily_logs")
      .select("id, total_blocks")
      .eq("user_id", userId)
      .eq("date", log.date)
      .maybeSingle();

    // DB에 이미 더 많은 블록이 있는 기록이 있다면 업데이트 방지
    if (existing && (existing as any).total_blocks > log.totalBlocks) return;
      
    const payload = {
      user_id: userId,
      date: log.date,
      score: log.topCompletionRate,
      completed_blocks: log.completedBlocks.length,
      total_blocks: log.totalBlocks,
      completed_tasks: log.completedBrainDump.length,
      total_tasks: state.brainDump.length,
      assigned_top_three: log.topThree.filter(t => t.isAssigned).length,
      total_top_three: log.topThree.length,
      planned_minutes: log.totalPlannedMinutes,
      completed_minutes: log.completedMinutes,
      completed_block_contents: log.completedBlocks,
      raw_data: log
    };

    if (existing) {
      await supabase.from("daily_logs").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("daily_logs").insert(payload);
    }
  },

  carryOver: async () => {
    const state = get();
    const incompleteBrainDump = state.brainDump.filter((i) => !i.isCompleted);
    const completedIds = state.brainDump.filter(i => i.isCompleted).map(i => i.id);
    
    set({ brainDump: incompleteBrainDump, topThree: [], timeBlocks: [], colorIndex: 0 });
    
    // DB 리셋
    if (state.userId) {
      await Promise.all([
        supabase.from("time_blocks").delete().eq("user_id", state.userId).eq("date", state.selectedDate),
        supabase.from("top_three").delete().eq("user_id", state.userId).eq("date", state.selectedDate),
        supabase.from("brain_dumps").delete().in("id", completedIds)
      ]);
    }
  },

  carryOverToTomorrow: async () => {
    const state = get();
    const { userId, selectedDate, brainDump, topThree } = state;
    if (!userId) return;

    const incompleteBrainDump = brainDump.filter(item => !item.isCompleted);
    const incompleteTopThree = topThree.filter(item => !item.isCompleted);
    
    if (incompleteBrainDump.length === 0 && incompleteTopThree.length === 0) {
      window.alert("넘길 미완료 항목이 없습니다.");
      return;
    }

    // 내일 날짜 계산
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    const tomorrow = current.toISOString().split('T')[0];

    try {
      // 1. 브레인 덤프 항목들 날짜 변경
      if (incompleteBrainDump.length > 0) {
        const bdIds = incompleteBrainDump.map(t => t.id);
        const { error: bdError } = await supabase
          .from("brain_dumps")
          .update({ date: tomorrow })
          .in("id", bdIds);
        
        if (bdError) throw bdError;
      }

      // 2. Top 3 항목들을 내일의 브레인 덤프로 이동 (Top 3는 초기화되므로 브레인 덤프로 옮김)
      if (incompleteTopThree.length > 0) {
        const ttItems = incompleteTopThree.map(t => ({
          user_id: userId,
          content: t.content,
          is_completed: false,
          color: t.color,
          date: tomorrow,
          created_at: new Date().toISOString()
        }));
        
        const { error: ttError } = await supabase
          .from("brain_dumps")
          .insert(ttItems);
        
        if (ttError) throw ttError;

        // 3. 오늘 날짜의 해당 Top 3 항목들 삭제 (DB 반영)
        const ttIds = incompleteTopThree.map(t => t.id);
        const { error: delError } = await supabase
          .from("top_three")
          .delete()
          .in("id", ttIds);
        
        if (delError) throw delError;
      }

      // 4. 현재 날짜 데이터 다시 불러오기 (UI 동기화 보장)
      await get().fetchDateData(selectedDate);

      window.alert(`✅ ${incompleteBrainDump.length + incompleteTopThree.length}개의 미완료 항목이 내일(${tomorrow})로 이동되었습니다.`);
    } catch (err) {
      console.error("Carry over failed:", err);
      window.alert("항목을 이동하는 중 오류가 발생했습니다. DB 마이그레이션(date 컬럼 추가)이 완료되었는지 확인해 주세요.");
    }
  },

  restoreLog: async (date: string) => {
    const state = get();
    const { userId, dailyLogs } = state;
    const targetLog = dailyLogs.find(l => l.date === date);
    if (!targetLog || !userId) return;

    // 1. 상태 복원
    set({
      brainDump: targetLog.completedBrainDump,
      topThree: targetLog.topThree,
      timeBlocks: targetLog.completedBlocks,
      colorIndex: 0
    });

    // 2. DB 동기화 (기존 데이터 삭제 후 복원 데이터 삽입)
    // 주의: 실제 운영 환경에서는 더 안전한 트랜잭션 처리가 필요하지만, 현재는 단순 복원 로직 적용
    await Promise.all([
      supabase.from("time_blocks").delete().eq("user_id", userId),
      supabase.from("top_three").delete().eq("user_id", userId),
      supabase.from("brain_dumps").delete().eq("user_id", userId),
    ]);

    const blockInserts = targetLog.completedBlocks.map(b => ({
      user_id: userId,
      task_id: b.taskId,
      content: b.content,
      start_time: b.startTime,
      end_time: b.endTime,
      color: b.color,
      is_completed: b.isCompleted,
      memo: b.memo
    }));

    const dumpInserts = targetLog.completedBrainDump.map(d => ({
      id: d.id,
      user_id: userId,
      content: d.content,
      is_completed: d.isCompleted,
      created_at: new Date().toISOString()
    }));

    const topInserts = targetLog.topThree.map(t => ({
      id: t.id,
      user_id: userId,
      content: t.content,
      is_completed: t.isCompleted,
      is_assigned: t.isAssigned
    }));

    if (blockInserts.length > 0) await supabase.from("time_blocks").insert(blockInserts);
    if (dumpInserts.length > 0) await supabase.from("brain_dumps").insert(dumpInserts);
    if (topInserts.length > 0) await supabase.from("top_three").insert(topInserts);
  },

  resetAll: async () => {
    const state = get();
    set({ brainDump: [], topThree: [], timeBlocks: [] });
    if (state.userId) {
      await Promise.all([
        supabase.from("time_blocks").delete().eq("user_id", state.userId),
        supabase.from("top_three").delete().eq("user_id", state.userId),
        supabase.from("brain_dumps").delete().eq("user_id", state.userId)
      ]);
    }
  },

  // ── 장기 목표 (Goals) ──────────────────────────────────────────────
  fetchGoals: async () => {
    const { userId } = get();
    if (!userId) return;

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchGoals error:", error);
      return;
    }

    set({
      goals: (data || []).map(r => ({
        id: r.id,
        title: r.title,
        type: r.type,
        isCompleted: r.is_completed,
        color: r.color,
        createdAt: r.created_at
      }))
    });
  },

  addGoal: async (title, type, color) => {
    const { userId } = get();
    if (!userId) return;

    const id = crypto.randomUUID();
    const newGoal: Goal = {
      id,
      title,
      type,
      isCompleted: false,
      color: color || "#93C5FD",
      createdAt: new Date().toISOString()
    };

    set(state => ({ goals: [newGoal, ...state.goals] }));

    const { error } = await supabase.from("goals").insert({
      id,
      user_id: userId,
      title,
      type,
      is_completed: false,
      color: newGoal.color,
      created_at: newGoal.createdAt
    });

    if (error) console.error("addGoal error:", error);
  },

  updateGoal: async (id, updates) => {
    set(state => ({
      goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));

    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
    if (updates.color !== undefined) dbUpdates.color = updates.color;

    const { error } = await supabase.from("goals").update(dbUpdates).eq("id", id);
    if (error) console.error("updateGoal error:", error);
  },

  deleteGoal: async (id) => {
    set(state => ({ goals: state.goals.filter(g => g.id !== id) }));
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) console.error("deleteGoal error:", error);
  },

  toggleGoal: async (id) => {
    const { goals } = get();
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newStatus = !goal.isCompleted;
    await get().updateGoal(id, { isCompleted: newStatus });
  },
}));
