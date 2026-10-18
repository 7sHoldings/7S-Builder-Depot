import { after } from "next/server";
import { unitLabel, unitPrice, type ColorOption, type Visual } from "@/lib/catalog";
import { sql } from "@/lib/db";
import { money } from "@/lib/money";
import { notifyStore } from "@/lib/notify";
import { rowToProduct } from "@/lib/products";
import { fullAddress } from "@/lib/site";
import { orderTotals } from "@/lib/totals";
import { asObject, email, InputError, int, isBot, oneOf, phone, requiredStr, str } from "@/lib/validate";

// POST /api/orders — saves an order. Prices always come from the database,
// never from the browser.

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
    const name = requiredStr(body, "name", 120);
    const tel = phone(body, "phone");
    const mail = email(body, "email", true)!;
    const fulfillment = oneOf(body, "fulfillment", ["pickup", "delivery"] as const);
    const address = fulfillment === "delivery" ? requiredStr(body, "address", 300) : undefined;
    const date = str(body, "date", { max: 40 });
    const payment = oneOf(body, "payment", ["Pay at pickup", "Pay on delivery", "Pro account invoice"] as const);
    const notes = str(body, "notes", { max: 1000 });

    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
      throw new InputError("Your cart is empty.");
    }
    const wanted = body.items.map((raw) => {
      const i = asObject(raw);
      return {
        slug: requiredStr(i, "slug", 120),
        qty: int(i, "qty", { min: 1, max: 999 }) ?? 1,
        color: str(i, "color", { max: 60 }),
      };
    });

    const slugs = [...new Set(wanted.map((w) => w.slug))];
    const rows = await sql`
      select slug, sku, name, category, type, price, unit, sqft_per_box, summary, description,
             specs, colors, visual, image_url, stock, featured
      from public.products where active and slug in ${sql(slugs)}`;
    const bySlug = new Map(
      rows.map((r) => {
        const p = rowToProduct(r as Parameters<typeof rowToProduct>[0]);
        return [p.slug, p] as const;
      }),
    );

    const lines = wanted.map((w) => {
      const p = bySlug.get(w.slug);
      if (!p) throw new InputError("One of the products in your cart is no longer available. Please review your cart.");
      const color = w.color && (p.colors as ColorOption[] | undefined)?.some((c) => c.name === w.color) ? w.color : undefined;
      const price = unitPrice(p);
      return {
        slug: p.slug,
        sku: p.sku,
        name: p.name + (color ? ` — ${color}` : ""),
        color,
        unitLabel: unitLabel(p),
        unitPrice: price,
        qty: w.qty,
        lineTotal: Math.round(price * w.qty * 100) / 100,
        visual: p.visual as Visual,
      };
    });

    const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
    const t = orderTotals(subtotal, fulfillment);

    const orderNumber = await sql.begin(async (tx) => {
      const [order] = await tx`
        insert into public.orders
          (customer_name, phone, email, fulfillment, delivery_address, requested_date,
           payment_method, notes, subtotal, delivery_fee, tax, total)
        values
          (${name}, ${tel}, ${mail}, ${fulfillment}, ${address ?? null}, ${date ?? null},
           ${payment}, ${notes ?? null}, ${t.subtotal}, ${t.delivery}, ${t.tax}, ${t.total})
        returning id, order_number`;
      await tx`
        insert into public.order_items ${tx(
          lines.map((l) => ({
            order_id: order.id,
            product_slug: l.slug,
            sku: l.sku,
            name: l.name,
            color: l.color ?? null,
            unit_label: l.unitLabel,
            unit_price: l.unitPrice,
            quantity: l.qty,
            line_total: l.lineTotal,
          })),
        )}`;
      return order.order_number as string;
    });

    after(() =>
      notifyStore(
        `New order ${orderNumber} — ${name} — ${money(t.total)}`,
        [
          `Order ${orderNumber}`,
          `${name} · ${tel} · ${mail}`,
          fulfillment === "delivery" ? `Delivery to: ${address}` : `Store pickup (${fullAddress})`,
          `Requested date: ${date ?? "—"}`,
          `Payment: ${payment}`,
          notes ? `Notes: ${notes}` : "",
          "",
          ...lines.map((l) => `${l.qty} × ${l.name} (SKU ${l.sku}) — ${money(l.lineTotal)}`),
          "",
          `Subtotal ${money(t.subtotal)} · Delivery ${money(t.delivery)} · Tax ${money(t.tax)} · Total ${money(t.total)}`,
        ],
        mail,
      ),
    );

    return Response.json({
      orderNumber,
      ...t,
      lines: lines.map((l) => ({ name: l.name, sku: l.sku, qty: l.qty, lineTotal: l.lineTotal })),
    });
  } catch (err) {
    if (err instanceof InputError) return Response.json({ error: err.message }, { status: 400 });
    console.error("[orders] Failed to save order", err);
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
