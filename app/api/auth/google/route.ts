import { NextRequest, NextResponse } from "next/server";
import { agentDebugLog } from "@/lib/agent-debug-log";

// 구글 OAuth 인증 시작 API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  // #region agent log
  agentDebugLog({
    location: "google/route.ts:entry",
    message: "google oauth start hit",
    data: {
      hypothesisId: "F",
      runId: "pre-fix",
      hasUserIdQuery: Boolean(userId),
      hasClientId: Boolean(clientId),
      hasRedirectUri: Boolean(redirectUri),
    },
  });
  // #endregion

  if (!clientId || !redirectUri) {
    const missing = [];
    if (!clientId) missing.push("GOOGLE_CLIENT_ID");
    if (!redirectUri) missing.push("GOOGLE_REDIRECT_URI");
    
    return NextResponse.json(
      { 
        error: "구글 API 설정이 필요합니다. 환경변수를 확인해주세요.",
        missing: missing,
        details: "Vercel 배포 시에는 Vercel Dashboard에서, 로컬 실행 시에는 .env.local 파일을 확인하세요."
      },
      { status: 500 }
    );
  }

  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/calendar"
  );

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline` +
    `&prompt=consent` +
    (userId ? `&state=${encodeURIComponent(userId)}` : "");

  const response = NextResponse.redirect(authUrl);

  // userId를 쿠키에 임시 저장 (인증 후 돌아왔을 때 식별용)
  if (userId) {
    response.cookies.set("google_auth_user_id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10분만 유지
      path: "/",
    });
  }

  return response;
}
