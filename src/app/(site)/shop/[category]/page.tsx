import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { DoorStockTable } from "@/components/DoorStockTable";
import { categories, getCategory, isCategoryId } from "@/lib/catalog";
import { getProductsIn } from "@/lib/products";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  return c ? { title: c.name, description: c.intro } : {};
}

const highlights: Record<string, [string, string][]> = {
  doors: [
    ["Fully assembled prehung", "Hung in the frame — set it and go"],
    ["Casing included", "Slab + jamb/frame + casing + hinges"],
    ['1-3/8" (35 mm) slab', "Standard interior thickness"],
    ["4 black hinges", '3.5" or 4" depending on door'],
  ],
  windows: [
    ["Low-E tempered glass", "Argon filled for energy savings"],
    ["Nail flange", "Ready for new construction"],
    ["Black exterior / white interior", "82 series American-style PVC"],
    ["Screens included", "On single hung, sliding & casement"],
  ],
  vinyl: [
    ["$1.99 per sq ft", "Same price on every color"],
    ["Waterproof", "Kitchens, baths and basements"],
    ["Click-lock install", "Floats over most floors"],
    ["Room calculator", "Know how many boxes to buy"],
  ],
};

export default function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-[70vh] max-w-[1280px] px-4 pt-6 text-muted sm:px-6">Loading…</div>}>
      <Category params={params} />
    </Suspense>
  );
}

async function Category({ params }: Pick<PageProps<"/shop/[category]">, "params">) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c || !isCategoryId(category)) notFound();
  const products = await getProductsIn(c.id);
  const points = highlights[c.id];
  // Filter buttons: the category's usual types first, then any new types added in the admin area
  const types = [...new Set([...c.types, ...products.map((p) => p.type)])].filter((t) => products.some((p) => p.type === t));

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-[72px] pt-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-subtle">
        <Link href="/" className="text-subtle">
          Home
        </Link>{" "}
        / <span className="text-ink">{c.name}</span>
      </nav>
      <h1 className="font-display text-[48px] font-bold uppercase leading-none sm:text-[56px]">{c.name}</h1>
      <p className="mb-6 mt-2 max-w-[680px] text-[17px] text-muted">{c.id === "tile" && products.length ? "Floor and wall tile — call or request a quote for project quantities." : c.intro}</p>

      {points && (
        <ul className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-px border border-line bg-line">
          {points.map(([t, s]) => (
            <li key={t} className="bg-surface px-[18px] py-4">
              <div className="font-semibold">{t}</div>
              <div className="text-sm text-muted">{s}</div>
            </li>
          ))}
        </ul>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-start gap-4 border border-line bg-surface p-8">
          <span className="font-display text-[32px] font-bold uppercase leading-none">{c.name} — coming soon</span>
          <p className="max-w-[560px] text-muted">
            We&apos;re adding {c.name.toLowerCase()} to the store. Tell us what you&apos;re looking for and we&apos;ll help you source it.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/quote?cat=${c.id}`} className="inline-flex h-[50px] items-center bg-brand px-6 font-semibold text-white no-underline hover:bg-brand-dark hover:text-white">
              Request a quote
            </Link>
            <a href={site.phoneHref} className="inline-flex h-[50px] items-center border-2 border-ink px-6 font-semibold text-ink no-underline">
              Call {site.phone}
            </a>
          </div>
        </div>
      ) : (
        <CategoryBrowser types={types} products={products} />
      )}

      {c.id === "doors" && products.length > 0 && <DoorStockTable products={products} />}
    </div>
  );
}
