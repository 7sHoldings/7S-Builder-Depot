import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/lib/catalog";
import { searchProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-[72px] pt-8 sm:px-6">
      <Suspense fallback={<p className="text-muted">Searching…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw ?? "").trim().slice(0, 100);
  const results = q ? await searchProducts(q) : [];

  return (
    <>
      <h1 className="mb-2 font-display text-[44px] font-bold uppercase leading-none">{q ? <>Results for “{q}”</> : "Search"}</h1>
      <p className="mb-7 text-subtle" aria-live="polite">
        {q ? `${results.length} ${results.length === 1 ? "product" : "products"} found` : "Type a product name or SKU in the search box."}
      </p>
      {results.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          {results.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <div className="border border-line bg-surface p-8">
          <p className="mb-3 font-semibold">{q ? "No matches. Try a shorter search, or browse a category:" : "Browse a category:"}</p>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link key={c.id} href={`/shop/${c.id}`} className="inline-flex h-11 items-center border-2 border-ink px-5 font-semibold text-ink no-underline">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
