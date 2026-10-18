import { connection } from "next/server";
import { describeDbUrl, sql } from "@/lib/db";

// GET /api/health — shows whether the website can reach the database.
// Safe to share: it never shows the password or connection string.

const hints: Record<string, string> = {
  "28P01": "Wrong database password. Reset it in Supabase and update DATABASE_URL in Vercel.",
  ENOTFOUND: "The database host name couldn't be found. Copy the Transaction pooler string from Supabase again.",
  ENETUNREACH: "Vercel can't reach this address. Use Supabase's Transaction pooler string (port 6543), not the direct one.",
  EHOSTUNREACH: "Vercel can't reach this address. Use Supabase's Transaction pooler string (port 6543), not the direct one.",
  ETIMEDOUT: "Connection timed out. Use Supabase's Transaction pooler string (port 6543).",
  CONNECT_TIMEOUT: "Connection timed out. Use Supabase's Transaction pooler string (port 6543).",
  ECONNREFUSED: "Connection refused. Check the port is 6543 (Transaction pooler).",
  "42P01": "Connected, but the tables are missing. Run supabase/migrations/…_init.sql.",
};

export async function GET() {
  await connection(); // always check live, never at build time
  const target = describeDbUrl();
  if (!sql) {
    return Response.json({ database: "not_configured", hint: "Add DATABASE_URL in Vercel → Settings → Environment Variables, then redeploy." }, { status: 503 });
  }
  try {
    const [row] = await sql`select count(*)::int as products from public.products where active`;
    return Response.json({ database: "connected", products: row.products, target });
  } catch (err) {
    const code = (err as { code?: string }).code ?? "unknown";
    return Response.json(
      {
        database: "error",
        code,
        target,
        hint:
          hints[code] ??
          (target?.kind === "direct"
            ? "DATABASE_URL points at the direct connection. Use Supabase's Transaction pooler string (port 6543)."
            : "Check DATABASE_URL in Vercel."),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
