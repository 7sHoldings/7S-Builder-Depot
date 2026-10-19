import { cookies } from "next/headers";
import { ADMIN_COOKIE, tokenIsValid } from "@/lib/admin/auth";
import { sql } from "@/lib/db";

// POST /api/admin/images — upload one product photo (admin only).
// The admin page shrinks photos in the browser first, so they are usually well under 1 MB.

const MAX_BYTES = 4 * 1024 * 1024;

function sniff(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50)
    return "image/webp";
  return null;
}

export async function POST(request: Request) {
  if (!tokenIsValid((await cookies()).get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  }
  if (!sql) return Response.json({ error: "The database isn't connected." }, { status: 503 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Upload failed. Please try again." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof Blob) || file.size === 0) return Response.json({ error: "No photo was received." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "That photo is too large (max 4 MB)." }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type) return Response.json({ error: "Please upload a JPG, PNG or WebP photo." }, { status: 400 });
  const dim = (k: string) => {
    const n = Number(form.get(k));
    return Number.isInteger(n) && n > 0 && n < 20000 ? n : null;
  };

  try {
    const [row] = await sql<{ id: string }[]>`
      insert into public.media (content_type, bytes, size, width, height)
      values (${type}, ${Buffer.from(bytes)}, ${bytes.length}, ${dim("width")}, ${dim("height")})
      returning id`;
    return Response.json({ url: `/media/${row.id}` });
  } catch (err) {
    console.error("[admin] image upload failed", err);
    return Response.json({ error: "Couldn't save the photo. Has the database update been run?" }, { status: 500 });
  }
}
