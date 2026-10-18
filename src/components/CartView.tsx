"use client";

import Link from "next/link";
import { useState } from "react";
import { cart, toLines, useCartItems } from "@/lib/cart";
import { money } from "@/lib/money";
import { site } from "@/lib/site";
import { orderTotals, type Fulfillment } from "@/lib/totals";
import { ProductVisual } from "./ProductVisual";
import { QtyStepper } from "./QtyStepper";

export function CartView() {
  const lines = toLines(useCartItems());
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const t = orderTotals(subtotal, fulfillment);
  const count = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <>
      <h1 className="mb-6 font-display text-[48px] font-bold uppercase leading-none sm:text-[56px]">
        Your cart{" "}
        {count > 0 && <span className="font-sans text-xl font-medium normal-case text-subtle">({count} {count === 1 ? "item" : "items"})</span>}
      </h1>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border border-line bg-surface px-6 py-14 text-center">
          <span className="font-display text-[32px] font-bold uppercase">Your cart is empty</span>
          <span className="text-muted">Browse vinyl, doors, windows and tile to start a project.</span>
          <Link href="/#shop" className="inline-flex h-[50px] items-center bg-brand px-7 font-semibold text-white no-underline hover:bg-brand-dark hover:text-white">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-start gap-8">
          <ul className="flex min-w-0 flex-[999_1_600px] flex-col gap-4">
            {lines.map((l) => (
              <li key={l.slug + (l.color ?? "")} className="flex flex-wrap items-center gap-5 border border-line bg-surface p-5">
                <Link href={`/product/${l.slug}`} className="shrink-0">
                  <ProductVisual visual={l.visual} label={l.name} className="h-[88px] w-[88px] border border-line" />
                </Link>
                <div className="flex min-w-[220px] flex-1 flex-col gap-0.5">
                  <Link href={`/product/${l.slug}`} className="text-lg font-semibold text-ink no-underline">
                    {l.name}
                    {l.color && ` — ${l.color}`}
                  </Link>
                  <span className="text-sm text-muted">
                    SKU {l.sku}
                    {l.sqftPerBox && ` · ${l.sqftPerBox} sq ft ${l.unitLabel}`}
                  </span>
                  <span className="text-sm text-muted">
                    {money(l.unitPrice)} {l.unitLabel}
                  </span>
                  <button type="button" onClick={() => cart.remove(l.slug, l.color)} className="self-start pt-2 text-sm text-brand-dark underline">
                    Remove
                  </button>
                </div>
                <QtyStepper size="md" label={`Quantity of ${l.name}`} value={l.qty} onChange={(n) => cart.setQty(l.slug, l.color, n)} />
                <span className="min-w-[110px] text-right font-display text-[26px] font-bold">{money(l.lineTotal)}</span>
              </li>
            ))}
            <li>
              <Link href="/#shop" className="font-semibold">
                ← Continue shopping
              </Link>
            </li>
          </ul>

          <aside aria-label="Order summary" className="flex w-full max-w-[420px] flex-[1_1_340px] flex-col gap-[18px] border border-line bg-surface p-6">
            <h2 className="font-display text-[28px] font-bold uppercase">Order summary</h2>
            <FulfillmentPicker value={fulfillment} onChange={setFulfillment} />
            <Totals totals={t} fulfillment={fulfillment} />
            <Link
              href={`/checkout?f=${fulfillment}`}
              className="flex h-[54px] items-center justify-center bg-brand text-[17px] font-semibold text-white no-underline hover:bg-brand-dark hover:text-white"
            >
              Checkout
            </Link>
            <Link href="/quote" className="flex h-[50px] items-center justify-center border-2 border-ink font-semibold text-ink no-underline">
              Need a bulk price? Request a quote
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}

export function FulfillmentPicker({ value, onChange }: { value: Fulfillment; onChange: (f: Fulfillment) => void }) {
  const opt = (f: Fulfillment, title: string, sub: string) => {
    const on = value === f;
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => onChange(f)}
        className={`flex flex-col items-start gap-0.5 border-2 p-3 text-left ${on ? "border-brand bg-brand-soft" : "border-line-strong bg-surface"}`}
      >
        <span className="font-semibold">{title}</span>
        <span className="text-sm">{sub}</span>
      </button>
    );
  };
  return (
    <fieldset>
      <legend className="mb-2.5 font-semibold">How do you want it?</legend>
      <div className="grid grid-cols-2 gap-2.5">
        {opt("pickup", "Store pickup", `Free · ${site.address.city}, ${site.address.state}`)}
        {opt("delivery", "Delivery", `${money(site.deliveryFee)} · Home or job site`)}
      </div>
    </fieldset>
  );
}

export function Totals({ totals, fulfillment }: { totals: ReturnType<typeof orderTotals>; fulfillment: Fulfillment }) {
  return (
    <dl className="flex flex-col gap-2.5">
      <div className="flex justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd className="font-semibold">{money(totals.subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted">{fulfillment === "delivery" ? "Delivery" : "Store pickup"}</dt>
        <dd className="font-semibold">{totals.delivery ? money(totals.delivery) : "Free"}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted">Estimated tax ({(site.taxRate * 100).toFixed(2)}%)</dt>
        <dd className="font-semibold">{money(totals.tax)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-3.5">
        <dt className="text-lg font-semibold">Total</dt>
        <dd className="font-display text-[34px] font-bold">{money(totals.total)}</dd>
      </div>
    </dl>
  );
}
