// ── 유료화 플랜 ───────────────────────────────────────────────────
export type UserPlan = 'free' | 'pro';
export type ThemeId = 'classic' | 'glass' | 'midnight' | 'paper' | 'forest';

// ── 구글 캘린더 이벤트 ────────────────────────────────────────────
export interface GoogleCalendarEvent {
  id: string;
  summary: string;       // 이벤트 제목
  calendarId?: string;
  calendarSummary?: string;
  googleEventId?: string;
  date: string;          // "YYYY-MM-DD" 형식
  start: string;         // "HH:MM" 형식
  end: string;           // "HH:MM" 형식
  startDateTime?: string;
  endDateTime?: string;
  colorId?: string;      // 구글 캘린더 색상 ID
  color?: string;        // 색상 hex (API에서 변환)
  htmlLink?: string;     // 구글 캘린더 이벤트 링크
  isAllDay?: boolean;    // 종일 이벤트 여부
  canEdit?: boolean;     // Google Calendar 수정 가능 여부
}

export interface CustomTag {
  tag: string;
  color: string;
}

export interface Settings {
  startTime: number; // 5 = 05:00
  endTime: number;   // 24 = 24:00
  step: number;      // 30 = 30분 단위
  customTags: CustomTag[]; // ← 신규: 사용자 정의 태그
  theme: ThemeId;
  customAccent?: string;
  bgMood?: string; // 배경 분위기: "none" | "sunset" | "ocean" | "aurora" | "forest" | "rose"
  updatedAt?: string; // 동기화 타임스탬프
}

export interface BrainDumpItem {
  id: string;
  content: string;
  isCompleted: boolean;
  createdAt: string;
  color?: string;
  date?: string; // "YYYY-MM-DD"
  goalId?: string; // ← 신규: 연결된 장기 목표 ID
}

export interface TopThreeItem {
  id: string;
  content: string;
  isAssigned: boolean;
  isCompleted: boolean;
  color?: string;
  date?: string; // "YYYY-MM-DD"
  goalId?: string; // ← 신규: 연결된 장기 목표 ID
}

export interface TimeBlock {
  id: string;
  taskId: string | null;
  content: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  color: string;
  isCompleted: boolean;
  memo?: string;
  date?: string; // "YYYY-MM-DD"
}

export interface Routine {
  id: string;
  content: string;
  startTime: string;
  endTime: string;
  color: string;
  isActive: boolean;
}

export interface DailyLog {
  date: string; // "YYYY-MM-DD"
  savedAt: string;
  completedBlocks: TimeBlock[];
  completedBrainDump: BrainDumpItem[];
  topThree: TopThreeItem[];
  totalBlocks: number;
  totalTasks: number; // ← 추가
  totalPlannedMinutes: number;
  completedMinutes: number;
  topCompletionRate: number;
  blockCompletionRate: number;
}

export const BLOCK_COLORS = [
  "#93C5FD", // blue-300
  "#86EFAC", // green-300
  "#FCA5A5", // red-300
  "#FCD34D", // yellow-300
  "#C4B5FD", // violet-300
  "#F9A8D4", // pink-300
  "#6EE7B7", // emerald-300
  "#FDBA74", // orange-300
];

export const PRESET_COLORS = [
  { label: "기본", value: "#F4F4F5", tag: "" },
  { label: "개발", value: "#93C5FD", tag: "#개발" },
  { label: "운동", value: "#6EE7B7", tag: "#운동" },
  { label: "중요", value: "#FCA5A5", tag: "#중요" },
  { label: "기획", value: "#FDBA74", tag: "#기획" },
  { label: "작곡", value: "#C4B5FD", tag: "#작곡" },
  { label: "휴식", value: "#FCD34D", tag: "#휴식" },
  { label: "기타", value: "#F9A8D4", tag: "#기타" },
];

export interface SummaryStats {
  overallScore: number;
  blockRate: number;
  taskRate: number;
  topRate: number;
  completedBlocks: number;
  totalBlocks: number;
  completedTasks: number;
  totalTasks: number;
  assignedTop: number;
  totalTopThree: number;
  totalPlannedMinutes: number;
  completedMinutes: number;
  completedBlockList: TimeBlock[];
}

// ── 장기 목표 (Goals) ──────────────────────────────────────────────
export type GoalType = 'monthly' | 'quarterly';

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  isCompleted: boolean;
  color?: string;
  createdAt: string;
}
