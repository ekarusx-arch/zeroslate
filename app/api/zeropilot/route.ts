import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { type, data } = await req.json();

    // 1. 일정 짜기 (Planning)
    if (type === "plan") {
      const { items, startTime = 9 } = data;
      if (!items || items.length === 0) {
        return NextResponse.json({ message: "브레인 덤프가 비어있네요. 할 일을 먼저 적어주세요!" });
      }

      const suggestions = items.map((item: { content: string }, idx: number) => {
        const start = startTime + idx;
        const end = start + 1;
        return {
          content: `${item.content} (AI 추천)`,
          startTime: `${String(start).padStart(2, "0")}:00`,
          endTime: `${String(end).padStart(2, "0")}:00`,
        };
      });

      return NextResponse.json({ 
        message: "브레인 덤프를 바탕으로 오늘 일정을 짜봤어요. 마음에 드시나요?",
        suggestions 
      });
    }

    // 2. 작업 다듬기 (Refine)
    if (type === "refine") {
      const { content } = data;
      const categories: Record<string, { emoji: string, verb: string }> = {
        "운동": { emoji: "🏋️", verb: "완료하기" },
        "공부": { emoji: "📚", verb: "집중해서 끝내기" },
        "개발": { emoji: "💻", verb: "구현 및 테스트" },
        "회의": { emoji: "🤝", verb: "내용 정리하기" },
        "식사": { emoji: "🍱", verb: "맛있게 먹고 리프레시" },
        "휴식": { emoji: "☕", verb: "충분히 쉬기" },
        "독서": { emoji: "📖", verb: "30분 읽기" },
        "청소": { emoji: "🧹", verb: "깔끔하게 정리" },
      };
      
      let refined = content;
      let matched = false;

      for (const [key, val] of Object.entries(categories)) {
        if (content.includes(key)) {
          const base = content.replace(key, "").replace(/[#]/g, "").trim();
          refined = `${val.emoji} ${key}${base ? ` (${base})` : ""} ${val.verb}`;
          matched = true;
          break;
        }
      }

      if (!matched) {
        refined = `✨ ${content} 확실히 끝내기`;
      }

      // 인위적인 지연 시간 (AI 느낌 주기)
      await new Promise(resolve => setTimeout(resolve, 800));

      return NextResponse.json({ refined });
    }

    // 3. 동기부여 (Feedback)
    if (type === "feedback") {
      const { progress } = data;
      let message = "오늘도 멋진 하루를 보내고 계시네요!";
      if (progress >= 80) message = "거의 다 왔어요! 정말 대단한 집중력입니다. 🔥";
      else if (progress >= 40) message = "절반 가까이 왔네요! 조금만 더 힘내봐요. 👍";
      
      return NextResponse.json({ message });
    }

    return NextResponse.json({ message: "어떤 도움이 필요하신가요?" });
  } catch {
    return NextResponse.json({ error: "API 요청 중 오류가 발생했습니다." }, { status: 500 });
  }
}
