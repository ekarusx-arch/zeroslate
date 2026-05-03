import { DailyLog, TimeBlock, UserPlan } from "@/types";

export const FREE_ARCHIVE_DAYS = 7;

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDateTime(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

export function isWithinFreeArchiveWindow(dateKey: string, today = new Date()) {
  const todayKey = toDateKey(today);
  const todayTime = getDateTime(todayKey);
  const targetTime = getDateTime(dateKey);
  const oldestFreeTime = todayTime - (FREE_ARCHIVE_DAYS - 1) * 24 * 60 * 60 * 1000;

  return targetTime >= oldestFreeTime && targetTime <= todayTime;
}

export function isArchiveLocked(dateKey: string, plan: UserPlan) {
  return plan !== "pro" && !isWithinFreeArchiveWindow(dateKey);
}

export function getAccessibleLogs(logs: DailyLog[], plan: UserPlan) {
  if (plan === "pro") return logs;
  return logs.filter((log) => isWithinFreeArchiveWindow(log.date));
}

export function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}시간 ${rest}분` : `${hours}시간`;
}

export function getBlockMinutes(block: TimeBlock) {
  return Math.max(0, timeToMinutes(block.endTime) - timeToMinutes(block.startTime));
}

export function getBlockTags(block: TimeBlock) {
  return block.content.match(/#[^\s#]+/g) || ["#기타"];
}
