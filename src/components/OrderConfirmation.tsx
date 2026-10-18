"use client";

import Link from "next/link";
import { money } from "@/lib/money";
import { useLastOrder } from "@/lib/order";
import { fullAddress, site } from "@/lib/site";
import { CheckIcon } from "./Icons";

export function OrderConfirmation() {
  const order = useLastOrder();

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-4 border border-line bg-surface p-10 text-center">
        <h1 className="font-display text-[40px] font-bold uppercase leading-none">No recent order</h1>
        <p className="text-muted">We couldn&apos;t find an order from this browser session.</p>
        <Link href="/" className="inline-flex h-[50px] items-center bg-brand px-7 font-semibold text-white no-underline hover:text-white">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 border border-line bg-surface px-6 py-12 text-center sm:px-10">
      <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-ok-soft text-ok">
        <CheckIcon size={36} />
      </span>
      <h1 className="font-display text-[44px] font-bold uppercase leading-none sm:text-[48px]">Order {order.number}</h1>
      <p className="max-w-[560px] text-lg text-muted">
        Thanks, {order.name.split(" ")[0]}. Your email app opened with your order filled in — <strong className="text-ink">press Send</strong> to submit it to
        {" "}{site.name}. We&apos;ll call {order.phone} to confirm stock and payment.
      </p>
      <a href={order.mailto} className="font-semibold text-brand-dark underline">
        Email app didn&apos;t open? Click here to send your order
      </a>

      <dl className="grid w-full grid-cols-1 gap-px border border-line bg-line text-left sm:grid-cols-2">
        <div className="bg-ground p-4">
          <dt className="text-[13px] font-semibold uppercase tracking-wider text-muted">{order.fulfillment === "delivery" ? "Delivery" : "Pickup"}</dt>
          <dd className="font-semibold">
            {order.date} · {order.fulfillment === "delivery" ? order.address : fullAddress}
          </dd>
        </div>
        <div className="bg-ground p-4">
          <dt className="text-[13px] font-semibold uppercase tracking-wider text-muted">Total</dt>
          <dd className="font-semibold">
            {money(order.total)} · {order.payment}
          </dd>
        </div>
      </dl>

      <ul className="w-full text-left text-[15px]">
        {order.lines.map((l) => (
          <li key={l.sku + l.name} className="flex justify-between gap-3 border-b border-line py-2">
            <span>
              {l.qty} × {l.name}
            </span>
            <span className="font-semibold">{money(l.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex h-[50px] items-center bg-brand px-7 font-semibold text-white no-underline hover:bg-brand-dark hover:text-white">
          Back to home
        </Link>
        <a href={site.phoneHref} className="inline-flex h-[50px] items-center border-2 border-ink px-7 font-semibold text-ink no-underline">
          Call {site.phone}
        </a>
      </div>
    </div>
  );
}
