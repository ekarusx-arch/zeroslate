import { NextResponse } from "next/server";
import { agentDebugLog } from "@/lib/agent-debug-log";

export const dynamic = "force-dynamic";

/** Dev-only: verifies NDJSON debug pipeline (no secrets). */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  // #region agent log
  agentDebugLog({
    location: "debug/session-ping",
    message: "smoke ping",
    data: { hypothesisId: "PIPE", runId: "pre-fix" },
  });
  // #endregion
  return NextResponse.json({ ok: true });
}
