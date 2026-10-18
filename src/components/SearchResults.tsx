"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { categories, searchProducts } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

export function SearchResults() {
  const q = (useSearchParams().get("q") ?? "").trim();
  const results = searchProducts(q);

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
