import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  BrainDumpItem,
  DailyLog,
  Settings,
  TimeBlock,
  TopThreeItem,
  PRESET_COLORS,
  Routine,
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

function getBlockMinutes(block: TimeBlock) {
  const [startHour, startMinute] = block.startTime.split(":").map(Number);
  const [endHour, endMinute] = block.endTime.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
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

  addTimeBlock: (block: Omit<TimeBlock, "id" | "isCompleted" | "color"> & { color?: string }) => void;
  updateTimeBlock: (id: string, patch: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  toggleTimeBlock: (id: string) => void;

  activeFocusId: string | null;
  setFocusId: (id: string | null) => void;

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
  resetAll: () => void;
}

const defaultSettings: Settings = {
  startTime: 5,
  endTime: 24,
  step: 30,
};

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

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;
    
    // Supabase에서 데이터 불러오기
    const [bd, tt, tb, dl, rt] = await Promise.all([
      supabase.from("brain_dumps").select("*").eq("user_id", userId),
      supabase.from("top_three").select("*").eq("user_id", userId),
      supabase.from("time_blocks").select("*").eq("user_id", userId),
      supabase.from("daily_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("routines").select("*").eq("user_id", userId)
    ]);

    set({
      userId,
      brainDump: (bd.data || []).map(r => ({ id: r.id, content: r.content, isCompleted: r.is_completed, color: r.color, createdAt: r.created_at })),
      topThree: (tt.data || []).map(r => ({ id: r.id, content: r.content, isAssigned: r.is_assigned, isCompleted: r.is_completed, color: r.color })),
      timeBlocks: (tb.data || []).map(r => ({ id: r.id, taskId: r.task_id, content: r.content, startTime: r.start_time, endTime: r.end_time, color: r.color, isCompleted: r.is_completed, memo: r.memo })),
      dailyLogs: (dl.data || []).map(r => r.raw_data as DailyLog).filter(Boolean),
      routines: (rt.data || []).map(r => ({ id: r.id, content: r.content, startTime: r.start_time, endTime: r.end_time, color: r.color, isActive: r.is_active }))
    });
  },

  updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

  // ── Brain Dump ──
  addBrainDumpItem: async (content) => {
    const { userId } = get();
    if (!userId) return;
    const id = crypto.randomUUID();
    const newItem: BrainDumpItem = { id, content, isCompleted: false, createdAt: new Date().toISOString() };
    
    set((state) => ({ brainDump: [...state.brainDump, newItem] }));
    await supabase.from("brain_dumps").insert({ id, user_id: userId, content, is_completed: false, created_at: newItem.createdAt });
  },

  updateBrainDumpItem: async (id, updates) => {
    set((state) => ({
      brainDump: state.brainDump.map((i) => i.id === id ? { ...i, ...updates } : i),
      timeBlocks: state.timeBlocks.map((b) => b.taskId === id ? { ...b, color: updates.color ?? b.color, content: updates.content ?? b.content } : b)
    }));

    const dbUpdates: any = {};
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    
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
    const { userId } = get();
    if (!userId) return;
    const id = crypto.randomUUID();
    const newItem: TopThreeItem = { id, content, isAssigned: false, isCompleted: false };
    
    set((state) => ({ topThree: [...state.topThree, newItem] }));
    await supabase.from("top_three").insert({ id, user_id: userId, content, is_assigned: false, is_completed: false });
  },

  updateTopThreeItem: async (id, updates) => {
    set((state) => ({
      topThree: state.topThree.map((i) => i.id === id ? { ...i, ...updates } : i),
      timeBlocks: state.timeBlocks.map((b) => b.taskId === id ? { ...b, color: updates.color ?? b.color, content: updates.content ?? b.content } : b)
    }));

    const dbUpdates: any = {};
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    
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

    let color = block.color || PRESET_COLORS[state.colorIndex % PRESET_COLORS.length].value;
    if (!block.color) {
      if (/#(개발|코딩)/.test(block.content)) color = "#93C5FD";
      else if (/#(작곡|음악|기획)/.test(block.content)) color = "#C4B5FD";
      else if (/#(운동|건강)/.test(block.content)) color = "#6EE7B7";
      else if (/#(휴식|식사)/.test(block.content)) color = "#FDBA74";
      else if (/#(미팅|연락)/.test(block.content)) color = "#FCA5A5";
    }

    const id = crypto.randomUUID();
    const newBlock: TimeBlock = { ...block, id, color, isCompleted: false, memo: "" };
    
    const newBlocks = [...state.timeBlocks, newBlock];
    const newTopThree = syncTopThreeAssigned(state.topThree, newBlocks);
    
    set({ timeBlocks: newBlocks, topThree: newTopThree, colorIndex: state.colorIndex + 1 });
    
    await supabase.from("time_blocks").insert({
      id, user_id: userId, task_id: block.taskId, content: block.content, start_time: block.startTime, end_time: block.endTime, color, is_completed: false, memo: ""
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
    
    set((s) => ({ timeBlocks: s.timeBlocks.map((b) => b.id === id ? { ...b, ...patch } : b) }));
    
    const dbUpdates: any = {};
    if (patch.startTime) dbUpdates.start_time = patch.startTime;
    if (patch.endTime) dbUpdates.end_time = patch.endTime;
    if (patch.content) dbUpdates.content = patch.content;
    if (patch.color) dbUpdates.color = patch.color;
    if (patch.memo !== undefined) dbUpdates.memo = patch.memo;
    
    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from("time_blocks").update(dbUpdates).eq("id", id);
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
    const { userId } = get();
    if (!userId) return;
    const id = crypto.randomUUID();
    const newRoutine: Routine = { ...routine, id, isActive: true };
    set((s) => ({ routines: [...s.routines, newRoutine] }));
    await supabase.from("routines").insert({
      id, user_id: userId, content: routine.content, start_time: routine.startTime, end_time: routine.endTime, color: routine.color, is_active: true
    });
  },

  updateRoutine: async (id, patch) => {
    set((s) => ({ routines: s.routines.map((r) => r.id === id ? { ...r, ...patch } : r) }));
    const dbUpdates: any = {};
    if (patch.content) dbUpdates.content = patch.content;
    if (patch.startTime) dbUpdates.start_time = patch.startTime;
    if (patch.endTime) dbUpdates.end_time = patch.endTime;
    if (patch.color) dbUpdates.color = patch.color;
    if (patch.isActive !== undefined) dbUpdates.is_active = patch.isActive;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from("routines").update(dbUpdates).eq("id", id);
    }
  },

  deleteRoutine: async (id) => {
    set((s) => ({ routines: s.routines.filter((r) => r.id !== id) }));
    await supabase.from("routines").delete().eq("id", id);
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
    const { userId } = state;
    if (!userId) return;
    
    const log = createDailyLog(state);
    
    set((s) => ({ dailyLogs: [log, ...s.dailyLogs.filter((item) => item.date !== log.date)] }));
    
    // DB 조회 (오늘 날짜의 로그가 이미 있는지)
    const { data: existing } = await supabase
      .from("daily_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("date", log.date)
      .maybeSingle();
      
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
        supabase.from("time_blocks").delete().eq("user_id", state.userId),
        supabase.from("top_three").delete().eq("user_id", state.userId),
        supabase.from("brain_dumps").delete().in("id", completedIds)
      ]);
    }
  },

  resetAll: async () => {
    const state = get();
    set({ brainDump: [], topThree: [], timeBlocks: [], colorIndex: 0 });
    if (state.userId) {
      await Promise.all([
        supabase.from("time_blocks").delete().eq("user_id", state.userId),
        supabase.from("top_three").delete().eq("user_id", state.userId),
        supabase.from("brain_dumps").delete().eq("user_id", state.userId)
      ]);
    }
  },
}));
