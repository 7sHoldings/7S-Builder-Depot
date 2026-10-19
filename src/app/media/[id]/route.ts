import { connection } from "next/server";
import { sql } from "@/lib/db";

// GET /media/<id> — product photos uploaded in the admin area.
// Photos never change once uploaded (a new upload gets a new id), so browsers and
// Vercel's CDN can keep them for a year.

export async function GET(_request: Request, ctx: RouteContext<"/media/[id]">) {
  await connection();
  const { id } = await ctx.params;
  if (!sql || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const [row] = await sql<{ content_type: string; bytes: Buffer }[]>`select content_type, bytes from public.media where id = ${id}`;
    if (!row) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(row.bytes), {
      headers: {
        "Content-Type": row.content_type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[media] read failed", err);
    return new Response("Error", { status: 500 });
  }
}
