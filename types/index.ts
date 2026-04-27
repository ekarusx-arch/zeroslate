export interface Settings {
  startTime: number; // 5 = 05:00
  endTime: number;   // 24 = 24:00
  step: number;      // 30 = 30분 단위
}

export interface BrainDumpItem {
  id: string;
  content: string;
  isCompleted: boolean;
  createdAt: string;
  color?: string; // ← 신규: 명시적 지정 색상
}

export interface TopThreeItem {
  id: string;
  content: string;
  isAssigned: boolean; // 타임라인에 배치됐는지
  isCompleted: boolean; // 완료 여부
  color?: string; // ← 신규: 명시적 지정 색상
}

export interface TimeBlock {
  id: string;
  taskId: string | null; // null이면 직접 그린 블록
  content: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  color: string;
  isCompleted: boolean;
}

export interface DailyLog {
  date: string; // "YYYY-MM-DD"
  savedAt: string;
  completedBlocks: TimeBlock[];
  completedBrainDump: BrainDumpItem[];
  topThree: TopThreeItem[];
  totalBlocks: number;
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
  { label: "블루", value: "#93C5FD" },
  { label: "그린", value: "#86EFAC" },
  { label: "레드", value: "#FCA5A5" },
  { label: "옐로", value: "#FCD34D" },
  { label: "바이올렛", value: "#C4B5FD" },
  { label: "핑크", value: "#F9A8D4" },
  { label: "에메랄드", value: "#6EE7B7" },
  { label: "오렌지", value: "#FDBA74" },
];
