import { NextResponse } from "next/server";

// 구글 OAuth 인증 시작 API
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "구글 API 설정이 필요합니다. 환경변수를 확인해주세요." },
      { status: 500 }
    );
  }

  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/calendar.readonly"
  );

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline` +
    `&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
