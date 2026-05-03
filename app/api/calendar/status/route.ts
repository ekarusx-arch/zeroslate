import { NextRequest, NextResponse } from "next/server";
import { createGoogleTokensDbClient } from "@/lib/supabase-google-admin";

export async function GET(req: NextRequest) {
  // 1. 쿠키에서 먼저 확인 (가장 빠름)
  const accessToken = req.cookies.get("google_access_token")?.value;
  const refreshToken = req.cookies.get("google_refresh_token")?.value;

  let isConnected = Boolean(accessToken || refreshToken);

  // 2. 쿠키에 없다면 DB에서 확인
  if (!isConnected) {
    try {
      // 클라이언트 측에서 initialize 시점에 userId를 알고 있을 것이므로, 
      // 쿼리 파라미터로 userId를 받아서 체크하는 것이 가장 정확합니다.
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get("userId");

      if (userId) {
        const db = createGoogleTokensDbClient();
        const { data, error } = db
          ? await db
              .from("google_tokens")
              .select("access_token, refresh_token, expires_at")
              .eq("user_id", userId)
              .maybeSingle()
          : { data: null, error: null };

        if (data && !error) {
          const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : 0;
          const accessTokenAlive = Boolean(data.access_token && (!expiresAt || expiresAt > Date.now()));
          isConnected = Boolean(data.refresh_token || accessTokenAlive);
        }
      }
    } catch (err) {
      console.error("연동 상태 DB 조회 중 오류:", err);
    }
  }

  return NextResponse.json(
    {
      connected: isConnected,
      hasAccessToken: Boolean(accessToken),
      hasRefreshToken: Boolean(refreshToken),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
