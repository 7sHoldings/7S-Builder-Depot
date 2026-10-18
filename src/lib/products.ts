import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { searchIn, seedProducts, type CategoryId, type ColorOption, type Product, type Variant, type Visual } from "./catalog";
import { sql } from "./db";

// Product reads for the website. Results are cached briefly (cacheLife "minutes":
// refreshed in the background about once a minute), so edits made in the Supabase
// Table Editor show up on the site within a minute or two.

export type ProductRow = {
  slug: string;
  sku: string;
  name: string;
  category: CategoryId;
  type: string;
  price: string | null;
  price_note: string | null;
  unit: "sqft" | "each";
  sqft_per_box: string | null;
  summary: string;
  description: string;
  specs: [string, string][];
  colors: ColorOption[] | null;
  visual: Visual;
  images: string[] | null;
  stock: number | null;
  featured: boolean;
};

export type VariantRow = {
  id: string;
  product_slug: string;
  sku: string;
  label: string;
  width_in: string | null;
  height_in: string | null;
  swing: "RH" | "LH" | null;
  stock: number | null;
  price: string | null;
  image: string | null;
};

const num = (v: string | null) => (v == null ? undefined : Number(v));

export function rowToVariant(r: VariantRow): Variant {
  return {
    id: r.id,
    sku: r.sku,
    label: r.label,
    widthIn: num(r.width_in),
    heightIn: num(r.height_in),
    swing: r.swing ?? undefined,
    stock: r.stock,
    price: num(r.price),
    image: r.image ?? undefined,
  };
}

export function rowToProduct(r: ProductRow, variants: Variant[] = []): Product {
  return {
    slug: r.slug,
    sku: r.sku,
    name: r.name,
    category: r.category,
    type: r.type,
    price: r.price == null ? null : Number(r.price),
    priceNote: r.price_note ?? undefined,
    unit: r.unit,
    sqftPerBox: num(r.sqft_per_box),
    summary: r.summary,
    description: r.description,
    specs: r.specs ?? [],
    colors: r.colors ?? undefined,
    visual: r.visual,
    images: r.images ?? [],
    stock: r.stock,
    featured: r.featured,
    variants,
  };
}

export const PRODUCT_COLUMNS = `slug, sku, name, category, type, price, price_note, unit, sqft_per_box, summary, description,
  specs, colors, visual, images, stock, featured`;
export const VARIANT_COLUMNS = `id, product_slug, sku, label, width_in, height_in, swing, stock, price, image`;

export async function getAllProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  if (!sql) return seedProducts;
  try {
    const rows = await sql<ProductRow[]>`select ${sql.unsafe(PRODUCT_COLUMNS)} from public.products where active order by category, sort_order, name`;
    const vrows = await sql<VariantRow[]>`select ${sql.unsafe(VARIANT_COLUMNS)} from public.product_variants where active order by product_slug, sort_order`;
    const bySlug = new Map<string, Variant[]>();
    for (const v of vrows) {
      if (!bySlug.has(v.product_slug)) bySlug.set(v.product_slug, []);
      bySlug.get(v.product_slug)!.push(rowToVariant(v));
    }
    return rows.map((r) => rowToProduct(r, bySlug.get(r.slug) ?? []));
  } catch (err) {
    console.error("[products] Database read failed — showing built-in catalog instead.", err);
    return seedProducts;
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getAllProducts()).find((p) => p.slug === slug);
}

export async function getProductsIn(category: CategoryId): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.category === category);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.featured).slice(0, 4);
}

export async function searchProducts(query: string): Promise<Product[]> {
  return searchIn(await getAllProducts(), query);
}
