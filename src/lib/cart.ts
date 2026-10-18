"use client";

import { useSyncExternalStore } from "react";
import { getProduct, unitPrice, type Product } from "./catalog";

// The cart lives in the browser (localStorage), so it survives page reloads.
// When you add accounts or a database later, swap this store for a server one.

export type CartItem = { slug: string; qty: number; color?: string };
export type CartLine = CartItem & { product: Product; unitPrice: number; lineTotal: number };

const KEY = "7s-cart-v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] | null = null;
const listeners = new Set<() => void>();

function load(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        typeof i === "object" && i !== null && typeof i.slug === "string" && typeof i.qty === "number" && !!getProduct(i.slug),
    );
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
  add(slug: string, qty: number, color?: string) {
    if (qty < 1) return;
    const list = current();
    const existing = list.find((i) => sameLine(i, slug, color));
    save(
      existing
        ? list.map((i) => (sameLine(i, slug, color) ? { ...i, qty: i.qty + qty } : i))
        : [...list, { slug, qty, color }],
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
  return list.flatMap((i) => {
    const product = getProduct(i.slug);
    if (!product) return [];
    const price = unitPrice(product);
    return [{ ...i, product, unitPrice: price, lineTotal: price * i.qty }];
  });
}

export function useCartCount(): number {
  return useCartItems().reduce((n, i) => n + i.qty, 0);
}
