"use client";

import Link from "next/link";
import { useState } from "react";
import { cartSnapshot, priceLabel, unitLabel, unitPrice, type Product } from "@/lib/catalog";
import { money } from "@/lib/money";
import { site } from "@/lib/site";
import { AddToCartButton } from "./AddToCartButton";
import { CheckIcon, RulerIcon } from "./Icons";
import { ProductVisual } from "./ProductVisual";
import { QtyStepper } from "./QtyStepper";

export function ProductDetail({ product }: { product: Product }) {
  const [colorIdx, setColorIdx] = useState(0);
  const color = product.colors?.[colorIdx];
  const isCoverage = product.unit === "sqft" && !!product.sqftPerBox;

  // Coverage calculator (flooring & tile)
  const [len, setLen] = useState("12");
  const [wid, setWid] = useState("10");
  const [waste, setWaste] = useState(true);
  const area = Math.max(0, (parseFloat(len) || 0) * (parseFloat(wid) || 0));
  // Round to cents first so 180 × 1.1 gives 198, not 198.00000000000003 → 199
  const needed = Math.ceil(Math.round(area * (waste ? 1.1 : 1) * 100) / 100);
  const boxes = isCoverage && needed > 0 ? Math.ceil(needed / product.sqftPerBox!) : 1;

  // Quantity follows the calculator until the shopper changes it by hand.
  const [manualQty, setManualQty] = useState<number | null>(null);
  const qty = manualQty ?? (isCoverage ? Math.max(1, boxes) : 1);
  const each = unitPrice(product);

  const name = color ? `${product.name.split(" — ")[0]} — ${color.name}` : product.name;

  return (
    <div className="flex flex-wrap items-start gap-12">
      <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-3">
        <ProductVisual
          visual={product.visual}
          label={`${name} — illustration`}
          colorOverride={color?.hex}
          className="aspect-[4/3] border border-line"
        />
        <p className="text-sm text-subtle">Illustration shown. Product photos coming soon.</p>
      </div>

      <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-subtle">
            {product.type} · SKU {product.sku}
          </span>
          <h1 className="font-display text-[40px] font-bold uppercase leading-none sm:text-[48px]">{name}</h1>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
            <span className="font-display text-[40px] font-bold">{money(product.price)}</span>
            <span className="text-subtle">
              {priceLabel(product) ? `per sq ft · ${money(each)} ${unitLabel(product)}` : "each"}
            </span>
          </div>
          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-2 font-semibold text-ok">
              <CheckIcon size={18} /> In stock · {product.stock} {product.unit === "sqft" ? "boxes" : "units"} ready for pickup in {site.address.city}
            </span>
          ) : (
            <span className="font-semibold text-brand-dark">Special order — call for lead time</span>
          )}
          <p className="mt-2 text-muted">{product.description}</p>
        </div>

        {product.colors && (
          <fieldset>
            <legend className="mb-2.5 font-semibold">Color: {color?.name}</legend>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  aria-label={c.name}
                  aria-pressed={i === colorIdx}
                  onClick={() => setColorIdx(i)}
                  className={`h-12 w-12 ${i === colorIdx ? "outline outline-[3px] outline-offset-2 outline-ink" : "border border-line-strong"}`}
                  style={{
                    backgroundColor: c.hex,
                    backgroundImage: "repeating-linear-gradient(90deg, transparent 0 14px, rgba(0,0,0,0.1) 14px 15px)",
                  }}
                />
              ))}
            </div>
          </fieldset>
        )}

        {isCoverage && (
          <section aria-labelledby="calc-title" className="flex flex-col gap-4 border border-line bg-surface p-5">
            <div className="flex items-center gap-2.5">
              <RulerIcon size={24} className="text-brand" />
              <h2 id="calc-title" className="font-display text-[26px] font-bold uppercase">
                How much do I need?
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                Room length (ft)
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={len}
                  onChange={(e) => {
                    setLen(e.target.value);
                    setManualQty(null);
                  }}
                  className="h-12 border border-line-strong px-3 text-lg font-normal"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                Room width (ft)
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={wid}
                  onChange={(e) => {
                    setWid(e.target.value);
                    setManualQty(null);
                  }}
                  className="h-12 border border-line-strong px-3 text-lg font-normal"
                />
              </label>
            </div>
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={waste}
                onChange={(e) => {
                  setWaste(e.target.checked);
                  setManualQty(null);
                }}
                className="h-[18px] w-[18px] accent-brand"
              />
              Add 10% for cuts &amp; waste
            </label>
            <div className="grid grid-cols-2 gap-px border border-line bg-line" aria-live="polite">
              <div className="bg-ground px-4 py-3.5">
                <div className="text-[13px] font-semibold uppercase tracking-wider text-muted">Area to cover</div>
                <div className="font-display text-[32px] font-bold">{needed} sq ft</div>
              </div>
              <div className="bg-ground px-4 py-3.5">
                <div className="text-[13px] font-semibold uppercase tracking-wider text-muted">{unitLabel(product) === "per piece" ? "Pieces" : "Boxes"} needed</div>
                <div className="font-display text-[32px] font-bold text-brand">{needed > 0 ? boxes : 0}</div>
              </div>
            </div>
            <span className="text-sm text-muted">
              Based on {product.sqftPerBox} sq ft {unitLabel(product)}. Rounded up to whole {unitLabel(product) === "per piece" ? "pieces" : "boxes"}.
            </span>
          </section>
        )}

        <div className="flex flex-wrap items-stretch gap-3">
          <QtyStepper value={qty} onChange={setManualQty} label="Quantity" />
          <div className="min-w-[200px] flex-1">
            <AddToCartButton item={cartSnapshot(product)} qty={qty} color={color?.name} label={`Add to cart · ${money(each * qty)}`} />
          </div>
          <Link href="/quote" className="flex h-[52px] w-full items-center justify-center border-2 border-ink font-semibold text-ink no-underline">
            Request a contractor quote
          </Link>
        </div>

        <section aria-labelledby="specs-title" className="border-t border-line pt-5">
          <h2 id="specs-title" className="mb-3 font-display text-[26px] font-bold uppercase">
            Specifications
          </h2>
          <dl className="grid grid-cols-2 text-[15px]">
            {product.specs.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="border-b border-[#e7e4dd] py-2.5 text-muted">{k}</dt>
                <dd className="border-b border-[#e7e4dd] py-2.5 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
