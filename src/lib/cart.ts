"use client";

import { useSyncExternalStore } from "react";
import type { CartSnapshot } from "./catalog";

// The cart lives in the browser (localStorage), so it survives page reloads.
// Each line keeps a snapshot of the product's price; the server re-prices
// everything from the database when the order is placed.

export type CartItem = CartSnapshot & { qty: number; color?: string };
export type CartLine = CartItem & { lineTotal: number };

const KEY = "7s-cart-v2";
const EMPTY: CartItem[] = [];

let items: CartItem[] | null = null;
const listeners = new Set<() => void>();

function isItem(i: unknown): i is CartItem {
  if (typeof i !== "object" || i === null) return false;
  const o = i as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    typeof o.name === "string" &&
    typeof o.sku === "string" &&
    typeof o.unitPrice === "number" &&
    typeof o.unitLabel === "string" &&
    typeof o.qty === "number" &&
    o.qty >= 1 &&
    typeof o.visual === "object"
  );
}

function load(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isItem) : [];
  } catch {
    return [];
  }
}

function current(): CartItem[] {
  if (items === null) items = load();
  return items;
}

function save(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable (private mode). The cart still works for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      items = load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const sameLine = (a: CartItem, slug: string, color?: string) => a.slug === slug && (a.color ?? "") === (color ?? "");

export const cart = {
  add(product: CartSnapshot, qty: number, color?: string) {
    if (qty < 1) return;
    const list = current();
    const existing = list.find((i) => sameLine(i, product.slug, color));
    save(
      existing
        ? list.map((i) => (sameLine(i, product.slug, color) ? { ...i, ...product, qty: Math.min(999, i.qty + qty) } : i))
        : [...list, { ...product, qty, color }],
    );
  },
  setQty(slug: string, color: string | undefined, qty: number) {
    save(current().map((i) => (sameLine(i, slug, color) ? { ...i, qty: Math.max(1, Math.min(999, qty)) } : i)));
  },
  remove(slug: string, color?: string) {
    save(current().filter((i) => !sameLine(i, slug, color)));
  },
  clear() {
    save([]);
  },
};

export function useCartItems(): CartItem[] {
  return useSyncExternalStore(subscribe, current, () => EMPTY);
}

export function toLines(list: CartItem[]): CartLine[] {
  return list.map((i) => ({ ...i, lineTotal: Math.round(i.unitPrice * i.qty * 100) / 100 }));
}

export function useCartCount(): number {
  return useCartItems().reduce((n, i) => n + i.qty, 0);
}
