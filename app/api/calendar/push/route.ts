import { NextRequest, NextResponse } from "next/server";
import { createGoogleTokensDbClient } from "@/lib/supabase-google-admin";

interface PushTimeBlock {
  id: string;
  content: string;
  startTime: string;
  endTime: string;
  color?: string;
  memo?: string;
}

interface GoogleCalendarListItem {
  id: string;
  summary?: string;
}

interface GoogleEventItem {
  id: string;
  summary?: string;
  start?: { dateTime?: string };
  end?: { dateTime?: string };
  extendedProperties?: {
    private?: Record<string, string>;
  };
}

const ZEROSLATE_CALENDAR_NAME = "ZeroSlate";

function buildDateTime(date: string, time: string) {
  // Google Calendar API는 timeZone 속성이 제공될 때 로컬 시간 문자열(YYYY-MM-DDTHH:mm:00)을 올바르게 파싱합니다.
  return `${date}T${time}:00`;
}

function buildDayBoundary(date: string, dayOffset: number) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day + dayOffset).toISOString();
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

async function fetchWithGoogleAuth(url: string, accessToken: string, init: RequestInit = {}) {
  return fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function refreshAccessToken(refreshToken: string) {
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

  if (!tokenRes.ok) return null;
  const tokenData = await tokenRes.json();
  return {
    accessToken: tokenData.access_token as string,
    maxAge: (tokenData.expires_in as number) || 3600,
  };
}

async function ensureZeroSlateCalendar(accessToken: string) {
  const listUrl = new URL("https://www.googleapis.com/calendar/v3/users/me/calendarList");
  listUrl.searchParams.set("minAccessRole", "owner");

  const listRes = await fetchWithGoogleAuth(listUrl.toString(), accessToken);
  if (!listRes.ok) throw new Error("calendar_list_failed");

  const listData = await listRes.json();
  const existing = ((listData.items || []) as GoogleCalendarListItem[]).find(
    (calendar) => calendar.summary === ZEROSLATE_CALENDAR_NAME
  );
  if (existing?.id) return existing.id;

  const createRes = await fetchWithGoogleAuth("https://www.googleapis.com/calendar/v3/calendars", accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: ZEROSLATE_CALENDAR_NAME,
      description: "Tasks exported from ZeroSlate.",
      timeZone: "Asia/Seoul",
    }),
  });

  if (!createRes.ok) throw new Error("calendar_create_failed");
  const calendar = await createRes.json();
  return calendar.id as string;
}

async function getManagedEvents(accessToken: string, calendarId: string, date: string) {
  const eventsUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  eventsUrl.searchParams.set("timeMin", buildDayBoundary(date, 0));
  eventsUrl.searchParams.set("timeMax", buildDayBoundary(date, 1));
  eventsUrl.searchParams.set("singleEvents", "true");
  eventsUrl.searchParams.set("privateExtendedProperty", "source=ZeroSlate");

  const eventsRes = await fetchWithGoogleAuth(eventsUrl.toString(), accessToken);
  if (!eventsRes.ok) throw new Error("events_list_failed");

  const eventsData = await eventsRes.json();
  return ((eventsData.items || []) as GoogleEventItem[]).filter((event) => {
    return event.extendedProperties?.private?.zeroSlateBlockId;
  });
}

export async function POST(req: NextRequest) {
  let accessToken = req.cookies.get("google_access_token")?.value;
  let refreshToken = req.cookies.get("google_refresh_token")?.value;

  const body = await req.json().catch(() => null);
  const date = body?.date as string | undefined;
  const timeZone = (body?.timeZone as string | undefined) || "Asia/Seoul";
  const blocks = (body?.blocks || []) as PushTimeBlock[];
  const userId = body?.userId as string | undefined;

  if (!date || !Array.isArray(blocks)) {
    return NextResponse.json({ error: "동기화할 날짜와 블록 정보가 필요합니다." }, { status: 400 });
  }

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
      console.error("Push API DB 토큰 복구 중 오류:", err);
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: "구글 캘린더가 연결되지 않았습니다." }, { status: 401 });
  }

  let nextAccessToken = accessToken;
  let refreshedMaxAge: number | null = null;

  try {
    let calendarId: string;
    try {
      calendarId = await ensureZeroSlateCalendar(nextAccessToken);
    } catch (error) {
      if (!refreshToken) throw error;
      const refreshed = await refreshAccessToken(refreshToken);
      if (!refreshed) throw error;
      nextAccessToken = refreshed.accessToken;
      refreshedMaxAge = refreshed.maxAge;
      const db = userId ? createGoogleTokensDbClient() : null;
      if (db && userId) {
        await db
          .from("google_tokens")
          .update({
            access_token: nextAccessToken,
            expires_at: new Date(Date.now() + refreshedMaxAge * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      }
      calendarId = await ensureZeroSlateCalendar(nextAccessToken);
    }

    const existingEvents = await getManagedEvents(nextAccessToken, calendarId, date);
    const eventsByBlockId = new Map(
      existingEvents.map((event) => [event.extendedProperties?.private?.zeroSlateBlockId, event])
    );
    const blockIds = new Set(blocks.map((block) => block.id));

    let created = 0;
    let updated = 0;
    let deleted = 0;
    let failed = 0;
    let skipped = 0;

    for (const block of blocks) {
      if (!block.id || timeToMinutes(block.endTime) <= timeToMinutes(block.startTime)) {
        skipped += 1;
        continue;
      }

      const payload = {
        summary: block.content || "ZeroSlate 작업",
        description: block.memo ? `ZeroSlate memo:\n${block.memo}` : "Synced from ZeroSlate.",
        start: { dateTime: buildDateTime(date, block.startTime), timeZone },
        end: { dateTime: buildDateTime(date, block.endTime), timeZone },
        extendedProperties: {
          private: {
            source: "ZeroSlate",
            zeroSlateBlockId: block.id,
          },
        },
      };

      const existing = eventsByBlockId.get(block.id);
      if (existing?.id) {
        const updateUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(existing.id)}`;
        const updateRes = await fetchWithGoogleAuth(updateUrl, nextAccessToken, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (updateRes.ok) {
          updated += 1;
        } else {
          failed += 1;
        }
      } else {
        const insertUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
        const insertRes = await fetchWithGoogleAuth(insertUrl, nextAccessToken, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (insertRes.ok) {
          created += 1;
        } else {
          failed += 1;
        }
      }
    }

    for (const event of existingEvents) {
      const blockId = event.extendedProperties?.private?.zeroSlateBlockId;
      if (!event.id || !blockId || blockIds.has(blockId)) continue;

      const deleteUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(event.id)}`;
      const deleteRes = await fetchWithGoogleAuth(deleteUrl, nextAccessToken, { method: "DELETE" });
      if (deleteRes.ok) {
        deleted += 1;
      } else {
        failed += 1;
      }
    }

    const response = NextResponse.json({
      calendarId,
      created,
      updated,
      deleted,
      failed,
      skipped,
      syncedAt: new Date().toISOString(),
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
    console.error("[Google Calendar Push Error]", error);
    const message = error instanceof Error ? error.message : "";
    const needsReauth = [
      "calendar_list_failed",
      "calendar_create_failed",
      "events_list_failed",
    ].includes(message);

    return NextResponse.json(
      {
        error: needsReauth
          ? "Google Calendar 쓰기 권한 재승인이 필요합니다."
          : "구글 캘린더에 작업을 반영하지 못했습니다.",
        needsReauth,
      },
      { status: needsReauth ? 403 : 500 }
    );
  }
}
