import { NextRequest, NextResponse } from "next/server";
import { agentDebugLog } from "@/lib/agent-debug-log";
import { createGoogleTokensDbClient } from "@/lib/supabase-google-admin";

// 구글 OAuth 콜백 처리
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateUserId = searchParams.get("state");
  
  // 인증 시작 시 저장했던 userId 쿠키 가져오기
  const userId = req.cookies.get("google_auth_user_id")?.value || stateUserId;

  if (!code) {
    // #region agent log
    agentDebugLog({
      location: "callback/route.ts:no_code",
      message: "oauth callback missing code",
      data: { hypothesisId: "B", runId: "pre-fix", hasUserIdHint: Boolean(userId) },
    });
    // #endregion
    return NextResponse.redirect(new URL("/?error=google_auth_failed", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    // #region agent log
    agentDebugLog({
      location: "callback/route.ts:google_env",
      message: "google oauth env incomplete",
      data: {
        hypothesisId: "B",
        runId: "pre-fix",
        hasClientId: Boolean(clientId),
        hasClientSecret: Boolean(clientSecret),
        hasRedirectUri: Boolean(redirectUri),
      },
    });
    // #endregion
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
      const errText = await tokenRes.text().catch(() => "");
      console.error("[google/callback] token exchange failed:", tokenRes.status, errText);
      // #region agent log
      agentDebugLog({
        location: "callback/route.ts:token_exchange",
        message: "google token endpoint not ok",
        data: {
          hypothesisId: "B",
          runId: "pre-fix",
          httpStatus: tokenRes.status,
          errBodyChars: errText.length,
        },
      });
      // #endregion
      return NextResponse.redirect(new URL("/?error=google_token_failed", req.url));
    }

    const tokenData = await tokenRes.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };
    const { access_token, refresh_token, expires_in } = tokenData;
    const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000).toISOString();

    // ── Supabase DB에 토큰 영구 저장 (service role — anon은 RLS로 차단됨) ──
    if (userId) {
      const db = createGoogleTokensDbClient();
      if (!db) {
        console.warn(
          "[google/callback] SUPABASE_SERVICE_ROLE_KEY missing; skipping google_tokens persistence"
        );
        // #region agent log
        agentDebugLog({
          location: "callback/route.ts:no_db_client",
          message: "skip google_tokens persistence",
          data: { hypothesisId: "A", runId: "pre-fix", reason: "no_elevated_supabase_client" },
        });
        // #endregion
      } else {
        const updateData: {
          user_id: string;
          access_token: string;
          refresh_token?: string;
          expires_at: string;
          updated_at: string;
        } = {
          user_id: userId,
          access_token: access_token,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        };
        if (refresh_token) {
          updateData.refresh_token = refresh_token;
        }

        const { error } = await db
          .from("google_tokens")
          .upsert(updateData, { onConflict: "user_id" });

        // #region agent log
        agentDebugLog({
          location: "callback/route.ts:upsert",
          message: "google_tokens upsert result",
          data: {
            hypothesisId: "A",
            runId: "pre-fix",
            upsertOk: !error,
            errCode: error?.code ?? null,
            hint: error?.hint ? "present" : null,
          },
        });
        // #endregion

        if (error) {
          console.error("Supabase google_tokens upsert failed:", error);
        }
      }
    } else {
      // #region agent log
      agentDebugLog({
        location: "callback/route.ts:no_user_id",
        message: "oauth callback missing user id for db row",
        data: { hypothesisId: "C", runId: "pre-fix" },
      });
      // #endregion
    }
    // ─────────────────────────────────────────────────────────────

    const response = NextResponse.redirect(new URL(`/?google_connected=true&auth_ts=${Date.now()}`, req.url));
    response.headers.set("Cache-Control", "no-store, max-age=0");

    // 쿠키에도 일단 저장 (빠른 접근용)
    response.cookies.set("google_access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expires_in || 3600,
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

    // 임시 userId 쿠키 삭제
    response.cookies.delete("google_auth_user_id");

    return response;
  } catch (err) {
    console.error("구글 OAuth 콜백 오류:", err);
    return NextResponse.redirect(new URL("/?error=google_auth_error", req.url));
  }
}
