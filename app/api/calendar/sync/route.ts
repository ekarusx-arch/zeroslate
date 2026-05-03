import { NextRequest, NextResponse } from "next/server";
import { agentDebugLog } from "@/lib/agent-debug-log";
import { createGoogleTokensDbClient } from "@/lib/supabase-google-admin";

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

interface GoogleCalendarListItem {
  id: string;
  summary?: string;
  primary?: boolean;
  selected?: boolean;
  backgroundColor?: string;
  accessRole?: "freeBusyReader" | "reader" | "writer" | "owner";
}

interface GoogleCalendarEventItem {
  id: string;
  summary?: string;
  status: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  colorId?: string;
  htmlLink?: string;
}

function getEventDateTimeParts(item: GoogleCalendarEventItem) {
  const isAllDay = !!item.start?.date && !item.start?.dateTime;

  let start = "00:00";
  let end = "23:59";
  let eventDate = item.start?.date || "";
  const startDateTime = item.start?.dateTime;
  const endDateTime = item.end?.dateTime;

  if (!isAllDay && item.start?.dateTime) {
    const startDate = new Date(item.start.dateTime);
    const endDate = new Date(item.end?.dateTime || item.start.dateTime);
    eventDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
    start = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`;
    end = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
  }

  return { isAllDay, start, end, eventDate, startDateTime, endDateTime };
}

async function fetchWithGoogleAuth(url: string, accessToken: string) {
  return fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// 구글 캘린더 이벤트 동기화 API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userIdEarly = searchParams.get("userId");
  // #region agent log
  agentDebugLog({
    location: "sync/route.ts:entry",
    message: "calendar sync GET entered",
    data: {
      hypothesisId: "D",
      runId: "pre-fix",
      cookieAccessHint: Boolean(req.cookies.get("google_access_token")?.value),
      userIdQuery: Boolean(userIdEarly),
    },
  });
  // #endregion

  let accessToken = req.cookies.get("google_access_token")?.value;
  let refreshToken = req.cookies.get("google_refresh_token")?.value;
  const cookieHadAccess = Boolean(accessToken);
  const cookieHadRefresh = Boolean(refreshToken);

  const userId = userIdEarly;

  // ── 쿠키에 없으면 DB에서 복구 ─────────────────────────────────────
  if (!accessToken && userId) {
    try {
      const db = createGoogleTokensDbClient();
      const { data, error } = db
        ? await db
            .from("google_tokens")
            .select("access_token, refresh_token")
            .eq("user_id", userId)
            .maybeSingle()
        : { data: null, error: null };

      if (data && !error) {
        accessToken = data.access_token;
        refreshToken = data.refresh_token || refreshToken;
      }
    } catch (err) {
      console.error("Sync API DB 조회 중 오류:", err);
    }
  }
  // ─────────────────────────────────────────────────────────────

  // #region agent log
  agentDebugLog({
    location: "sync/route.ts:after_recovery",
    message: "calendar sync token resolution",
    data: {
      hypothesisId: "D",
      runId: "pre-fix",
      cookieHadAccess,
      cookieHadRefresh,
      userIdQuery: Boolean(userId),
      resolvedAccess: Boolean(accessToken),
    },
  });
  // #endregion

  if (!accessToken) {
    return NextResponse.json({ error: "구글 캘린더가 연결되지 않았습니다." }, { status: 401 });
  }

  try {
    const date = searchParams.get("date");
    const rangeStart = searchParams.get("timeMin");
    const rangeEnd = searchParams.get("timeMax");

    const baseDate = date ? new Date(`${date}T00:00:00`) : new Date();
    const timeMin = rangeStart || new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()).toISOString();
    const timeMax = rangeEnd || new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1).toISOString();

    const calendarListUrl = new URL("https://www.googleapis.com/calendar/v3/users/me/calendarList");
    calendarListUrl.searchParams.set("minAccessRole", "reader");

    let nextAccessToken = accessToken;
    let calendarListRes = await fetchWithGoogleAuth(calendarListUrl.toString(), accessToken);

    let refreshedMaxAge: number | null = null;

    if (calendarListRes.status === 401 && refreshToken) {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        nextAccessToken = tokenData.access_token;
        const tokenMaxAge = tokenData.expires_in || 3600;
        refreshedMaxAge = tokenMaxAge;

        const db = userId ? createGoogleTokensDbClient() : null;
        if (db && userId) {
          await db
            .from("google_tokens")
            .update({
              access_token: nextAccessToken,
              expires_at: new Date(Date.now() + tokenMaxAge * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }

        calendarListRes = await fetchWithGoogleAuth(calendarListUrl.toString(), nextAccessToken);
      }
    }

    if (calendarListRes.status === 401) {
      return NextResponse.json({ error: "토큰이 만료되었습니다.", needsReauth: true }, { status: 401 });
    }

    if (!calendarListRes.ok) {
      return NextResponse.json({ error: "캘린더 데이터를 가져오는 데 실패했습니다." }, { status: 500 });
    }

    const calendarListData = await calendarListRes.json();
    const calendars = ((calendarListData.items || []) as GoogleCalendarListItem[])
      .filter((calendar) => calendar.id && calendar.selected !== false);

    const eventResponses = await Promise.all(
      calendars.map(async (calendar) => {
        const eventsUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events`);
        eventsUrl.searchParams.set("timeMin", timeMin);
        eventsUrl.searchParams.set("timeMax", timeMax);
        eventsUrl.searchParams.set("singleEvents", "true");
        eventsUrl.searchParams.set("orderBy", "startTime");

        const eventsRes = await fetchWithGoogleAuth(eventsUrl.toString(), nextAccessToken);
        if (!eventsRes.ok) {
          console.warn(`[Google Calendar] Failed to fetch ${calendar.summary || calendar.id}`);
          return [];
        }

        const eventsData = await eventsRes.json();
        return ((eventsData.items || []) as GoogleCalendarEventItem[]).map((item) => ({
          item,
          calendar,
        }));
      })
    );

    const items = eventResponses.flat();
    console.log(`[Google Calendar] Fetched ${items.length} items from ${calendars.length} calendars`);

    // 구글 이벤트 → ZeroSlate 형식 변환
    const events = items
      .filter(({ item }) => item.status !== "cancelled")
      .map(({ item, calendar }) => {
        const { isAllDay, start, end, eventDate, startDateTime, endDateTime } = getEventDateTimeParts(item);
        const eventColor = item.colorId ? GOOGLE_COLORS[item.colorId] : calendar.backgroundColor || "#7986cb";
        const canEdit = calendar.accessRole === "writer" || calendar.accessRole === "owner";

        return {
          id: `${calendar.id}:${item.id}`,
          summary: item.summary || "(제목 없음)",
          calendarId: calendar.id,
          calendarSummary: calendar.summary,
          googleEventId: item.id,
          date: eventDate,
          start,
          end,
          startDateTime,
          endDateTime,
          colorId: item.colorId,
          color: eventColor,
          htmlLink: item.htmlLink,
          isAllDay,
          canEdit,
        };
      })
      .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
      // .filter((e: { isAllDay?: boolean }) => !e.isAllDay); // 일단 종일 일정도 보이게 주석 처리

    console.log(`[Google Calendar] Processed ${events.length} events for timeline`);
    const response = NextResponse.json({
      events,
      calendars: calendars.length,
      syncedAt: new Date().toISOString(),
      timeMin,
      timeMax,
    });
    if (refreshedMaxAge) {
      response.cookies.set("google_access_token", nextAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: refreshedMaxAge,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    console.error("[Google Calendar Sync Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
