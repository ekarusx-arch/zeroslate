import { NextRequest, NextResponse } from "next/server";

function buildDateTime(date: string, time: string) {
  // Google Calendar API는 timeZone 속성이 제공될 때 로컬 시간 문자열(YYYY-MM-DDTHH:mm:00)을 올바르게 파싱합니다.
  return `${date}T${time}:00`;
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

async function updateGoogleEvent(accessToken: string, payload: {
  calendarId: string;
  eventId: string;
  summary: string;
  date: string;
  startTime: string;
  endTime: string;
  timeZone: string;
}) {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(payload.calendarId)}/events/${encodeURIComponent(payload.eventId)}`;
  return fetchWithGoogleAuth(url, accessToken, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: payload.summary,
      start: {
        dateTime: buildDateTime(payload.date, payload.startTime),
        timeZone: payload.timeZone,
      },
      end: {
        dateTime: buildDateTime(payload.date, payload.endTime),
        timeZone: payload.timeZone,
      },
    }),
  });
}

export async function PATCH(req: NextRequest) {
  const accessToken = req.cookies.get("google_access_token")?.value;
  const refreshToken = req.cookies.get("google_refresh_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "구글 캘린더가 연결되지 않았습니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const calendarId = body?.calendarId as string | undefined;
  const eventId = body?.eventId as string | undefined;
  const summary = body?.summary as string | undefined;
  const date = body?.date as string | undefined;
  const startTime = body?.startTime as string | undefined;
  const endTime = body?.endTime as string | undefined;
  const timeZone = (body?.timeZone as string | undefined) || "Asia/Seoul";

  if (!calendarId || !eventId || !summary || !date || !startTime || !endTime) {
    return NextResponse.json({ error: "수정할 일정 정보가 부족합니다." }, { status: 400 });
  }

  let nextAccessToken = accessToken;
  let refreshedMaxAge: number | null = null;

  try {
    let updateRes = await updateGoogleEvent(nextAccessToken, {
      calendarId,
      eventId,
      summary,
      date,
      startTime,
      endTime,
      timeZone,
    });

    if (updateRes.status === 401 && refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken);
      if (refreshed) {
        nextAccessToken = refreshed.accessToken;
        refreshedMaxAge = refreshed.maxAge;
        updateRes = await updateGoogleEvent(nextAccessToken, {
          calendarId,
          eventId,
          summary,
          date,
          startTime,
          endTime,
          timeZone,
        });
      }
    }

    if (updateRes.status === 401) {
      return NextResponse.json({ error: "Google Calendar 재승인이 필요합니다.", needsReauth: true }, { status: 401 });
    }

    if (updateRes.status === 403) {
      return NextResponse.json({ error: "이 공유 캘린더에 대한 수정 권한이 없습니다." }, { status: 403 });
    }

    if (!updateRes.ok) {
      return NextResponse.json({ error: "Google Calendar 일정을 수정하지 못했습니다." }, { status: 500 });
    }

    const updatedEvent = await updateRes.json();
    const response = NextResponse.json({ event: updatedEvent });
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
    console.error("[Google Calendar Event Update Error]", error);
    return NextResponse.json({ error: "Google Calendar 일정을 수정하지 못했습니다." }, { status: 500 });
  }
}
