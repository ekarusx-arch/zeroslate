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
      const emojis: Record<string, string> = {
        "운동": "🏋️", "공부": "📚", "개발": "💻", "회의": "🤝", "식사": "🍱", "휴식": "☕"
      };
      
      let refined = content;
      for (const [key, val] of Object.entries(emojis)) {
        if (content.includes(key)) {
          refined = `${val} ${content}`;
          break;
        }
      }
      if (refined === content) refined = `✅ ${content}`;

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
