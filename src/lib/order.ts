"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Fulfillment } from "./totals";

export type PlacedOrder = {
  number: string;
  name: string;
  phone: string;
  email: string;
  fulfillment: Fulfillment;
  address?: string;
  date: string;
  payment: string;
  notes?: string;
  lines: { name: string; sku: string; qty: number; lineTotal: number }[];
  subtotal: number;
  delivery: number;
  tax: number;
  total: number;
  /** true when the order was saved in the database */
  saved: boolean;
  /** set when the order was sent through the customer's email app instead */
  mailto?: string;
};

const KEY = "7s-last-order";
const noop = () => () => {};

/** Short order number. Call from event handlers only. */
export function newOrderNumber(): string {
  return `7S-${Date.now().toString().slice(-6)}`;
}

export function saveOrder(order: PlacedOrder) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    // ignore — confirmation page will show a generic message
  }
}

export function useLastOrder(): PlacedOrder | null {
  const raw = useSyncExternalStore(
    noop,
    () => {
      try {
        return window.sessionStorage.getItem(KEY);
      } catch {
        return null;
      }
    },
    () => null,
  );
  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PlacedOrder;
    } catch {
      return null;
    }
  }, [raw]);
}

// Next six days the store delivers (Mon–Sat). Computed in the browser only.
let cachedDates: string[] | null = null;
function computeDates(): string[] {
  if (cachedDates) return cachedDates;
  const fmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
  const out: string[] = [];
  const d = new Date();
  while (out.length < 6) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) out.push(fmt.format(d));
  }
  cachedDates = out;
  return out;
}

export function useDeliveryDates(): string[] | null {
  return useSyncExternalStore(noop, computeDates, () => null);
}
