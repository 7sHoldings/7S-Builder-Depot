"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/catalog";

type Row = { slug: string; style: string; w: number; h: number; core: string; hinges: string; rh: number; lh: number };

/** "Sizes in stock" table for the doors page: RH / LH counts per size. */
export function DoorStockTable({ products }: { products: Product[] }) {
  const [height, setHeight] = useState<"all" | 80 | 96>("all");

  const rows: Row[] = products.flatMap((p) => {
    const spec = (k: string) => p.specs.find(([key]) => key === k)?.[1] ?? "";
    const sizes = new Map<string, Row>();
    for (const v of p.variants) {
      if (v.widthIn == null || v.heightIn == null) continue;
      const key = `${v.widthIn}x${v.heightIn}`;
      if (!sizes.has(key))
        sizes.set(key, { slug: p.slug, style: p.type, w: v.widthIn, h: v.heightIn, core: spec("Core"), hinges: spec("Hinges").replace("black hinges, ", "× "), rh: 0, lh: 0 });
      const r = sizes.get(key)!;
      if (v.swing === "RH") r.rh += v.stock ?? 0;
      if (v.swing === "LH") r.lh += v.stock ?? 0;
    }
    return [...sizes.values()];
  });
  const shown = rows.filter((r) => height === "all" || r.h === height).sort((a, b) => a.style.localeCompare(b.style) || a.h - b.h || a.w - b.w);
  const total = rows.reduce((n, r) => n + r.rh + r.lh, 0);

  return (
    <section className="mt-14" aria-labelledby="stock-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="stock-title" className="font-display text-[36px] font-bold uppercase leading-none">
            Sizes in stock
          </h2>
          <p className="mt-1.5 text-muted">{total} doors in stock. RH = right-hand, LH = left-hand.</p>
        </div>
        <div role="group" aria-label="Filter by height" className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All heights"],
              [80, `6'8" (80")`],
              [96, `8' (96")`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={height === id}
              onClick={() => setHeight(id)}
              className={`h-11 border px-4 font-semibold ${height === id ? "border-night bg-night text-white" : "border-line-strong bg-surface text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto border border-line bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-[15px]">
          <thead>
            <tr className="bg-night text-left text-white">
              <th scope="col" className="px-4 py-3 font-semibold">Style</th>
              <th scope="col" className="px-4 py-3 font-semibold">Size (W × H)</th>
              <th scope="col" className="px-4 py-3 font-semibold">Core</th>
              <th scope="col" className="px-4 py-3 font-semibold">Hinges</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">RH</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">LH</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">In stock</th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Shop</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={`${r.slug}-${r.w}x${r.h}`} className="border-t border-[#eeece7]">
                <td className="px-4 py-3 font-semibold">{r.style}</td>
                <td className="px-4 py-3">
                  {r.w}&quot; × {r.h}&quot;
                </td>
                <td className="px-4 py-3 text-muted">{r.core}</td>
                <td className="px-4 py-3 text-muted">{r.hinges}</td>
                <td className="px-4 py-3 text-right">{r.rh}</td>
                <td className="px-4 py-3 text-right">{r.lh}</td>
                <td className="px-4 py-3 text-right font-semibold">{r.rh + r.lh}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/product/${r.slug}`} className="font-semibold text-brand-dark">
                    Shop
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
