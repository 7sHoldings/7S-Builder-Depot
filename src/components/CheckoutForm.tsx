"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cart, toLines, useCartItems } from "@/lib/cart";
import { postJson } from "@/lib/api";
import { openEmail, storeMailto } from "@/lib/mailto";
import { money } from "@/lib/money";
import { newOrderNumber, saveOrder, useDeliveryDates, type PlacedOrder } from "@/lib/order";
import { fullAddress } from "@/lib/site";
import { orderTotals, type Fulfillment } from "@/lib/totals";
import { FulfillmentPicker, Totals } from "./CartView";
import { Honeypot } from "./Honeypot";
import { LockIcon } from "./Icons";

const input = "h-12 border border-line-strong bg-surface px-3 font-normal focus:border-ink focus:outline-none";
const labelCls = "flex flex-col gap-1.5 text-sm font-semibold";

export function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();
  const lines = toLines(useCartItems());
  const dates = useDeliveryDates();
  const [fulfillment, setFulfillment] = useState<Fulfillment>(params.get("f") === "delivery" ? "delivery" : "pickup");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const t = orderTotals(subtotal, fulfillment);

  if (lines.length === 0 && !placing) {
    return (
      <div className="flex flex-col items-center gap-4 border border-line bg-surface px-6 py-14 text-center">
        <span className="font-display text-[32px] font-bold uppercase">Your cart is empty</span>
        <Link href="/#shop" className="inline-flex h-[50px] items-center bg-brand px-7 font-semibold text-white no-underline hover:text-white">
          Start shopping
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (placing) return;
    setError("");
    setPlacing(true);
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const date = get("date");
    const customer = {
      name: get("name"),
      phone: get("phone"),
      email: get("email"),
      fulfillment,
      address: fulfillment === "delivery" ? get("address") : undefined,
      date,
      payment: get("payment"),
      notes: get("notes") || undefined,
    };

    // 1) Save the order on the server (prices are re-checked there)
    const res = await postJson<{ orderNumber: string; subtotal: number; delivery: number; tax: number; total: number; lines: PlacedOrder["lines"] }>(
      "/api/orders",
      { ...customer, website: get("website"), items: lines.map((l) => ({ slug: l.slug, qty: l.qty, color: l.color })) },
    );
    if (res.ok) {
      const { orderNumber, lines: savedLines, ...totals } = res.data;
      saveOrder({ ...customer, ...totals, number: orderNumber, lines: savedLines, saved: true });
      cart.clear();
      router.push("/order-confirmed");
      return;
    }
    if (!res.fallback) {
      setError(res.message);
      setPlacing(false);
      return;
    }

    // 2) Fallback: database unavailable → send the order through the customer's email app
    const number = newOrderNumber();
    const order: Omit<PlacedOrder, "mailto" | "saved"> = {
      number,
      ...customer,
      lines: lines.map((l) => ({
        name: l.name + (l.color ? ` — ${l.color}` : ""),
        sku: l.sku,
        qty: l.qty,
        lineTotal: l.lineTotal,
      })),
      ...t,
    };
    const mailto = storeMailto(`New order ${number} — ${order.name}`, [
      `Order: ${number}`,
      `Name: ${order.name}`,
      `Phone: ${order.phone}`,
      `Email: ${order.email}`,
      `Fulfillment: ${fulfillment === "delivery" ? `Delivery to ${order.address}` : `Store pickup (${fullAddress})`}`,
      `Requested date: ${date}`,
      `Payment: ${order.payment}`,
      order.notes && `Notes: ${order.notes}`,
      "",
      "Items:",
      ...order.lines.map((l) => `- ${l.qty} × ${l.name} (SKU ${l.sku}) = ${money(l.lineTotal)}`),
      "",
      `Subtotal: ${money(t.subtotal)}`,
      `Delivery: ${money(t.delivery)}`,
      `Tax: ${money(t.tax)}`,
      `Total: ${money(t.total)}`,
    ]);
    saveOrder({ ...order, mailto, saved: false });
    cart.clear();
    openEmail(mailto);
    router.push("/order-confirmed");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-8">
      <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-5">
        <Honeypot />
        <section className="flex flex-col gap-4 border border-line bg-surface p-6">
          <h2 className="font-display text-[26px] font-bold uppercase">
            <span className="text-brand">1</span> · Contact
          </h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelCls}>
              Full name
              <input name="name" required autoComplete="name" className={input} />
            </label>
            <label className={labelCls}>
              Phone
              <input name="phone" type="tel" required autoComplete="tel" className={input} />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Email
              <input name="email" type="email" required autoComplete="email" className={input} />
            </label>
          </div>
        </section>

        <section className="flex flex-col gap-4 border border-line bg-surface p-6">
          <h2 className="font-display text-[26px] font-bold uppercase">
            <span className="text-brand">2</span> · Pickup or delivery
          </h2>
          <FulfillmentPicker value={fulfillment} onChange={setFulfillment} />
          {fulfillment === "delivery" ? (
            <label className={labelCls}>
              Delivery address
              <input name="address" required autoComplete="street-address" placeholder="Street, city, ZIP" className={input} />
            </label>
          ) : (
            <p className="text-muted">Pick up at {fullAddress}. We&apos;ll call when your order is ready.</p>
          )}
          <label className={labelCls}>
            {fulfillment === "delivery" ? "Preferred delivery date" : "Preferred pickup date"}
            <select name="date" required className={input}>
              {dates ? dates.map((d) => <option key={d}>{d}</option>) : <option value="">Loading dates…</option>}
            </select>
          </label>
          <label className={labelCls}>
            Notes (optional)
            <input name="notes" placeholder="Gate code, where to unload, job name / PO…" className={input} />
          </label>
        </section>

        <section className="flex flex-col gap-4 border border-line bg-surface p-6">
          <h2 className="font-display text-[26px] font-bold uppercase">
            <span className="text-brand">3</span> · Payment
          </h2>
          <fieldset className="flex flex-col gap-2.5">
            <legend className="sr-only">Payment method</legend>
            <label className="flex items-center gap-2.5">
              <input type="radio" name="payment" value={fulfillment === "delivery" ? "Pay on delivery" : "Pay at pickup"} defaultChecked className="h-[18px] w-[18px] accent-brand" />
              {fulfillment === "delivery" ? "Pay on delivery" : "Pay at pickup"} (card, cash or check)
            </label>
            <label className="flex items-center gap-2.5">
              <input type="radio" name="payment" value="Pro account invoice" className="h-[18px] w-[18px] accent-brand" />
              Pro account — invoice my company
            </label>
          </fieldset>
          <p className="text-sm text-muted">Online card payments are coming soon. We&apos;ll call to confirm your order and stock before you pay.</p>
        </section>
      </div>

      <aside aria-label="Order summary" className="flex w-full max-w-[420px] flex-[1_1_340px] flex-col gap-4 border border-line bg-surface p-6">
        <h2 className="font-display text-[28px] font-bold uppercase">Your order</h2>
        <ul className="flex flex-col gap-3 text-[15px]">
          {lines.map((l) => (
            <li key={l.slug + (l.color ?? "")} className="flex justify-between gap-3">
              <span>
                {l.name}
                {l.color && ` — ${l.color}`} × {l.qty}
              </span>
              <span className="font-semibold">{money(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-line pt-3.5">
          <Totals totals={t} fulfillment={fulfillment} />
        </div>
        {error && (
          <p role="alert" className="border-2 border-brand bg-brand-soft p-3 font-semibold text-brand-dark">
            {error}
          </p>
        )}
        <button type="submit" disabled={placing} className="h-14 bg-brand text-lg font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {placing ? "Placing order…" : "Place order"}
        </button>
        <span className="flex items-center gap-2 text-sm text-muted">
          <LockIcon size={16} /> No card details are collected online.
        </span>
      </aside>
    </form>
  );
}
