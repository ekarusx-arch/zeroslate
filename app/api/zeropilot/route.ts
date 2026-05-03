import { NextResponse } from "next/server";

interface MagicFillItem {
  id: string;
  content: string;
  source: "top-three" | "brain-dump";
  color?: string;
}

interface MagicFillBlock {
  taskId: string | null;
  startTime: string;
  endTime: string;
}

interface MagicFillSettings {
  startTime: number;
  endTime: number;
  step: number;
}

interface PilotTask {
  id: string;
  content: string;
  isCompleted?: boolean;
  isAssigned?: boolean;
  color?: string;
  source?: "top-three" | "brain-dump";
}

interface PilotTimeBlock {
  id?: string;
  taskId: string | null;
  content: string;
  startTime: string;
  endTime: string;
  isCompleted?: boolean;
}

interface PilotDailyLog {
  date: string;
  completedBlocks?: PilotTimeBlock[];
  totalBlocks?: number;
  totalPlannedMinutes?: number;
  completedMinutes?: number;
  topCompletionRate?: number;
  blockCompletionRate?: number;
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function roundUpToStep(minutes: number, step: number) {
  return Math.ceil(minutes / step) * step;
}

function estimateDuration(content: string, source: MagicFillItem["source"], step: number) {
  const hourMatch = content.match(/(\d+(?:\.\d+)?)\s*(시간|h|hr)/i);
  const minuteMatch = content.match(/(\d+)\s*(분|m|min)/i);
  const parenMinuteMatch = content.match(/\((\d+)\)/);

  if (hourMatch) {
    return roundUpToStep(Math.round(Number(hourMatch[1]) * 60), step);
  }
  if (minuteMatch) {
    return roundUpToStep(Number(minuteMatch[1]), step);
  }
  if (parenMinuteMatch) {
    return roundUpToStep(Number(parenMinuteMatch[1]), step);
  }
  if (content.includes("#짧게") || content.includes("전화") || content.includes("확인")) {
    return Math.max(step, 30);
  }
  if (content.includes("#작곡") || content.includes("개발") || content.includes("연습")) {
    return 90;
  }

  return source === "top-three" ? 75 : 45;
}

function buildFreeSlots(blocks: MagicFillBlock[], settings: MagicFillSettings) {
  const sorted = blocks
    .map((block) => ({
      start: timeToMinutes(block.startTime),
      end: timeToMinutes(block.endTime),
    }))
    .sort((a, b) => a.start - b.start);

  const slots: Array<{ start: number; end: number }> = [];
  let cursor = settings.startTime * 60;
  const dayEnd = settings.endTime * 60;

  for (const block of sorted) {
    if (block.start > cursor) slots.push({ start: cursor, end: block.start });
    cursor = Math.max(cursor, block.end);
  }

  if (cursor < dayEnd) slots.push({ start: cursor, end: dayEnd });
  return slots;
}

function stripTags(content: string) {
  return content.replace(/#[^\s#]+/g, "").replace(/\s+/g, " ").trim();
}

function extractTags(content: string) {
  return content.match(/#[^\s#]+/g) || [];
}

function getTaskType(content: string) {
  const lowered = content.toLowerCase();
  if (content.includes("#작곡") || lowered.includes("music") || content.includes("연습")) return "창작/연습";
  if (content.includes("#개발") || lowered.includes("dev") || content.includes("구현")) return "개발/제작";
  if (content.includes("회의") || content.includes("미팅") || lowered.includes("meeting")) return "커뮤니케이션";
  if (content.includes("확인") || content.includes("정리") || content.includes("메일")) return "관리/정리";
  if (content.includes("#운동") || content.includes("운동")) return "건강/회복";
  return "일반 작업";
}

function summarizeBrainDump(items: PilotTask[], topThree: PilotTask[], blocks: PilotTimeBlock[], settings: MagicFillSettings) {
  const pendingBrainDump = items.filter((item) => !item.isCompleted);
  const completedBrainDump = items.filter((item) => item.isCompleted);
  const pendingTopThree = topThree.filter((item) => !item.isCompleted);
  const completedTopThree = topThree.filter((item) => item.isCompleted);
  const assignedIds = new Set(blocks.map((block) => block.taskId).filter(Boolean));
  const unassignedBrainDump = pendingBrainDump.filter((item) => !assignedIds.has(item.id));
  const unassignedTopThree = pendingTopThree.filter((item) => !assignedIds.has(item.id));
  const pendingItems = [...pendingTopThree, ...pendingBrainDump];
  const tags = [...items, ...topThree].flatMap((item) => extractTags(item.content));
  const tagCounts = tags.reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  const typeCounts = pendingItems.reduce<Record<string, number>>((acc, item) => {
    const type = getTaskType(item.content);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag, count]) => ({ tag, count }));
  const categories = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count]) => ({ label, count }));
  const plannedMinutes = blocks.reduce((sum, block) => {
    return sum + Math.max(0, timeToMinutes(block.endTime) - timeToMinutes(block.startTime));
  }, 0);
  const capacityMinutes = Math.max(0, (settings.endTime - settings.startTime) * 60);
  const loadRate = capacityMinutes > 0 ? Math.round((plannedMinutes / capacityMinutes) * 100) : 0;
  const topCandidate = unassignedTopThree[0] || unassignedBrainDump[0];
  const nextActions = [...unassignedTopThree, ...unassignedBrainDump]
    .slice(0, 4)
    .map((item) => {
      const source = unassignedTopThree.some((topItem) => topItem.id === item.id) ? "Top 3" : "Brain Dump";
      return {
        id: item.id,
        title: stripTags(item.content),
        source,
        duration: estimateDuration(item.content, source === "Top 3" ? "top-three" : "brain-dump", settings.step),
      };
    });

  const risks = [];
  if (pendingBrainDump.length >= 8) risks.push("브레인 덤프가 많아서 선택 피로가 생길 수 있습니다.");
  if (unassignedTopThree.length > 0) risks.push("Top 3 중 아직 타임라인에 배치되지 않은 항목이 있습니다.");
  if (loadRate >= 85) risks.push("계획된 시간이 하루 용량에 가깝습니다. 버퍼를 남기는 편이 좋습니다.");
  if (risks.length === 0) risks.push("큰 위험 신호는 없습니다. 지금은 실행 순서만 명확히 하면 됩니다.");

  return {
    message: topCandidate
      ? `지금은 "${stripTags(topCandidate.content)}"부터 잡는 게 좋겠습니다.`
      : "오늘 브레인 덤프는 꽤 정리된 상태입니다.",
    analysis: {
      stats: {
        pending: pendingBrainDump.length + pendingTopThree.length,
        completed: completedBrainDump.length + completedTopThree.length,
        unassigned: unassignedBrainDump.length + unassignedTopThree.length,
        plannedMinutes,
        loadRate,
      },
      topTags,
      categories,
      risks,
      nextActions,
      summary: pendingItems.length === 0
        ? "남은 작업이 없습니다. 완료 로그를 남기거나 내일로 넘길 항목을 점검하세요."
        : `${pendingItems.length}개 작업 중 ${nextActions.length}개를 바로 실행 후보로 추렸습니다.`,
    },
  };
}

function buildFeedback(data: {
  progress?: number;
  completedBlocks?: number;
  totalBlocks?: number;
  completedMinutes?: number;
  plannedMinutes?: number;
  pendingTopThree?: number;
  nextBlock?: PilotTimeBlock | null;
}) {
  const progress = data.progress ?? 0;
  const completedBlocks = data.completedBlocks ?? 0;
  const totalBlocks = data.totalBlocks ?? 0;
  const pendingTopThree = data.pendingTopThree ?? 0;
  const nextBlock = data.nextBlock;

  if (totalBlocks === 0) {
    return "아직 타임라인이 비어 있습니다. 하나만 먼저 올려두면 하루가 훨씬 덜 흐릿해집니다.";
  }
  if (progress >= 80) {
    return `오늘 ${completedBlocks}/${totalBlocks}개를 끝냈습니다. 이제 남은 건 완주보다 마감 품질을 챙기는 쪽이 좋습니다.`;
  }
  if (progress >= 45) {
    return nextBlock
      ? `흐름이 잡혔습니다. 다음은 "${stripTags(nextBlock.content)}"만 차분히 처리하면 됩니다.`
      : "절반 이상 왔습니다. 지금은 새 일을 늘리기보다 남은 블록을 닫는 게 좋습니다.";
  }
  if (pendingTopThree > 0) {
    return `아직 Top 3가 ${pendingTopThree}개 남았습니다. 가장 작은 첫 동작 하나만 정해서 시작하세요.`;
  }
  return "속도보다 재진입이 중요합니다. 25분짜리 작은 블록 하나로 다시 흐름을 만들면 됩니다.";
}

function getPeriodLabel(time: string) {
  const minutes = timeToMinutes(time);
  if (minutes < 12 * 60) return "오전";
  if (minutes < 17 * 60) return "오후";
  return "저녁";
}

function buildMagicFillExplanation(
  suggestions: Array<{
    source: MagicFillItem["source"];
    content: string;
    startTime: string;
    endTime: string;
  }>,
  requestedCount: number
) {
  if (suggestions.length === 0) {
    return {
      summary: "남은 빈 시간이 부족해서 새 작업을 배치하지 않았습니다.",
      bullets: [
        "이미 잡힌 타임블록과 겹치지 않도록 보수적으로 판단했습니다.",
        "짧은 작업부터 줄이거나 타임라인 종료 시간을 늘리면 다시 배치할 수 있습니다.",
      ],
    };
  }

  const topThreeCount = suggestions.filter((item) => item.source === "top-three").length;
  const shortCount = suggestions.filter((item) => {
    return timeToMinutes(item.endTime) - timeToMinutes(item.startTime) <= 45;
  }).length;
  const periodCounts = suggestions.reduce<Record<string, number>>((acc, item) => {
    const period = getPeriodLabel(item.startTime);
    acc[period] = (acc[period] || 0) + 1;
    return acc;
  }, {});
  const dominantPeriod = Object.entries(periodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "빈 시간";
  const skippedCount = Math.max(0, requestedCount - suggestions.length);
  const bullets = [];

  if (topThreeCount > 0) {
    bullets.push(`Top 3 ${topThreeCount}개를 먼저 배치했습니다.`);
  }
  if (shortCount > 0) {
    bullets.push(`45분 이하 짧은 작업 ${shortCount}개는 남는 시간에 끼워 넣었습니다.`);
  }
  bullets.push(`${dominantPeriod} 시간대의 빈 슬롯을 우선 활용했습니다.`);
  if (skippedCount > 0) {
    bullets.push(`겹침을 피하기 위해 ${skippedCount}개 작업은 이번 배치에서 제외했습니다.`);
  }

  return {
    summary: `${dominantPeriod}에 실행 흐름을 만들고, 중요한 작업을 먼저 넣는 방식으로 배치했습니다.`,
    bullets,
  };
}

function getBlockDuration(block: PilotTimeBlock) {
  return Math.max(0, timeToMinutes(block.endTime) - timeToMinutes(block.startTime));
}

function getPeriodFromTime(time: string) {
  const minutes = timeToMinutes(time);
  if (minutes < 12 * 60) return "오전";
  if (minutes < 17 * 60) return "오후";
  return "저녁";
}

function buildPatternReport(logs: PilotDailyLog[], currentBlocks: PilotTimeBlock[]) {
  const validLogs = logs.filter((log) => log.totalBlocks || log.completedBlocks?.length);
  const completedBlocks = [
    ...validLogs.flatMap((log) => log.completedBlocks || []),
    ...currentBlocks.filter((block) => block.isCompleted),
  ];
  const periodMap = new Map<string, { count: number; minutes: number }>();
  const tagMap = new Map<string, { count: number; minutes: number }>();
  const recentScores = validLogs.slice(0, 7).map((log) => ({
    date: log.date,
    rate: log.blockCompletionRate ?? 0,
    plannedMinutes: log.totalPlannedMinutes ?? 0,
    completedMinutes: log.completedMinutes ?? 0,
  }));

  for (const block of completedBlocks) {
    const duration = getBlockDuration(block);
    const period = getPeriodFromTime(block.startTime);
    const periodData = periodMap.get(period) || { count: 0, minutes: 0 };
    periodMap.set(period, { count: periodData.count + 1, minutes: periodData.minutes + duration });

    const tags = extractTags(block.content);
    const bucketTags = tags.length > 0 ? tags : [getTaskType(block.content)];
    for (const tag of bucketTags) {
      const tagData = tagMap.get(tag) || { count: 0, minutes: 0 };
      tagMap.set(tag, { count: tagData.count + 1, minutes: tagData.minutes + duration });
    }
  }

  const bestPeriods = Array.from(periodMap.entries())
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.minutes - a.minutes);
  const topTags = Array.from(tagMap.entries())
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);
  const averageRate = recentScores.length > 0
    ? Math.round(recentScores.reduce((sum, item) => sum + item.rate, 0) / recentScores.length)
    : 0;
  const heavyLowDays = recentScores.filter((item) => item.plannedMinutes >= 180 && item.rate < 50);
  const bestPeriod = bestPeriods[0];
  const bestTag = topTags[0];
  const insights = [];

  if (bestPeriod) {
    insights.push(`${bestPeriod.label}에 완료된 작업이 가장 많습니다. 이 시간대를 핵심 작업에 우선 배정해보세요.`);
  }
  if (bestTag) {
    insights.push(`${bestTag.label} 작업 완료 기록이 가장 두드러집니다. 비슷한 작업은 같은 시간대에 묶으면 흐름이 좋아집니다.`);
  }
  if (heavyLowDays.length > 0) {
    insights.push("계획 시간이 많은 날에 완료율이 낮아지는 패턴이 있습니다. 하루 계획량을 70% 정도로 줄이고 버퍼를 남기는 편이 좋습니다.");
  }
  if (insights.length === 0) {
    insights.push("아직 뚜렷한 패턴을 만들 만큼 로그가 많지 않습니다. 하루 마감 기록을 몇 번 더 쌓으면 더 정확해집니다.");
  }

  return {
    message: validLogs.length > 0
      ? `최근 ${Math.min(validLogs.length, 7)}개 로그를 기준으로 패턴을 정리했습니다.`
      : "아직 저장된 완료 로그가 부족합니다. 하루 마감하기를 몇 번 실행하면 패턴 리포트가 더 정확해집니다.",
    report: {
      averageRate,
      logCount: validLogs.length,
      bestPeriods,
      topTags,
      insights,
      recommendation: bestPeriod
        ? `${bestPeriod.label}에는 가장 중요한 작업을, 다른 시간대에는 짧은 정리 작업을 배치하는 흐름을 추천합니다.`
        : "먼저 오늘 작업을 마감 저장해서 분석 기준을 만들어보세요.",
    },
  };
}

export async function POST(req: Request) {
  try {
    const { type, data } = await req.json();

    if (type === "magic-fill") {
      const items = (data?.items || []) as MagicFillItem[];
      const existingBlocks = (data?.existingBlocks || []) as MagicFillBlock[];
      const settings = (data?.settings || { startTime: 9, endTime: 18, step: 30 }) as MagicFillSettings;

      const assignedTaskIds = new Set(
        existingBlocks.map((block) => block.taskId).filter(Boolean)
      );
      const candidates = items
        .filter((item) => !assignedTaskIds.has(item.id))
        .sort((a, b) => {
          if (a.source === b.source) return 0;
          return a.source === "top-three" ? -1 : 1;
        });

      if (candidates.length === 0) {
        return NextResponse.json({
          message: "이미 배치된 작업이 많아요. 새로 배치할 작업을 먼저 추가해 주세요.",
          suggestions: [],
        });
      }

      const freeSlots = buildFreeSlots(existingBlocks, settings);
      const suggestions: Array<{
        taskId: string;
        content: string;
        source: MagicFillItem["source"];
        color?: string;
        startTime: string;
        endTime: string;
        reason: string;
      }> = [];

      for (const item of candidates) {
        const duration = estimateDuration(item.content, item.source, settings.step);
        const slot = freeSlots.find((candidate) => candidate.end - candidate.start >= duration);
        if (!slot) continue;

        const start = slot.start;
        const end = start + duration;
        slot.start = end;

        suggestions.push({
          taskId: item.id,
          content: item.content,
          source: item.source,
          color: item.color,
          startTime: minutesToTime(start),
          endTime: minutesToTime(end),
          reason: item.source === "top-three"
            ? "Top 3라서 먼저 배치했습니다."
            : "남는 시간대에 부담 없이 넣었습니다.",
        });
      }

      return NextResponse.json({
        message: suggestions.length > 0
          ? `${suggestions.length}개 작업을 빈 시간에 맞춰 배치해봤어요.`
          : "오늘 남은 빈 시간이 부족해서 자동 배치할 수 없어요.",
        suggestions,
        explanation: buildMagicFillExplanation(suggestions, candidates.length),
      });
    }

    if (type === "pattern-report") {
      const logs = (data?.logs || []) as PilotDailyLog[];
      const currentBlocks = (data?.currentBlocks || []) as PilotTimeBlock[];
      return NextResponse.json(buildPatternReport(logs, currentBlocks));
    }

    // 1. 일정 짜기 (Planning)
    if (type === "plan") {
      const items = (data?.items || []) as PilotTask[];
      const topThree = (data?.topThree || []) as PilotTask[];
      const timeBlocks = (data?.timeBlocks || []) as PilotTimeBlock[];
      const settings = (data?.settings || { startTime: 9, endTime: 18, step: 30 }) as MagicFillSettings;

      if ((!items || items.length === 0) && (!topThree || topThree.length === 0)) {
        return NextResponse.json({
          message: "분석할 작업이 아직 없습니다. Top 3나 브레인 덤프에 떠오르는 일을 먼저 적어보세요.",
          analysis: {
            stats: { pending: 0, completed: 0, unassigned: 0, plannedMinutes: 0, loadRate: 0 },
            topTags: [],
            categories: [],
            risks: ["분석할 작업이 아직 없습니다."],
            nextActions: [],
            summary: "입력된 작업이 생기면 우선순위와 실행 후보를 분석합니다.",
          },
        });
      }

      return NextResponse.json(summarizeBrainDump(items, topThree, timeBlocks, settings));
    }

    // 2. 동기부여 (Feedback)
    if (type === "feedback") {
      return NextResponse.json({ message: buildFeedback(data || {}) });
    }

    return NextResponse.json({ message: "어떤 도움이 필요하신가요?" });
  } catch {
    return NextResponse.json({ error: "API 요청 중 오류가 발생했습니다." }, { status: 500 });
  }
}
