import fs from "node:fs";
import path from "node:path";

const INGEST_URL =
  "http://127.0.0.1:7610/ingest/4260d08e-aeaa-4b10-9fd9-263e9733439e";

/** Walk up from cwd until package.json name is "zeroslate". */
function resolveZeroslateRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 12; i++) {
    try {
      const raw = fs.readFileSync(path.join(dir, "package.json"), "utf8");
      const pkg = JSON.parse(raw) as { name?: string };
      if (pkg.name === "zeroslate") return dir;
    } catch {
      /* no package.json */
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

/** .cursor is often not writable from Next dev (EPERM); fall back to logs/ under repo root. */
function appendDebugNdjson(line: string): void {
  const root = resolveZeroslateRoot();
  const paths = [
    path.join(root, "logs", "debug-014df9.log"),
    path.join(root, ".cursor", "debug-014df9.log"),
  ];
  let wrote = false;
  for (const logPath of paths) {
    try {
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.appendFileSync(logPath, line, "utf8");
      wrote = true;
      break;
    } catch {
      /* try next path */
    }
  }
  if (!wrote) {
    console.error("[agent-debug-log] no writable debug path; dropping NDJSON line");
  }
}

/** Server-only: writes NDJSON and mirrors to Cursor ingest if reachable. */
export function agentDebugLog(entry: {
  location: string;
  message: string;
  data?: Record<string, unknown>;
}) {
  const payload = {
    sessionId: "014df9",
    ...entry,
    timestamp: Date.now(),
  };
  const line = `${JSON.stringify(payload)}\n`;
  appendDebugNdjson(line);
  fetch(INGEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "014df9",
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
