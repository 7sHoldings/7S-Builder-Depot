import { after } from "next/server";
import { categories } from "@/lib/catalog";
import { sql } from "@/lib/db";
import { notifyStore } from "@/lib/notify";
import { asObject, email, InputError, int, isBot, oneOf, phone, requiredStr, str } from "@/lib/validate";

// POST /api/quotes — saves a quote request from the quote page or the home page form.

const materialNames = new Map(categories.map((c) => [c.id, c.name] as const));

export async function POST(request: Request) {
  if (!sql) return Response.json({ error: "not_configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = asObject(await request.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (isBot(body)) return Response.json({ error: "Invalid request." }, { status: 400 });

  try {
    const source = oneOf(body, "source", ["quote_form", "home_page"] as const, "quote_form");
    const name = requiredStr(body, "name", 120);
    const tel = phone(body, "phone");
    const mail = email(body, "email", source === "quote_form");
    const company = str(body, "company", { max: 120 });
    const customerType = str(body, "customerType", { max: 40 });
    const materials = Array.isArray(body.materials)
      ? body.materials.filter((m): m is string => typeof m === "string" && materialNames.has(m as never)).slice(0, 4)
      : [];
    const area = int(body, "area", { min: 0, max: 1_000_000 });
    const count = int(body, "count", { min: 0, max: 10_000 });
    const timeline = str(body, "timeline", { max: 40 });
    const zip = str(body, "zip", { max: 10 });
    const details = str(body, "details", { max: 4000 });

    const [row] = await sql`
      insert into public.quote_requests
        (name, company, phone, email, customer_type, materials, area_sqft, door_window_count,
         timeline, zip, details, source)
      values
        (${name}, ${company ?? null}, ${tel}, ${mail ?? null}, ${customerType ?? null}, ${materials},
         ${area ?? null}, ${count ?? null}, ${timeline ?? null}, ${zip ?? null}, ${details ?? null}, ${source})
      returning reference`;
    const reference = row.reference as string;

    const materialList = materials.map((m) => materialNames.get(m as never)).join(", ") || "—";
    after(() =>
      notifyStore(
        `Quote request ${reference} — ${name} (${materialList})`,
        [
          `Quote request ${reference}`,
          `${name}${company ? ` · ${company}` : ""} · ${tel}${mail ? ` · ${mail}` : ""}`,
          customerType ? `Customer type: ${customerType}` : "",
          `Materials: ${materialList}`,
          area != null ? `Area: ${area} sq ft` : "",
          count != null ? `Doors / windows: ${count}` : "",
          timeline ? `Timeline: ${timeline}` : "",
          zip ? `ZIP: ${zip}` : "",
          "",
          details ?? "",
        ],
        mail,
      ),
    );

    return Response.json({ reference });
  } catch (err) {
    if (err instanceof InputError) return Response.json({ error: err.message }, { status: 400 });
    console.error("[quotes] Failed to save quote request", err);
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
