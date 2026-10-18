"use client";

import { useMemo, useState } from "react";
import { totalStock, type Product } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

export function CategoryBrowser({ types, products }: { types: string[]; products: Product[] }) {
  const [type, setType] = useState<string>("All");
  const [sort, setSort] = useState<Sort>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);

  const shown = useMemo(() => {
    const list = products.filter((p) => (type === "All" || p.type === type) && (!inStockOnly || totalStock(p) !== 0));
    const sorted = [...list];
    const price = (p: Product) => p.price ?? Number.POSITIVE_INFINITY;
    if (sort === "price-asc") sorted.sort((a, b) => price(a) - price(b));
    if (sort === "price-desc") sorted.sort((a, b) => price(b) - price(a));
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [products, type, sort, inStockOnly]);

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2.5">
          {(types.length > 1 ? ["All", ...types] : []).map((t) => {
            const on = t === type;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setType(t)}
                className={`h-11 border px-[18px] font-semibold ${on ? "border-night bg-night text-white" : "border-line-strong bg-surface text-ink hover:border-ink"}`}
              >
                {t === "All" ? "All" : t}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2.5 text-[15px]">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-[18px] w-[18px] accent-brand" />
            In stock only
          </label>
          <label className="flex items-center gap-2 text-[15px] font-semibold">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-11 border border-line-strong bg-surface px-3 font-normal">
              <option value="featured">Best match</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
      </div>

      <p className="mb-3.5 text-subtle" aria-live="polite">
        {shown.length} {shown.length === 1 ? "product" : "products"}
      </p>

      {shown.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {shown.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <div className="border border-line bg-surface p-10 text-center">
          <p className="mb-3 font-semibold">No products match these filters.</p>
          <button type="button" onClick={() => { setType("All"); setInStockOnly(false); }} className="font-semibold text-brand-dark underline">
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
