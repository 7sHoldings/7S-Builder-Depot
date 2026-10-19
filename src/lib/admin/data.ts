import "server-only";
import { sql } from "../db";
import { PRODUCT_COLUMNS, rowToProduct, rowToVariant, VARIANT_COLUMNS, type ProductRow, type VariantRow } from "../products";
import type { AdminProduct } from "./types";

// Fresh (uncached) reads for the admin area. Includes hidden products and sizes.
// Callers must check requireAdmin() first.

function db() {
  if (!sql) throw new Error("DATABASE_URL is not set");
  return sql;
}

export async function adminProducts(slug?: string): Promise<AdminProduct[]> {
  const q = db();
  const where = slug ? q`where slug = ${slug}` : q``;
  const vwhere = slug ? q`where product_slug = ${slug}` : q``;
  const rows = await q<(ProductRow & { active: boolean; sort_order: number })[]>`
    select ${q.unsafe(PRODUCT_COLUMNS)}, active, sort_order from public.products ${where}
    order by category, sort_order, name`;
  const vrows = await q<(VariantRow & { active: boolean })[]>`
    select ${q.unsafe(VARIANT_COLUMNS)}, active from public.product_variants ${vwhere}
    order by product_slug, sort_order, id`;
  return rows.map((r) => ({
    ...rowToProduct(r),
    active: r.active,
    sortOrder: r.sort_order,
    variants: vrows.filter((v) => v.product_slug === r.slug).map((v) => ({ ...rowToVariant(v), active: v.active })),
  }));
}

export async function adminProduct(slug: string): Promise<AdminProduct | undefined> {
  return (await adminProducts(slug))[0];
}

export type AdminOrder = {
  id: number;
  order_number: string;
  status: string;
  customer_name: string;
  phone: string;
  email: string;
  fulfillment: "pickup" | "delivery";
  delivery_address: string | null;
  requested_date: string | null;
  payment_method: string;
  notes: string | null;
  subtotal: string;
  delivery_fee: string;
  tax: string;
  total: string;
  created_at: Date;
  items: { name: string; sku: string; quantity: number; unit_price: string; line_total: string; unit_label: string }[];
};

export async function adminOrders(status?: string): Promise<AdminOrder[]> {
  const q = db();
  const where = status ? q`where o.status = ${status}` : q``;
  return q<AdminOrder[]>`
    select o.id, o.order_number, o.status, o.customer_name, o.phone, o.email, o.fulfillment, o.delivery_address,
           o.requested_date, o.payment_method, o.notes, o.subtotal, o.delivery_fee, o.tax, o.total, o.created_at,
           coalesce((select json_agg(json_build_object('name', i.name, 'sku', i.sku, 'quantity', i.quantity,
                       'unit_price', i.unit_price, 'line_total', i.line_total, 'unit_label', i.unit_label) order by i.id)
                     from public.order_items i where i.order_id = o.id), '[]'::json) as items
    from public.orders o ${where}
    order by o.created_at desc
    limit 200`;
}

export type AdminQuote = {
  id: number;
  reference: string;
  status: string;
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  customer_type: string | null;
  materials: string[];
  area_sqft: string | null;
  door_window_count: number | null;
  timeline: string | null;
  zip: string | null;
  details: string | null;
  source: string;
  created_at: Date;
};

export async function adminQuotes(status?: string): Promise<AdminQuote[]> {
  const q = db();
  const where = status ? q`where status = ${status}` : q``;
  return q<AdminQuote[]>`
    select id, reference, status, name, company, phone, email, customer_type, materials, area_sqft, door_window_count,
           timeline, zip, details, source, created_at
    from public.quote_requests ${where}
    order by created_at desc
    limit 200`;
}

export async function statusCounts(table: "orders" | "quote_requests"): Promise<Record<string, number>> {
  const q = db();
  const rows = await q<{ status: string; n: number }[]>`select status, count(*)::int as n from ${q("public." + table)} group by status`;
  return Object.fromEntries(rows.map((r) => [r.status, r.n]));
}
