import "server-only";
import postgres from "postgres";

// Connects to Postgres (Supabase) using DATABASE_URL.
// On Vercel, use Supabase's *transaction pooler* connection string (port 6543).
// If DATABASE_URL is not set, `sql` is null and the site falls back to the sample catalog.

const url = process.env.DATABASE_URL;

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
