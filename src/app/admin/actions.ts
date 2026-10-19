"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { categories, isCategoryId } from "@/lib/catalog";
import { requireAdmin } from "@/lib/admin/auth";
import { autoVariantLabel, ORDER_STATUSES, QUOTE_STATUSES, slugify, type EditorProduct } from "@/lib/admin/types";
import { sql } from "@/lib/db";

export type SaveResult = { ok: true; slug: string } | { ok: false; error: string };

class FormError extends Error {}

const IMAGE_PATH = /^\/(products\/[\w.-]+\.(jpg|jpeg|png|webp)|media\/[0-9a-f-]{36})$/i;

function text(v: unknown, label: string, { max = 200, required = false } = {}): string {
  const t = typeof v === "string" ? v.trim() : "";
  if (required && !t) throw new FormError(`${label} is required.`);
  if (t.length > max) throw new FormError(`${label} is too long (max ${max} characters).`);
  return t;
}

function money(v: unknown, label: string): number | null {
  const t = typeof v === "string" ? v.trim().replace(/[$,]/g, "") : "";
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) throw new FormError(`${label} must be a number like 189 or 1.99.`);
  return Math.round(n * 100) / 100;
}

function count(v: unknown, label: string): number | null {
  const t = typeof v === "string" ? v.trim() : "";
  if (!t) return null;
  const n = Number(t);
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000) throw new FormError(`${label} must be a whole number (0 or more).`);
  return n;
}

function measure(v: unknown, label: string): number | null {
  const t = typeof v === "string" ? v.trim().replace(/"/g, "") : "";
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0 || n > 10000) throw new FormError(`${label} must be a number of inches, like 30.`);
  return Math.round(n * 100) / 100;
}

function idPart(s: string) {
  return slugify(s).slice(0, 40) || "size";
}

function friendlyDbError(err: unknown): string | null {
  const e = err as { code?: string; constraint_name?: string; constraint?: string; detail?: string };
  const c = e.constraint_name ?? e.constraint ?? "";
  if (e.code === "23505") {
    if (c.includes("products_pkey")) return "A product with that web address already exists. Change the name or web address.";
    if (c.includes("products_sku")) return "Another product already uses that SKU.";
    if (c.includes("product_variants_sku")) return "Another size already uses one of these SKUs. Change the size SKUs.";
    return "Something in this product is a duplicate of another product (SKU or web address).";
  }
  if (e.code === "23514") return "One of the values isn't allowed. Check prices, stock and sizes.";
  return null;
}

export async function saveProduct(input: EditorProduct): Promise<SaveResult> {
  await requireAdmin();
  if (!sql) return { ok: false, error: "The database isn't connected." };
  const db = sql;
  const editing = !!input.originalSlug;
  const result = await save();
  // New products open on their own edit page once created
  if (result.ok && !editing) redirect(`/admin/products/${result.slug}?created=1`);
  return result;

  async function save(): Promise<SaveResult> {
    try {
      const slug = editing ? input.originalSlug! : slugify(text(input.slug, "Web address") || text(input.name, "Name"));
      if (!/^[a-z0-9-]{2,80}$/.test(slug)) throw new FormError("Web address can only use lowercase letters, numbers and dashes.");

      const name = text(input.name, "Name", { required: true, max: 120 });
      const sku = text(input.sku, "SKU", { required: true, max: 40 }).toUpperCase();
      if (!isCategoryId(input.category)) throw new FormError("Pick a category.");
      const category = input.category;
      const type = text(input.type, "Type", { required: true, max: 60 });
      const price = money(input.price, "Price");
      const priceNote = price == null ? text(input.priceNote, "Price note", { max: 60 }) || "Price on request" : null;
      const unit = input.unit === "sqft" ? "sqft" : "each";
      const sqftPerBox = unit === "sqft" ? measure(input.sqftPerBox, "Sq ft per box") : null;
      if (unit === "sqft" && sqftPerBox == null) throw new FormError("Enter the square feet in one box (needed for the flooring calculator).");
      const summary = text(input.summary, "Short summary", { max: 200 });
      const description = text(input.description, "Description", { max: 4000 });
      const specs = (Array.isArray(input.specs) ? input.specs : [])
        .map(([k, v]) => [text(k, "Spec name", { max: 80 }), text(v, "Spec value", { max: 300 })] as [string, string])
        .filter(([k, v]) => k || v);
      if (specs.length > 40) throw new FormError("Too many specifications (max 40).");
      if (specs.some(([k, v]) => !k || !v)) throw new FormError("Each specification needs both a name and a value.");
      const images = (Array.isArray(input.images) ? input.images : []).filter((u) => typeof u === "string" && IMAGE_PATH.test(u));
      if (images.length > 12) throw new FormError("Up to 12 photos per product.");
      const featured = !!input.featured;
      const active = !!input.active;
      const sortOrder = count(input.sortOrder, "Sort order") ?? 0;

      // ---------- sizes
      const rawVariants = Array.isArray(input.variants) ? input.variants : [];
      if (rawVariants.length > 200) throw new FormError("Up to 200 sizes per product.");
      const variants = rawVariants.map((v, i) => {
        const row = `Size row ${i + 1}`;
        const widthIn = measure(v.widthIn, `${row}: width`);
        const heightIn = measure(v.heightIn, `${row}: height`);
        const swing = v.swing === "RH" || v.swing === "LH" ? v.swing : null;
        const label =
          text(v.label, `${row}: label`, { max: 80 }) ||
          autoVariantLabel({ widthIn: widthIn == null ? "" : String(widthIn), heightIn: heightIn == null ? "" : String(heightIn), swing: swing ?? "" });
        if (!label) throw new FormError(`${row}: enter a label or a width and height.`);
        const image = typeof v.image === "string" && IMAGE_PATH.test(v.image) ? v.image : null;
        return {
          id: typeof v.id === "string" && /^[a-z0-9-]+$/.test(v.id) ? v.id : undefined,
          sku: text(v.sku, `${row}: SKU`, { max: 50 }).toUpperCase(),
          label,
          widthIn,
          heightIn,
          swing,
          stock: count(v.stock, `${row}: stock`),
          price: money(v.price, `${row}: price`),
          image,
          active: v.active !== false,
        };
      });
      if (variants.some((v) => v.swing) && variants.some((v) => v.widthIn == null || v.heightIn == null)) {
        throw new FormError("Doors with a swing need a width and height on every size row.");
      }
      const labels = new Set<string>();
      for (const v of variants) {
        const k = v.label.toLowerCase();
        if (labels.has(k)) throw new FormError(`Two sizes have the same label: “${v.label}”.`);
        labels.add(k);
      }
      // Products with sizes keep stock per size
      const stock = variants.length ? null : count(input.stock, "Stock");

      await db.begin(async (tx) => {
        // Lock the row (or make sure the slug is free) before writing
        const existing = await tx<{ slug: string }[]>`select slug from public.products where slug = ${slug} for update`;
        if (!editing && existing.length) throw new FormError("A product with that web address already exists. Change the name or web address.");
        if (editing && !existing.length) throw new FormError("This product no longer exists.");

        const visual = categories.find((c) => c.id === category)!.visual;
        if (editing) {
          await tx`
          update public.products set
            sku = ${sku}, name = ${name}, category = ${category}, type = ${type}, price = ${price}, price_note = ${priceNote},
            unit = ${unit}, sqft_per_box = ${sqftPerBox}, summary = ${summary}, description = ${description},
            specs = ${tx.json(specs)}, images = ${images}, stock = ${stock}, featured = ${featured}, active = ${active},
            sort_order = ${sortOrder}
          where slug = ${slug}`;
        } else {
          await tx`
          insert into public.products
            (slug, sku, name, category, type, price, price_note, unit, sqft_per_box, summary, description, specs, visual,
             images, stock, featured, active, sort_order)
          values
            (${slug}, ${sku}, ${name}, ${category}, ${type}, ${price}, ${priceNote}, ${unit}, ${sqftPerBox}, ${summary},
             ${description}, ${tx.json(specs)}, ${tx.json(visual)}, ${images}, ${stock}, ${featured}, ${active}, ${sortOrder})`;
        }

        // Sizes: keep ids of existing rows, create ids for new ones, delete rows that were removed
        const mine = new Set((await tx<{ id: string }[]>`select id from public.product_variants where product_slug = ${slug}`).map((r) => r.id));
        const kept = variants.filter((v) => v.id && mine.has(v.id)).map((v) => v.id!);
        if (kept.length) {
          await tx`delete from public.product_variants where product_slug = ${slug} and id not in ${tx(kept)}`;
        } else {
          await tx`delete from public.product_variants where product_slug = ${slug}`;
        }
        const taken = new Set(kept);
        for (const [i, v] of variants.entries()) {
          let id = v.id && mine.has(v.id) ? v.id : undefined;
          if (!id) {
            const base = `${slug}-${idPart(v.widthIn && v.heightIn ? `${v.widthIn}x${v.heightIn}${v.swing ? `-${v.swing}` : ""}` : v.label)}`.slice(0, 110);
            id = base;
            for (let n = 2; taken.has(id) || (await tx`select 1 from public.product_variants where id = ${id}`).length; n++) id = `${base}-${n}`;
          }
          taken.add(id);
          const vsku = v.sku || `${sku}-${idPart(id.slice(slug.length + 1) || String(i + 1)).toUpperCase()}`.slice(0, 60);
          await tx`
          insert into public.product_variants
            (id, product_slug, sku, label, width_in, height_in, swing, stock, price, image, sort_order, active)
          values
            (${id}, ${slug}, ${vsku}, ${v.label}, ${v.widthIn}, ${v.heightIn}, ${v.swing}, ${v.stock}, ${v.price}, ${v.image}, ${i}, ${v.active})
          on conflict (id) do update set
            sku = excluded.sku, label = excluded.label, width_in = excluded.width_in, height_in = excluded.height_in,
            swing = excluded.swing, stock = excluded.stock, price = excluded.price, image = excluded.image,
            sort_order = excluded.sort_order, active = excluded.active`;
        }
      });

      updateTag("products");
      return { ok: true, slug };
    } catch (err) {
      if (err instanceof FormError) return { ok: false, error: err.message };
      const friendly = friendlyDbError(err);
      if (friendly) return { ok: false, error: friendly };
      console.error("[admin] saveProduct failed", err);
      return { ok: false, error: "Couldn't save the product. Please try again." };
    }
  }
}

export async function setProductActive(slug: string, active: boolean): Promise<void> {
  await requireAdmin();
  if (!sql) return;
  await sql`update public.products set active = ${active} where slug = ${slug}`;
  updateTag("products");
}

export async function deleteProduct(slug: string): Promise<SaveResult> {
  await requireAdmin();
  if (!sql) return { ok: false, error: "The database isn't connected." };
  // Past orders keep their own copy of the name, SKU and price, so they stay intact.
  await sql`delete from public.products where slug = ${slug}`;
  updateTag("products");
  return { ok: true, slug };
}

export async function setOrderStatus(id: number, status: string): Promise<void> {
  await requireAdmin();
  if (!sql || !(ORDER_STATUSES as readonly string[]).includes(status)) return;
  await sql`update public.orders set status = ${status} where id = ${id}`;
}

export async function setQuoteStatus(id: number, status: string): Promise<void> {
  await requireAdmin();
  if (!sql || !(QUOTE_STATUSES as readonly string[]).includes(status)) return;
  await sql`update public.quote_requests set status = ${status} where id = ${id}`;
}
