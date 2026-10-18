import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { searchIn, seedProducts, type CategoryId, type ColorOption, type Product, type Visual } from "./catalog";
import { sql } from "./db";

// Product reads for the website. Results are cached for up to an hour
// (tag "products"), so the database isn't hit on every page view.
// After editing products in Supabase, changes appear within the hour,
// or immediately after a redeploy.

type ProductRow = {
  slug: string;
  sku: string;
  name: string;
  category: CategoryId;
  type: string;
  price: string;
  unit: "sqft" | "each";
  sqft_per_box: string | null;
  summary: string;
  description: string;
  specs: [string, string][];
  colors: ColorOption[] | null;
  visual: Visual;
  image_url: string | null;
  stock: number;
  featured: boolean;
};

export function rowToProduct(r: ProductRow): Product {
  return {
    slug: r.slug,
    sku: r.sku,
    name: r.name,
    category: r.category,
    type: r.type,
    price: Number(r.price),
    unit: r.unit,
    sqftPerBox: r.sqft_per_box == null ? undefined : Number(r.sqft_per_box),
    summary: r.summary,
    description: r.description,
    specs: r.specs ?? [],
    colors: r.colors ?? undefined,
    visual: r.visual,
    imageUrl: r.image_url ?? undefined,
    stock: r.stock,
    featured: r.featured,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  if (!sql) return seedProducts;
  try {
    const rows = await sql<ProductRow[]>`
      select slug, sku, name, category, type, price, unit, sqft_per_box, summary, description,
             specs, colors, visual, image_url, stock, featured
      from public.products
      where active
      order by category, sort_order, name`;
    return rows.map(rowToProduct);
  } catch (err) {
    console.error("[products] Database read failed — showing sample catalog instead.", err);
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
