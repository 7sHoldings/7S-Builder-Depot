import "server-only";
import postgres from "postgres";

// Connects to Postgres (Supabase) using DATABASE_URL.
// On Vercel, use Supabase's *transaction pooler* connection string (port 6543).
// If DATABASE_URL is not set, `sql` is null and the site falls back to the sample catalog.

/** Passwords containing "@", "#", "/" etc. must be URL-encoded inside a connection string.
 *  People often paste them raw, so encode the user:password part here.
 *  The host can't contain "@", so the LAST "@" is always the separator. */
export function normalizeDbUrl(raw: string): string {
  const trimmed = raw.trim();
  const m = trimmed.match(/^(postgres(?:ql)?:\/\/)(.*)@([^@]+)$/);
  if (!m) return trimmed;
  const [, scheme, userinfo, rest] = m;
  const colon = userinfo.indexOf(":");
  const user = colon === -1 ? userinfo : userinfo.slice(0, colon);
  const pass = colon === -1 ? null : userinfo.slice(colon + 1);
  const enc = (s: string) => {
    try {
      return encodeURIComponent(decodeURIComponent(s)); // don't double-encode
    } catch {
      return encodeURIComponent(s);
    }
  };
  return `${scheme}${enc(user)}${pass === null ? "" : `:${enc(pass)}`}@${rest}`;
}

/** Safe-to-show facts about the configured database URL (never the password). */
export function describeDbUrl(): { host: string; port: string; kind: "pooler" | "direct" | "other" } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const kind = u.hostname.includes("pooler.supabase.com") ? "pooler" : u.hostname.startsWith("db.") ? "direct" : "other";
    return { host: u.hostname, port: u.port || "5432", kind };
  } catch {
    return { host: "unreadable", port: "?", kind: "other" };
  }
}

const url = process.env.DATABASE_URL ? normalizeDbUrl(process.env.DATABASE_URL) : undefined;

const globalForDb = globalThis as unknown as { __sql?: postgres.Sql };

function create(u: string) {
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(u);
  return postgres(u, {
    prepare: false, // required for Supabase's transaction pooler
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: local ? false : "require",
  });
}

export const sql: postgres.Sql | null = url ? (globalForDb.__sql ??= create(url)) : null;

export const hasDatabase = sql !== null;
