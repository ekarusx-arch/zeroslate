import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { agentDebugLog } from "@/lib/agent-debug-log";

/**
 * Server-only Supabase client for `google_tokens`.
 * Table RLS uses auth.uid(); Route Handlers call Supabase without a user JWT,
 * so anon reads/writes fail unless we use elevated keys here.
 *
 * Use either:
 * - Legacy tab: JWT `service_role` → SUPABASE_SERVICE_ROLE_KEY
 * - New keys tab: `sb_secret_...` → SUPABASE_SECRET_KEY (same privilege; see Supabase API keys docs)
 * Never expose these via NEXT_PUBLIC_*.
 */
export function createGoogleTokensDbClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim();
  // #region agent log
  agentDebugLog({
    location: "supabase-google-admin.ts:createGoogleTokensDbClient",
    message: "elevated supabase client gate",
    data: {
      hypothesisId: "A",
      runId: "pre-fix",
      hasProjectUrl: Boolean(url?.trim()),
      hasElevatedKey: Boolean(key?.trim()),
    },
  });
  // #endregion
  if (!url?.trim() || !key?.trim()) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
