import { NextRequest, NextResponse } from "next/server";

// 구글 OAuth 콜백 처리
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=google_auth_failed", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL("/?error=google_config_missing", req.url));
  }

  try {
    // Authorization code → Access Token 교환
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL("/?error=google_token_failed", req.url));
    }

    const tokenData = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    const response = NextResponse.redirect(new URL("/?google_connected=true", req.url));

    // HttpOnly 쿠키에 토큰 임시 저장 (클라이언트에서 Supabase에 저장)
    response.cookies.set("google_access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expires_in,
      path: "/",
    });

    if (refresh_token) {
      response.cookies.set("google_refresh_token", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30일
        path: "/",
      });
    }

    return response;
  } catch (err) {
    console.error("구글 OAuth 콜백 오류:", err);
    return NextResponse.redirect(new URL("/?error=google_auth_error", req.url));
  }
}
