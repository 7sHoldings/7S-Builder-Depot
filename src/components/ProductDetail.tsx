"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cartSnapshot, priceLabel, unitLabel, unitPrice, type Product, type Variant } from "@/lib/catalog";
import { money } from "@/lib/money";
import { site } from "@/lib/site";
import { AddToCartButton } from "./AddToCartButton";
import { CheckIcon, RulerIcon } from "./Icons";
import { ProductImage } from "./ProductImage";
import { QtyStepper } from "./QtyStepper";

const heightName = (h: number) => (h === 80 ? `6'8" (80")` : h === 96 ? `8' (96")` : `${h}"`);

export function ProductDetail({ product, siblings }: { product: Product; siblings: Product[] }) {
  const variants = product.variants;
  const isDoor = variants.some((v) => v.swing);
  const isSqft = product.unit === "sqft" && !!product.sqftPerBox;

  // ---------- variant selection
  const heights = useMemo(() => [...new Set(variants.map((v) => v.heightIn).filter((h): h is number => h != null))].sort((a, b) => a - b), [variants]);
  const defaultVariant = useMemo(() => pickDefault(variants), [variants]);
  const [height, setHeight] = useState<number | undefined>(defaultVariant?.heightIn);
  const [width, setWidth] = useState<number | undefined>(defaultVariant?.widthIn);
  const [swing, setSwing] = useState<"RH" | "LH" | undefined>(defaultVariant?.swing);
  const [sizeId, setSizeId] = useState<string | undefined>(defaultVariant?.id);

  let variant: Variant | undefined;
  let widthsForHeight: { w: number; stock: number | null }[] = [];
  if (isDoor) {
    const h = height != null && heights.includes(height) ? height : heights[0];
    const inH = variants.filter((v) => v.heightIn === h);
    const ws = [...new Set(inH.map((v) => v.widthIn!))].sort((a, b) => a - b);
    const w = width != null && ws.includes(width) ? width : ws[0];
    widthsForHeight = ws.map((x) => ({ w: x, stock: sumStock(inH.filter((v) => v.widthIn === x)) }));
    const pair = inH.filter((v) => v.widthIn === w);
    variant = pair.find((v) => v.swing === swing && (v.stock ?? 1) > 0) ?? pair.find((v) => (v.stock ?? 1) > 0) ?? pair[0];
  } else if (variants.length) {
    variant = variants.find((v) => v.id === sizeId) ?? variants[0];
  }
  const doorPair = isDoor && variant ? variants.filter((v) => v.heightIn === variant!.heightIn && v.widthIn === variant!.widthIn) : [];

  // ---------- coverage calculator (flooring)
  const [len, setLen] = useState("12");
  const [wid, setWid] = useState("10");
  const [waste, setWaste] = useState(true);
  const area = Math.max(0, (parseFloat(len) || 0) * (parseFloat(wid) || 0));
  const needed = Math.ceil(Math.round(area * (waste ? 1.1 : 1) * 100) / 100);
  const boxes = isSqft && needed > 0 ? Math.ceil(needed / product.sqftPerBox!) : 1;

  // ---------- quantity
  const maxQty = variant?.stock ?? product.stock ?? 999;
  const [manualQty, setManualQty] = useState<number | null>(null);
  const qty = Math.max(1, Math.min(maxQty || 1, manualQty ?? (isSqft ? Math.max(1, boxes) : 1)));
  const each = unitPrice(product, variant);
  const soldOut = maxQty === 0;

  // ---------- photos
  const photos = variant?.image ? [variant.image] : product.images;
  const [photoIdx, setPhotoIdx] = useState(0);
  const mainPhoto = photos[Math.min(photoIdx, photos.length - 1)];

  const stockText = variant
    ? variant.stock == null
      ? `Available · pickup in ${site.address.city}`
      : variant.stock > 0
        ? `${variant.stock} in stock · pickup in ${site.address.city}`
        : "Out of stock in this size — call for availability"
    : product.stock == null
      ? `In stock · pickup in ${site.address.city}`
      : `${product.stock} in stock · pickup in ${site.address.city}`;

  const quoteHref = `/quote?item=${encodeURIComponent(`${product.name}${variant ? ` — ${variant.label}` : ""}`)}&cat=${product.category}`;

  return (
    <div className="flex flex-wrap items-start gap-12">
      {/* Gallery */}
      <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
        <ProductImage src={mainPhoto} visual={product.visual} alt={product.name} className="aspect-[4/5] border border-line" priority sizes="(max-width: 900px) 100vw, 600px" />
        {photos.length > 1 && (
          <div className="grid grid-cols-5 gap-2.5">
            {photos.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Photo ${i + 1}`}
                aria-pressed={i === photoIdx}
                onClick={() => setPhotoIdx(i)}
                className={`aspect-[4/5] ${i === photoIdx ? "outline outline-[3px] outline-offset-0 outline-ink" : "border border-line-strong"}`}
              >
                <ProductImage src={src} visual={product.visual} alt="" className="h-full w-full" sizes="120px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-subtle">
            {product.type} · SKU {variant?.sku ?? product.sku}
          </span>
          <h1 className="font-display text-[40px] font-bold uppercase leading-none sm:text-[48px]">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
            {product.price != null || variant?.price != null ? (
              <>
                <span className="font-display text-[44px] font-bold">{money(variant?.price ?? product.price ?? 0)}</span>
                <span className="text-subtle">
                  {priceLabel(product) ? `per sq ft · ${money(each ?? 0)} ${unitLabel(product)}` : "each"}
                  {product.category === "doors" && " · includes frame, casing & hinges"}
                </span>
              </>
            ) : (
              <span className="font-display text-[36px] font-bold text-brand-dark">{product.priceNote ?? "Price on request"}</span>
            )}
          </div>
          <span className={`inline-flex items-center gap-2 font-semibold ${soldOut ? "text-brand-dark" : "text-ok"}`}>
            {!soldOut && <CheckIcon size={18} />} {stockText}
          </span>
          <p className="mt-2 text-muted">{product.description}</p>
        </div>

        {/* Vinyl: other colors */}
        {siblings.length > 1 && (
          <fieldset>
            <legend className="mb-2.5 font-semibold">Color: {product.name}</legend>
            <div className="flex flex-wrap gap-3">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={`/product/${s.slug}`}
                  aria-label={s.name}
                  aria-current={s.slug === product.slug ? "true" : undefined}
                  className={`block h-[90px] w-[72px] overflow-hidden ${s.slug === product.slug ? "outline outline-[3px] outline-ink" : "border border-line-strong"}`}
                >
                  <ProductImage src={s.images[0]} visual={s.visual} alt="" className="h-full w-full" sizes="72px" />
                </Link>
              ))}
            </div>
          </fieldset>
        )}

        {/* Doors: height → width → swing */}
        {isDoor && variant && (
          <>
            {heights.length > 1 && (
              <ChipGroup label="Height">
                {heights.map((h) => (
                  <Chip key={h} on={h === variant!.heightIn} onClick={() => { setHeight(h); setManualQty(null); }}>
                    {heightName(h)}
                  </Chip>
                ))}
              </ChipGroup>
            )}
            <ChipGroup label={`Width${heights.length === 1 ? ` (${heightName(heights[0])} tall)` : ""}`}>
              {widthsForHeight.map(({ w, stock }) => (
                <Chip key={w} on={w === variant!.widthIn} onClick={() => { setWidth(w); setManualQty(null); }} sub={stock != null ? `${stock} in stock` : undefined}>
                  {w}&quot;
                </Chip>
              ))}
            </ChipGroup>
            <div>
              <ChipGroup label="Swing (handing)" hint="Face the door so it opens toward you — hinges on your right = right-hand.">
                {(["RH", "LH"] as const).map((s) => {
                  const v = doorPair.find((x) => x.swing === s);
                  const n = v?.stock ?? null;
                  const disabled = !v || n === 0;
                  return (
                    <Chip key={s} on={variant!.swing === s} disabled={disabled} onClick={() => { setSwing(s); setManualQty(null); }} sub={n == null ? undefined : n > 0 ? `${n} in stock` : "Out of stock"}>
                      {s === "RH" ? "Right-hand" : "Left-hand"}
                    </Chip>
                  );
                })}
              </ChipGroup>
            </div>
          </>
        )}

        {/* Windows: size */}
        {!isDoor && variants.length > 1 && (
          <ChipGroup label={`${variants.every((v) => v.widthIn && v.heightIn) ? "Size (W × H)" : "Option"}: ${variant?.label ?? ""}`}>
            {variants.map((v) => (
              <Chip key={v.id} on={v.id === variant?.id} onClick={() => { setSizeId(v.id); setPhotoIdx(0); }}>
                {v.label}
              </Chip>
            ))}
          </ChipGroup>
        )}

        {/* Flooring calculator */}
        {isSqft && (
          <section aria-labelledby="calc-title" className="flex flex-col gap-4 border border-line bg-surface p-5">
            <div className="flex items-center gap-2.5">
              <RulerIcon size={24} className="text-brand" />
              <h2 id="calc-title" className="font-display text-[26px] font-bold uppercase">
                How much do I need?
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Room length (ft)" value={len} onChange={(v) => { setLen(v); setManualQty(null); }} />
              <NumField label="Room width (ft)" value={wid} onChange={(v) => { setWid(v); setManualQty(null); }} />
            </div>
            <label className="flex items-center gap-2.5">
              <input type="checkbox" checked={waste} onChange={(e) => { setWaste(e.target.checked); setManualQty(null); }} className="h-[18px] w-[18px] accent-brand" />
              Add 10% for cuts &amp; waste
            </label>
            <div className="grid grid-cols-3 gap-px border border-line bg-line" aria-live="polite">
              <Stat label="Area" value={`${needed} sq ft`} />
              <Stat label="Boxes" value={String(needed > 0 ? boxes : 0)} accent />
              <Stat label="Total" value={money((each ?? 0) * (needed > 0 ? boxes : 0))} />
            </div>
            <span className="text-sm text-muted">
              Based on {product.sqftPerBox} sq ft per box at {money(product.price ?? 0)} / sq ft. Rounded up to whole boxes.
            </span>
          </section>
        )}

        {/* Buy / quote */}
        {each != null ? (
          <div className="flex flex-wrap items-stretch gap-3">
            <QtyStepper value={qty} onChange={setManualQty} label="Quantity" max={Math.max(1, maxQty)} />
            <div className="min-w-[220px] flex-1">
              {soldOut ? (
                <Link href={quoteHref} className="flex h-[54px] items-center justify-center bg-ink font-semibold text-white no-underline">
                  Ask about availability
                </Link>
              ) : (
                <AddToCartButton item={cartSnapshot(product, variant)} qty={qty} label={`Add to cart · ${money(each * qty)}`} />
              )}
            </div>
            <Link href={quoteHref} className="flex h-[50px] w-full items-center justify-center border-2 border-ink font-semibold text-ink no-underline">
              {product.category === "doors" ? "Need 10+ doors? Request a quote" : "Request a contractor quote"}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 border border-line bg-surface p-5">
            <p className="font-semibold">Pricing depends on quantity and options — tell us what you need and we&apos;ll send a price.</p>
            <Link href={quoteHref} className="flex h-[54px] items-center justify-center bg-brand text-[17px] font-semibold text-white no-underline hover:bg-brand-dark hover:text-white">
              Get a price for {variant ? variant.label : "this item"}
            </Link>
            <a href={site.phoneHref} className="text-center font-semibold text-ink">
              Or call {site.phone}
            </a>
          </div>
        )}

        <section aria-labelledby="specs-title" className="border-t border-line pt-5">
          <h2 id="specs-title" className="mb-3 font-display text-[26px] font-bold uppercase">
            Details
          </h2>
          <dl className="grid grid-cols-2 text-[15px]">
            {variant?.widthIn != null && <Spec k="Size (W × H)" v={`${variant.widthIn}" × ${variant.heightIn}"`} />}
            {product.specs.map(([k, v]) => (
              <Spec key={k} k={k} v={v} />
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}

function pickDefault(vs: Variant[]): Variant | undefined {
  // Prefer the size with the most stock so the page opens on something available
  const tracked = vs.filter((v) => v.stock != null);
  if (tracked.length) return [...tracked].sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))[0];
  return vs[0];
}

function sumStock(vs: Variant[]): number | null {
  const t = vs.filter((v) => v.stock != null);
  return t.length ? t.reduce((n, v) => n + (v.stock ?? 0), 0) : null;
}

function ChipGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 font-semibold">{label}</legend>
      {hint && <p className="-mt-1.5 mb-2.5 text-sm text-muted">{hint}</p>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({ on, onClick, disabled, sub, children }: { on: boolean; onClick: () => void; disabled?: boolean; sub?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-12 flex-col items-center justify-center px-4 py-1.5 font-semibold leading-tight ${
        on ? "border border-night bg-night text-white" : "border border-line-strong bg-surface text-ink hover:border-ink"
      } disabled:cursor-not-allowed disabled:opacity-45`}
    >
      <span>{children}</span>
      {sub && <span className="text-xs font-medium opacity-80">{sub}</span>}
    </button>
  );
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      {label}
      <input type="number" inputMode="decimal" min="0" value={value} onChange={(e) => onChange(e.target.value)} className="h-12 border border-line-strong px-3 text-lg font-normal" />
    </label>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-ground px-4 py-3.5">
      <div className="text-[13px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={`font-display text-[28px] font-bold ${accent ? "text-brand" : ""}`}>{value}</div>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="contents">
      <dt className="border-b border-[#e7e4dd] py-2.5 text-muted">{k}</dt>
      <dd className="border-b border-[#e7e4dd] py-2.5 font-semibold">{v}</dd>
    </div>
  );
}
