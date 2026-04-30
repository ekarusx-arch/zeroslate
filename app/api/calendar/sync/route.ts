import { NextRequest, NextResponse } from "next/server";

// 구글 캘린더 색상 ID → hex 매핑
const GOOGLE_COLORS: Record<string, string> = {
  "1": "#7986cb", // 라벤더
  "2": "#33b679", // 세이지
  "3": "#8e24aa", // 포도
  "4": "#e67c73", // 플라밍고
  "5": "#f6bf26", // 바나나
  "6": "#f4511e", // 감귤
  "7": "#039be5", // 공작
  "8": "#616161", // 그래파이트
  "9": "#3f51b5", // 블루베리
  "10": "#0b8043", // 세이지 다크
  "11": "#d50000", // 토마토
};

// 구글 캘린더 이벤트 동기화 API
export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("google_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "구글 캘린더가 연결되지 않았습니다." }, { status: 401 });
  }

  try {
    // 오늘 날짜 범위 계산
    const today = new Date();
    const timeMin = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const timeMax = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("timeMax", timeMax);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");

    const calRes = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (calRes.status === 401) {
      // 토큰 만료 → 클라이언트에 재인증 요청
      return NextResponse.json({ error: "토큰이 만료되었습니다.", needsReauth: true }, { status: 401 });
    }

    if (!calRes.ok) {
      return NextResponse.json({ error: "캘린더 데이터를 가져오는 데 실패했습니다." }, { status: 500 });
    }

    const calData = await calRes.json();
    const items = calData.items || [];

    // 구글 이벤트 → ZeroSlate 형식 변환
    const events = items
      .filter((item: { status: string }) => item.status !== "cancelled")
      .map((item: {
        id: string;
        summary?: string;
        status: string;
        start?: { date?: string; dateTime?: string };
        end?: { dateTime?: string };
        colorId?: string;
        htmlLink?: string;
      }) => {
        const isAllDay = !!item.start?.date && !item.start?.dateTime;

        let start = "00:00";
        let end = "00:00";

        if (!isAllDay && item.start?.dateTime) {
          const startDate = new Date(item.start.dateTime);
          const endDate = new Date(item.end?.dateTime || item.start.dateTime);
          start = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`;
          end = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
        }

        return {
          id: item.id,
          summary: item.summary || "(제목 없음)",
          start,
          end,
          colorId: item.colorId,
          color: item.colorId ? GOOGLE_COLORS[item.colorId] : "#7986cb",
          htmlLink: item.htmlLink,
          isAllDay,
        };
      })
      .filter((e: { isAllDay?: boolean }) => !e.isAllDay);
 // 종일 이벤트는 제외

    return NextResponse.json({ events, syncedAt: new Date().toISOString() });
  } catch (err) {
    console.error("캘린더 동기화 오류:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
